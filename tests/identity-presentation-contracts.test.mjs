// Flow contract: preserve governed synthetic identity credential projections and signing bytes, keep employee/controller/member authority separate, and match subject or contract evidence only after external signature verification. No ledger, endpoint or persistence is created by these data helpers.
import assert from 'node:assert/strict'
import test from 'node:test'
import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { CryptographyService, Content } from 'antifraud-data-utils-ts/cryptography'
import { REPOSITORY_SAFE_EXAMPLES as e } from '../dist/repository-privacy.js'
import { HealthcareActorRoles, HealthcareRolesByFamily, HealthcareRoleFamilies } from '../dist/healthcare-roles.js'
import { ServiceCapability } from '../dist/service-capabilities.js'
import { getProfessionalIdentityVC, buildProfessionalIdentityVpPayload, buildUnsignedProfessionalIdentityVpJwt, getMatchingProfessionalCredentialFromVpToken } from '../dist/professional-smart.js'
import { getIndividualControllerIdentityVC, getIndividualMemberIdentityVC, summarizeIndividualMemberIdentityCredential, buildUnsignedIndividualMemberIdentityVpJwt, getMatchingIndividualMemberCredentialFromVpToken } from '../dist/individual-smart.js'
import { createVP, addVC, getVpCredentials, getServiceControllerCredentialFromVpToken, prepareForSignature, prepareBytesForSignature, buildVpTokenCompact } from '../dist/vp-token.js'
import { buildSubjectIdentityBindingCredential, summarizeSubjectIdentityBinding, matchesSubjectIdentityBinding } from '../dist/subject-identity-binding.js'
import { ClaimInterTenantAccessContract as C, buildInterTenantAccessContractCredential, summarizeInterTenantAccessContract, matchesInterTenantAccessContract } from '../dist/inter-tenant-access-contract.js'
import { readVerifiablePresentationJwtPayload, buildFhirEmergencyAuthorizationDetails, SmartIntrospectionExtensionFields } from '../dist/smart-authorization-profile.js'
import { prepareJwtForSignature, compactJWT, getDataJWT } from '../dist/jwt.js'

const actorDid = `${e.didWeb}:employee`
const subjectDid = `${e.didWeb}:individual`
const aliasDid = `${e.didWeb}:individual-alias`
const consumerDid = `${e.didWeb}:consumer`
const now = e.organizationScopedResources.slotStart
const nowSeconds = e.organizationScopedResources.slotStartEpochSeconds
const role = HealthcareActorRoles.GeneralistMedicalPractitioner
const relationship = Object.values(HealthcareRolesByFamily[HealthcareRoleFamilies.PersonalRelationshipHl7])[0].claim
const identity = { actorDid, role, email: e.firstContactEmail, telephone: e.phoneE164, credentialMaterial: e.resourceUuid }
// Captured from reviewed synthetic projection bytes; no predecessor dependency is loaded.
const emailAlias = 'urn:multibase:zW1bK7L1uB7dbgsYUkXn4ZDEcPwjisvqYTuRZzK3wbog8ML'
const phoneAlias = 'urn:multibase:zW1giLKJrjrNjHVQVR15bMZUu8AgojUEUW2BL66v1Z6Fojp'
const professional = {
  type: ['VerifiableCredential', 'EmployeeCredential'],
  credentialSubject: { id: actorDid, hasOccupation: role, sameAs: emailAlias, 'org.schema.Person.telephone': phoneAlias, 'org.schema.Person.hasCredential.material': e.resourceUuid },
}

