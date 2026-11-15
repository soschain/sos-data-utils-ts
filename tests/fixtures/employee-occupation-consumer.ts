import type {OrganizationEmployeeLifecycleRecord} from 'sos-data-utils-ts/employee-routing'
import {REPOSITORY_SAFE_EXAMPLES as SAFE} from 'sos-data-utils-ts/repository-privacy'
import {HealthcareActorRoles} from 'sos-data-utils-ts/healthcare-roles'
const common={resourceId:SAFE.resourceUuid,roleCode:HealthcareActorRoles.Dentist,employeeDid:`${SAFE.didWeb}:employee`,status:'active' as const}
const phone:OrganizationEmployeeLifecycleRecord={...common,contactKind:'phone',telephone:SAFE.phoneE164,occupationResourceId:SAFE.demoOrganizationUuids.healthCare}
const email:OrganizationEmployeeLifecycleRecord={...common,email:SAFE.firstContactEmail}
// @ts-expect-error An actual Occupation resource ID is a string, never a numeric occupation code.
const code:OrganizationEmployeeLifecycleRecord={...phone,occupationResourceId:2261}
void [phone,email,code]
