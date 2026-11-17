// Flow contract: durable DCR consumption and a public role projection are typed data, not a new persisted schema or a plaintext wallet/session result.
import type {EmployeeEnrollmentConsumption,ConsumedEmployeeEnrollmentGrant,RegisteredEmployeeDraftRequester} from '../../dist/index.js'
import type {RegisteredEmployeeDraftRequester as LeafRequester} from '../../dist/registered-employee-draft-requester-contract.js'
import {EmployeeActivationGrantVersions} from '../../dist/employee-routing.js'
import {REPOSITORY_SAFE_EXAMPLES as safe} from '../../dist/repository-privacy.js'
const consumed:EmployeeEnrollmentConsumption={ownerId:'synthetic-owner',profileId:safe.resourceUuid,clientInstanceId:'synthetic-installation'}
const grant:ConsumedEmployeeEnrollmentGrant={id:'synthetic-grant-digest',version:EmployeeActivationGrantVersions.V1,employeeDid:safe.didWeb,employeeRoleCode:'ISCO-08|2250',employeeActorIdentifier:'synthetic-stable-actor',providerDid:safe.didWeb,routeContext:{tenantId:safe.tenantId,jurisdiction:'CA',sector:safe.sector},createdAt:'2020-01-01T00:00:00Z',expiresAt:'2020-01-02T00:00:00Z',consumedEnrollments:[consumed]}
const requester:RegisteredEmployeeDraftRequester={ownerId:'synthetic-owner',profileId:safe.resourceUuid,actorDid:safe.didWeb,providerDid:safe.didWeb,routeContext:grant.routeContext,clientId:'synthetic-client',clientInstanceId:'synthetic-installation',recordedRole:'ISCO-08|2250'}
const leaf:LeafRequester=requester
// @ts-expect-error A completion tuple needs the actual registered installation.
const incomplete:EmployeeEnrollmentConsumption={ownerId:'synthetic-owner',profileId:safe.resourceUuid}
// @ts-expect-error The public requester projection is not a wallet or raw bearer.
const secret:RegisteredEmployeeDraftRequester={...requester,sessionToken:'synthetic-token'}
// @ts-expect-error Browser-selected roles are not a projection field.
const chosen:RegisteredEmployeeDraftRequester={...requester,activeRole:'veterinarian'}
// @ts-expect-error Private key material cannot be returned through the projection.
requester.privateJwk
void[consumed,grant,requester,leaf,incomplete,secret,chosen]
