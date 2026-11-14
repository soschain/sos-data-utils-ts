// Flow contract: SOS internal entries are not native FHIR resources or DIDComm envelope type values.
import type { DataEntry, CommMsgExtended } from 'sos-data-utils-ts/communication-message-contract'
import type { DidCommPayload } from 'antifraud-data-utils-ts/didcomm-contracts'
import { REPOSITORY_SAFE_EXAMPLES as SAFE } from 'sos-data-utils-ts/repository-privacy'
const entry: DataEntry = { id: SAFE.resourceUuid, type: 'Reference', resource: { reference: SAFE.resourceUuid }, meta: { claims: {} } }
const message: CommMsgExtended = { id: SAFE.resourceUuid, type: `${SAFE.httpsBaseUrl}/protocol`, from: SAFE.didWeb, body: { data: [entry] } }
const envelope: DidCommPayload<{ data: DataEntry[] }> = message
message.body.data.push({ ...entry, type: 'CustomExtension' })
// @ts-expect-error Internal data entries retain a required stable identifier.
const missingId: DataEntry = { type: 'Reference', resource: {} }
// @ts-expect-error Entry content is always under resource.
const missingResource: DataEntry = { id: SAFE.resourceUuid, type: 'Reference' }
// @ts-expect-error A native Communication payload array is not the SOS internal data-entry body.
const wrongLayer: CommMsgExtended = { id: SAFE.resourceUuid, type: message.type, body: { resourceType: 'Communication', status: 'completed' } }
void [envelope, missingId, missingResource, wrongLayer]
