import { buildOrganizationEmployeeDidWeb, StableActorContactKinds } from 'antifraud-data-utils-ts/organization-identity'
import { encodeMultibaseSha3 } from 'antifraud-data-utils-ts/encoding'
import { REPOSITORY_SAFE_EXAMPLES as e } from './repository-privacy.js'
import { HealthcareActorRoles, HealthcareActorRoleCodes, HealthcareRoleFamilies, HealthcareRolesByFamily } from './healthcare-roles.js'
import { ServiceCapability } from './service-capabilities.js'
import { getProfessionalIdentityVC, buildUnsignedProfessionalIdentityVpJwt } from './professional-smart.js'
import { getIndividualControllerIdentityVC, getIndividualMemberIdentityVC, buildUnsignedIndividualMemberIdentityVpJwt } from './individual-smart.js'
import { ClaimInterTenantAccessContract as C, buildInterTenantAccessContractCredential } from './inter-tenant-access-contract.js'
import { buildSubjectIdentityBindingCredential } from './subject-identity-binding.js'

/** Fresh deterministic data for examples and tests; compact presentations are explicitly unsigned. */
export function createIdentityPresentationExample() {
  const actorDid = buildOrganizationEmployeeDidWeb({ organizationDidWeb: e.didWeb, contactKind: StableActorContactKinds.Email, contact: e.firstContactEmail, role: HealthcareActorRoleCodes.GeneralistMedicalPractitioner })
  const subjectDid = `${e.didWeb}:individual:multibase:${encodeMultibaseSha3(e.resourceUuid, 384)}`
  const aliasDid = `${e.didWeb}:individual:multibase:${encodeMultibaseSha3(e.demoOrganizationUuids.healthCare, 384)}`
  const consumerDid = `${e.didWeb}:consumer`
  const relationshipEntry = Object.values(HealthcareRolesByFamily[HealthcareRoleFamilies.PersonalRelationshipHl7])[0]
  const relationship = relationshipEntry.claim
  const professionalInput = {
    actorDid, role: HealthcareActorRoles.GeneralistMedicalPractitioner,
    clientId: e.resourceUuid, email: e.firstContactEmail, telephone: e.phoneE164,
    credentialMaterial: e.resourceUuid,
  }
  const memberInput = { actorDid: `${subjectDid}:member:${encodeMultibaseSha3(e.firstContactEmail, 384)}:${relationshipEntry.code}`, subjectDid, relationship, clientId: `${e.resourceUuid}-member-device`, email: e.firstContactEmail, telephone: e.phoneE164, credentialMaterial: e.resourceUuid }
  const timing = { nowSeconds: e.organizationScopedResources.slotStartEpochSeconds, nonce: e.resourceUuid }
  const contractClaims = {
    [C.identifier]: e.resourceUuid, [C.status]: 'executed',
    [C.appliesStart]: e.organizationScopedResources.slotStart,
    [C.providerOrganization]: e.didWeb, [C.consumerOrganization]: consumerDid,
    [C.providerAuthorizedSignatory]: actorDid,
    [C.consumerAuthorizedSignatory]: `${consumerDid}:signatory`,
    [C.capability]: ServiceCapability.IndexReader,
  }
  return {
    actorDid, subjectDid, aliasDid, consumerDid, professionalInput, memberInput,
    professionalCredential: getProfessionalIdentityVC(professionalInput),
    controllerCredential: getIndividualControllerIdentityVC({ actorDid: `${subjectDid}:member:${encodeMultibaseSha3(e.individualEmail, 384)}:${HealthcareActorRoles.Controller}`, subjectDid, relationship: HealthcareActorRoles.Controller, email: e.individualEmail, credentialMaterial: e.resourceUuid }),
    memberCredential: getIndividualMemberIdentityVC(memberInput),
    professionalVpToken: buildUnsignedProfessionalIdentityVpJwt(professionalInput, timing),
    memberVpToken: buildUnsignedIndividualMemberIdentityVpJwt(memberInput, timing),
    contractClaims,
    contractCredential: buildInterTenantAccessContractCredential({ claims: contractClaims, issuer: e.didWeb, validFrom: e.organizationScopedResources.slotStart }),
    subjectBindingCredential: buildSubjectIdentityBindingCredential({ issuerDid: e.didWeb, subjectDid, aliasDids: [aliasDid], sectors: [e.sector], validFrom: e.organizationScopedResources.slotStart }),
  }
}
