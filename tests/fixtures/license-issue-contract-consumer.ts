// Flow contract: issue metadata is typed independently from actor/contact claims and never supplies authority.
import {buildLicenseIssueEntry,type LicenseIssueInput,type LicenseRoleKind} from '../../dist/index.js'
import {buildLicenseIssueClaims,classifyLicenseRole,LicenseRoleKinds} from '../../dist/license-commercial-contract.js'
import {DeviceAppTypes,DeviceUserClasses} from '../../dist/device-license-contract.js'
import {HealthcareActorRoles} from '../../dist/healthcare-roles.js'
import {REPOSITORY_SAFE_EXAMPLES as e} from '../../dist/repository-privacy.js'
const input:LicenseIssueInput={role:`v3-RoleCode|${HealthcareActorRoles.Controller}`,telephone:e.phoneE164,userClass:DeviceUserClasses.Individual,type:DeviceAppTypes.Web,ownerOrganizationId:e.tenantId,subjectDid:e.didWeb,subjectId:e.resourceUuid,relatedPersonId:e.resourceUuid,invitationId:e.resourceUuid}
const entry=buildLicenseIssueEntry(input)
const kind:LicenseRoleKind=classifyLicenseRole(input.role)
// @ts-expect-error Issuance requires a role, even though recipient validation is runtime-dependent.
const missingRole:LicenseIssueInput={email:e.firstContactEmail}
// @ts-expect-error A subject reference is not a numeric identifier.
const wrongSubject:LicenseIssueInput={...input,subjectDid:1}
// @ts-expect-error An arbitrary user-class string is not a seat class.
const wrongClass:LicenseIssueInput={...input,userClass:'clinical-author'}
void [entry,kind,buildLicenseIssueClaims(input),LicenseRoleKinds,missingRole,wrongSubject,wrongClass]
