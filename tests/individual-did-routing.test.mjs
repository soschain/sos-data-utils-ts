// Flow contract: parse the existing individual/member DID routing profile with governed synthetic data and owned multibase encoding; parsing does not establish identity, contact possession, role authority or permissions.
import assert from 'node:assert/strict'
import test from 'node:test'
import { encodeMultibaseSha3 } from 'antifraud-data-utils-ts/encoding'
import { REPOSITORY_SAFE_EXAMPLES as e } from '../dist/repository-privacy.js'
import { HealthcareActorRoles, HealthcareActorRoleCodes } from '../dist/healthcare-roles.js'
import { getOrganizationDidFromIndividualDid, getProviderDidFromSubjectDid, parseIndividualMemberDidWeb } from '../dist/individual-did-routing.js'

const individual = `${e.didWeb}:individual:multibase:${encodeMultibaseSha3(e.resourceUuid)}`
const memberId = encodeMultibaseSha3(e.firstContactEmail)
const member = `${individual}:member:${memberId}:${HealthcareActorRoles.Controller}`

test('resolves the provider prefix for individual, employee and member routes without granting authority', () => {
  assert.equal(getOrganizationDidFromIndividualDid(individual), e.didWeb)
  assert.equal(getOrganizationDidFromIndividualDid(member), e.didWeb)
  assert.equal(getProviderDidFromSubjectDid(member), e.didWeb)
  assert.equal(getOrganizationDidFromIndividualDid(`${e.didWeb}:employee:${memberId}:${HealthcareActorRoleCodes.GeneralistMedicalPractitioner}`), e.didWeb)
  assert.equal(getOrganizationDidFromIndividualDid(e.didWeb), e.didWeb)
})
test('preserves the exact hosted member suffix projection', () => {
  assert.deepEqual(parseIndividualMemberDidWeb(member), { individualDidWeb: individual, memberId, roleValue: HealthcareActorRoles.Controller })
  assert.deepEqual(parseIndividualMemberDidWeb(` ${member} `), parseIndividualMemberDidWeb(member))
})
test('rejects malformed, missing, non-individual and extra member suffixes', () => {
  for (const value of [e.didWeb, `${e.didWeb}:member:${memberId}:${HealthcareActorRoles.Controller}`, `${individual}:member:invalid:${HealthcareActorRoles.Controller}`, `${individual}:member:${memberId}:`, `${member}:extra`, `${individual}:member:${memberId}:role:${HealthcareActorRoles.Controller}`]) assert.throws(() => parseIndividualMemberDidWeb(value))
})
