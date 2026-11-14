// Flow contract: request operations, terminal responses and correlated error outcomes retain distinct public batch shapes.
import type { BundleEntryRequest, BundleEntryResponse, ErrorEntry, BundleJsonApi } from 'sos-data-utils-ts/bundle-contract'
import { REPOSITORY_SAFE_EXAMPLES as SAFE } from 'sos-data-utils-ts/repository-privacy'
import { IssueType, IssueSeverity } from 'fhir-data-utils-ts'
const request: BundleEntryRequest = { type: 'read', request: { method: 'GET', url: SAFE.firstContactIdentifier } }
const response: BundleEntryResponse = { type: request.type, response: { status: '200' }, resource: { id: SAFE.resourceUuid } }
const error: ErrorEntry = { type: request.type, meta: { claims: { requestedId: SAFE.resourceUuid } }, response: {
  status: '400', outcome: { resourceType: 'OperationOutcome', issue: [{ severity: IssueSeverity.Error, code: IssueType.Required }] },
} }
const bundle: BundleJsonApi = { resourceType: 'Bundle', type: 'batch-response', data: [response,error] }
// Existing default batch consumers can still inspect optional resource metadata.
const resource = bundle.data[0].resource
// @ts-expect-error request entries require their operation details
const missingRequest: BundleEntryRequest = { type: 'read' }
// @ts-expect-error response entries require a terminal response
const missingResponse: BundleEntryResponse = { type: 'read' }
// @ts-expect-error errors carry a standard diagnostic outcome
const missingOutcome: ErrorEntry = { type: 'read', response: { status: '400' } }
void [bundle, resource, missingRequest, missingResponse, missingOutcome]
