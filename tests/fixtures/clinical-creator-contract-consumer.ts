// Flow contract: actor identity, assignment identity and owner are separate required fields; source author and attesting assignment are separate provenance fields.
import {
  FhirIpsCreatorKinds, ClinicalResourceReplacementDecision,
  type ClinicalCreatorBinding, type ClinicalCreatorBindingInput,
  type AuthenticatedClinicalCreatorEvidence, type FhirIpsCreatorProvenanceInput,
  type FhirIpsCreatorProvenance, type ClinicalResourceReplacementInput,
} from 'sos-data-utils-ts/clinical-creator-contract'
import { REPOSITORY_SAFE_EXAMPLES as SAFE } from 'sos-data-utils-ts/repository-privacy'
import { HealthcareActorRoles } from 'sos-data-utils-ts/healthcare-roles'

const actor = `urn:uuid:${SAFE.resourceUuid}`
const assignment = `urn:uuid:${SAFE.organizationScopedResources.departmentUuid}`
const binding: ClinicalCreatorBinding = {
  kind: FhirIpsCreatorKinds.Professional, actorIdentifier: actor,
  authorIdentifier: assignment, ownerIdentifier: SAFE.didWeb,
  role: HealthcareActorRoles.GeneralistMedicalPractitioner,
  actorDids: [SAFE.didWeb], verifiedContactIdentifiers: [], dcrClientIds: [], keyIds: [],
}
const draft: ClinicalCreatorBindingInput = {
  kind: binding.kind, actorIdentifier: SAFE.resourceUuid,
  assignmentIdentifier: SAFE.organizationScopedResources.departmentUuid,
  ownerIdentifier: binding.ownerIdentifier, role: binding.role,
}
const evidence: AuthenticatedClinicalCreatorEvidence = { actorDid: SAFE.didWeb }
const provenanceInput: FhirIpsCreatorProvenanceInput = {
  kind: FhirIpsCreatorKinds.Professional, actorIdentifier: actor, authorIdentifier: assignment,
  organizationReference: SAFE.didWeb, role: binding.role,
}
const provenance: FhirIpsCreatorProvenance = {
  authorReference: SAFE.didWeb,
  attesters: [{ mode: 'professional', party: { reference: assignment } }], entries: [],
}
const successor: ClinicalResourceReplacementInput = {
  existing: { resourceId: SAFE.resourceUuid, authorOwnerIdentifier: SAFE.didWeb, documentDate: SAFE.organizationScopedResources.slotStart },
  incoming: { resourceId: SAFE.resourceUuid, authorOwnerIdentifier: SAFE.didWeb, documentDate: SAFE.organizationScopedResources.slotEnd },
}
// @ts-expect-error A stable binding cannot omit its assignment identifier.
const missingAssignment: ClinicalCreatorBinding = { kind: binding.kind, actorIdentifier: actor, ownerIdentifier: SAFE.didWeb, role: binding.role }
// @ts-expect-error Controller is not one of the clinical creator profile kinds.
const controller: ClinicalCreatorBinding = { ...binding, kind: 'controller' }
// @ts-expect-error Evidence aliases remain an explicit array, not a string.
const wrongAliases: AuthenticatedClinicalCreatorEvidence = { verifiedContactIdentifiers: SAFE.didWeb }
// @ts-expect-error Professional provenance needs an organization reference.
const missingOrganization: FhirIpsCreatorProvenanceInput = { kind: FhirIpsCreatorKinds.Professional, actorIdentifier: actor, authorIdentifier: assignment, role: binding.role }
void [draft, evidence, provenanceInput, provenance, successor, ClinicalResourceReplacementDecision, missingAssignment, controller, wrongAliases, missingOrganization]