test('preserves the exact professional credential projection and public continuity hashes', () => {
  assert.deepEqual(getProfessionalIdentityVC(identity), professional)
})
test('preserves deterministic VP signing bytes and keeps assembly distinct from verification', () => {
  const payload = buildProfessionalIdentityVpPayload({ ...identity, clientId: e.resourceUuid })
  assert.deepEqual(payload, { vp: { holder: e.resourceUuid, verifiableCredential: [professional] } })
  const header = { alg: 'ML-DSA-44', kid: e.resourceUuid }
  const input = prepareJwtForSignature(header, payload)
  assert.equal(input.signingInput, `${Buffer.from(JSON.stringify(header)).toString('base64url')}.${Buffer.from(JSON.stringify(payload)).toString('base64url')}`)
  assert.deepEqual(prepareBytesForSignature(header, payload), new TextEncoder().encode(input.signingInput))
  assert.equal(prepareForSignature(header, payload).signingInput, input.signingInput)
  assert.equal(buildVpTokenCompact(input.encodedHeader, input.encodedPayload, 'synthetic-signature'), `${input.signingInput}.synthetic-signature`)
})
test('matches only the exact employee actor and occupation in a decoded presentation', () => {
  const token = buildUnsignedProfessionalIdentityVpJwt({ ...identity, clientId: e.resourceUuid }, { nowSeconds, nonce: e.resourceUuid })
  assert.equal(getMatchingProfessionalCredentialFromVpToken(token, { actorDid, role })?.actorDid, actorDid)
  assert.equal(getMatchingProfessionalCredentialFromVpToken(token, { actorDid: subjectDid, role }), undefined)
  assert.equal(getMatchingProfessionalCredentialFromVpToken(token, { actorDid, role: HealthcareActorRoles.Controller }), undefined)
})
test('keeps individual controller and member credentials distinct and binds member to the subject', () => {
  const input = { ...identity, subjectDid, relationship }
  const controller = getIndividualControllerIdentityVC(input)
  const member = getIndividualMemberIdentityVC(input)
  assert.deepEqual(controller.type, ['VerifiableCredential', 'IndividualControllerCredential'])
  assert.deepEqual(member.type, ['VerifiableCredential', 'IndividualMemberCredential'])
  assert.equal(summarizeIndividualMemberIdentityCredential(controller), undefined)
  assert.equal(summarizeIndividualMemberIdentityCredential(member)?.subjectDid, subjectDid)
  assert.equal(summarizeIndividualMemberIdentityCredential({ ...member, credentialSubject: { id: actorDid, relationship } }), undefined)
})
test('does not reuse a member credential for another subject or relationship', () => {
  const token = buildUnsignedIndividualMemberIdentityVpJwt({ ...identity, subjectDid, relationship, clientId: e.resourceUuid }, { nowSeconds })
  assert.equal(getMatchingIndividualMemberCredentialFromVpToken(token, { actorDid, subjectDid, relationship })?.actorDid, actorDid)
  assert.equal(getMatchingIndividualMemberCredentialFromVpToken(token, { actorDid, subjectDid: aliasDid }), undefined)
  assert.equal(getMatchingIndividualMemberCredentialFromVpToken(token, { actorDid, subjectDid, relationship: HealthcareActorRoles.Controller }), undefined)
})
test('retains supplied presentation times and never substitutes representative for service controller', () => {
  const vp = createVP({ iss: e.didWeb, iat: nowSeconds, exp: nowSeconds + 60, jti: e.resourceUuid, nonce: e.resourceUuid })
  addVC(vp, { type: ['LegalRepresentativeCredential'], credentialSubject: { id: actorDid } })
  assert.equal(vp.iat, nowSeconds)
  assert.equal(vp.exp, nowSeconds + 60)
  assert.equal(getVpCredentials(JSON.stringify(vp)).length, 1)
  assert.equal(getServiceControllerCredentialFromVpToken(JSON.stringify(vp)), undefined)
  addVC(vp, { type: ['ServiceControllerCredential'], credentialSubject: { owner: { id: actorDid } } })
  assert.deepEqual(getServiceControllerCredentialFromVpToken(JSON.stringify(vp)).type, ['ServiceControllerCredential'])
})
test('matches a signed-profile subject alias only for a trusted issuer, time and sector', () => {
  const credential = buildSubjectIdentityBindingCredential({ issuerDid: e.didWeb, subjectDid, aliasDids: [aliasDid], sectors: [e.sector], validFrom: now })
  const summary = summarizeSubjectIdentityBinding(credential)
  const criteria = { trustedIssuerDids: [e.didWeb], requiredSubjectDids: [subjectDid, aliasDid], sector: e.sector, now }
  assert.equal(matchesSubjectIdentityBinding(summary, criteria), true)
  assert.equal(matchesSubjectIdentityBinding(summary, { ...criteria, trustedIssuerDids: [] }), false)
  assert.equal(matchesSubjectIdentityBinding(summary, { ...criteria, requiredSubjectDids: [actorDid] }), false)
  assert.equal(matchesSubjectIdentityBinding(summary, { ...criteria, sector: `${e.sector}-other` }), false)
  assert.equal(matchesSubjectIdentityBinding({ ...summary, validUntil: '2000-01-01T00:00:00Z' }, criteria), false)
  assert.throws(() => buildSubjectIdentityBindingCredential({ issuerDid: e.didWeb, subjectDid: `${subjectDid}:card:physical`, aliasDids: [aliasDid], sectors: [e.sector], validFrom: now }))
})
const contractClaims = {
  [C.identifier]: e.resourceUuid, [C.status]: 'executed', [C.appliesStart]: now,
  [C.providerOrganization]: e.didWeb, [C.consumerOrganization]: consumerDid,
  [C.providerAuthorizedSignatory]: actorDid, [C.consumerAuthorizedSignatory]: `${consumerDid}:signatory`,
  [C.capability]: ServiceCapability.IndexReader,
}
test('requires both contract-agreement proof bindings for cross-tenant authorization', () => {
  const credential = buildInterTenantAccessContractCredential({ claims: contractClaims, issuer: e.didWeb, validFrom: now })
  const criteria = { providerOrganizationDid: e.didWeb, consumerOrganizationDid: consumerDid, requiredCapabilities: [ServiceCapability.IndexReader], now }
  assert.equal(matchesInterTenantAccessContract(summarizeInterTenantAccessContract(credential), criteria), false)
  const proof = [actorDid, `${consumerDid}:signatory`].map(did => ({ proofPurpose: 'contractAgreement', verificationMethod: `${did}#key` }))
  const summary = summarizeInterTenantAccessContract({ ...credential, proof })
  assert.equal(matchesInterTenantAccessContract(summary, criteria), true)
  assert.equal(matchesInterTenantAccessContract(summary, { ...criteria, consumerOrganizationDid: actorDid }), false)
  assert.equal(matchesInterTenantAccessContract(summary, { ...criteria, requiredCapabilities: [ServiceCapability.IndexProvider] }), false)
})
test('distinguishes direct VC2 presentations from explicit legacy wrappers and rejects ambiguity', () => {
  const direct = { type: ['VerifiablePresentation'], holder: actorDid, verifiableCredential: [professional] }
  assert.equal(readVerifiablePresentationJwtPayload(direct).format, 'vc-data-model-2.0')
  assert.equal(readVerifiablePresentationJwtPayload({ vp: direct }).format, 'legacy-jwt-vp')
  assert.throws(() => readVerifiablePresentationJwtPayload({ ...direct, vp: direct }))
  assert.equal(SmartIntrospectionExtensionFields.VpToken, 'vp_token')
})
test('projects read-only emergency details without making a write scope read-only', () => {
  const details = buildFhirEmergencyAuthorizationDetails({ authorizationDetailType: e.httpsBaseUrl, subject: subjectDid, scopes: ['patient/Composition.rs'] })
  assert.deepEqual(details[0].actions, ['read'])
  assert.deepEqual(details[0].privileges, ['BTG'])
  assert.throws(() => buildFhirEmergencyAuthorizationDetails({ authorizationDetailType: e.httpsBaseUrl, subject: subjectDid, scopes: ['patient/Composition.cruds'] }))
})
test('preserves UTF8 compressed payload round trips without treating decoding as verification', async () => {
  const payload = { label: 'Identité clínica', vp: { verifiableCredential: [professional] } }
  const compact = await compactJWT({ alg: 'ES384', zip: 'DEF' }, payload, Uint8Array.of(1, 2, 3))
  assert.deepEqual((await getDataJWT(compact)).payload, payload)
})


