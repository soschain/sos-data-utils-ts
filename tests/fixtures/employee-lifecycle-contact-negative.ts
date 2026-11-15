// Flow contract: mixed email/phone, undiscriminated phone, missing contact and unknown lifecycle states are invalid DTOs.
import type {OrganizationEmployeeLifecycleRecord} from '../../src/employee-routing.js';
import {REPOSITORY_SAFE_EXAMPLES as safe} from '../../src/repository-privacy.js';
const base={resourceId:safe.resourceUuid,roleCode:'ISCO-08|2261',employeeDid:safe.didWeb,status:'active' as const};
// @ts-expect-error A phone contact cannot carry a fabricated or unrelated email.
const mixed:OrganizationEmployeeLifecycleRecord={...base,contactKind:'phone',telephone:safe.phoneE164,email:safe.firstContactEmail};
// @ts-expect-error Telephone requires the explicit contact discriminator.
const undiscriminated:OrganizationEmployeeLifecycleRecord={...base,telephone:safe.phoneE164};
// @ts-expect-error A lifecycle record requires one contact branch.
const missing:OrganizationEmployeeLifecycleRecord={...base};
// @ts-expect-error Existing lifecycle status values stay closed.
const invalidStatus:OrganizationEmployeeLifecycleRecord={...base,email:safe.firstContactEmail,status:'verified'};
void mixed;void undiscriminated;void missing;void invalidStatus;
