// Flow contract: job routing, decoded payload and signature metadata remain explicit and distinct from the protected record representation.
import { JobStatus, type JobRequest, type IDecodedDidcommPayload, type ServiceEndpointSelector } from 'sos-data-utils-ts/confidential-job'
import { REPOSITORY_SAFE_EXAMPLES as SAFE } from 'sos-data-utils-ts/repository-privacy'
const route: ServiceEndpointSelector = { section: 'entity', format: 'org.schema', resourceType: 'Employee', action: '_search' }
const content: IDecodedDidcommPayload<{ data: unknown[] }> = {
  jti: SAFE.resourceUuid, thid: SAFE.resourceUuid, iss: SAFE.didWeb, aud: SAFE.didWeb,
  type: 'application/api+json', body: { data: [] }, meta: { jws: { protected: { alg: 'ES256', kid: SAFE.resourceUuid } } },
}
const job: JobRequest = { ...route, id: SAFE.resourceUuid, sequence: 0, status: JobStatus.DRAFT, createdAtTimestamp: 0, content }
job.status = JobStatus.COMPLETED
// @ts-expect-error all jobs retain an explicit routing action
const missingRoute: ServiceEndpointSelector = { section: 'entity', format: 'org.schema', resourceType: 'Employee' }
// @ts-expect-error a decoded message must retain its audience binding
const missingAudience: IDecodedDidcommPayload = { jti: SAFE.resourceUuid, thid: SAFE.resourceUuid, iss: SAFE.didWeb, type: 'application/api+json', body: {} }
// @ts-expect-error processing states are closed; arbitrary status strings are invalid
job.status = 'invented-state'
// @ts-expect-error the selected message body type is preserved
const wrongBody: typeof content.body = { data: 'not-an-array' }
void [job, missingRoute, missingAudience, wrongBody]
