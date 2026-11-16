import { ReviewedOrganizationCredentialTypes as OrganizationTypes } from 'antifraud-data-utils-ts/organization-credentials'
export { W3cCredentialContexts, W3cCredentialTypes } from 'antifraud-data-utils-ts/credential-contracts'

/** Existing SOS identity credential markers; a marker alone never establishes authority. */
export const ProfessionalCredentialTypes = Object.freeze({ EmployeeCredential: 'EmployeeCredential' } as const)
export const IndividualCredentialTypes = Object.freeze({
  IndividualControllerCredential: 'IndividualControllerCredential',
  IndividualMemberCredential: 'IndividualMemberCredential',
  IndividualSubjectCredential: 'IndividualSubjectCredential',
  SubjectIdentityBindingCredential: 'SubjectIdentityBindingCredential',
} as const)
export const ContractCredentialTypes = Object.freeze({ InterTenantAccessContractCredential: 'InterTenantAccessContractCredential' } as const)
export const ORGANIZATION_ACTIVATION_VC_TYPES = Object.freeze([OrganizationTypes.Organization, 'LegalOrganizationCredential'])
export const REPRESENTATIVE_ACTIVATION_VC_TYPES = Object.freeze([OrganizationTypes.LegalRepresentative, OrganizationTypes.Person])
export const SERVICE_CONTROLLER_ACTIVATION_VC_TYPES = Object.freeze([OrganizationTypes.ServiceController, 'OrganizationControllerCredential'])
export const ORGANIZATION_CONTROLLER_ACTIVATION_VC_TYPES = SERVICE_CONTROLLER_ACTIVATION_VC_TYPES