test('the prepared identity bytes produce a real verifiable ML-DSA signature and reject changed data', async () => {
  const cryptography = new CryptographyService({
    async getRandomBytes(length) { return randomBytes(length) },
    async digestString(value, algorithm) { return createHash(algorithm.replace('-', '').toLowerCase()).update(value).digest('hex') },
    randomUUID,
  })
  const pair = await cryptography.generateKeyPairMlDsa(undefined, 'ML-DSA-44')
  const payload = buildProfessionalIdentityVpPayload({ ...identity, clientId: e.resourceUuid })
  const header = { alg: 'ML-DSA-44', kid: pair.publicJWKey.kid }
  const signing = prepareForSignature(header, payload)
  const signature = await cryptography.signBytes(prepareBytesForSignature(header, payload), pair.secretKeyBytes, 'ML-DSA-44')
  const compact = buildVpTokenCompact(signing.encodedHeader, signing.encodedPayload, Content.bytesToRawBase64UrlSafe(signature))
  assert.equal(await cryptography.verifyJws(compact, pair.publicJWKey), true)
  const changed = `${signing.encodedHeader}.${Content.objectToRawBase64UrlSafe({ ...payload, sub: subjectDid })}.${Content.bytesToRawBase64UrlSafe(signature)}`
  assert.equal(await cryptography.verifyJws(changed, pair.publicJWKey), false)
})
