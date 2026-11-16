import type {PermissionRequestCommunicationInput as RootInput} from '../../dist/index.js'
import type {PermissionRequestCommunicationInput,PermissionRequestCommunicationDraft} from '../../dist/permission-request-contract.js'
import {REPOSITORY_SAFE_EXAMPLES as E} from '../../dist/repository-privacy.js'
const input: PermissionRequestCommunicationInput={
 subject:E.didWeb,requester:{actorKind:'professional',did:E.didWeb},
 missing:{sections:['LOINC|11450-4'],resourceTypes:[],pairs:[]},
 communicationIdentifier:E.resourceUuid,consentIdentifier:E.demoOrganizationUuids.healthCare,
 thid:'synthetic-permission-request',sender:E.didWeb,recipient:E.didWeb,
}
const root:RootInput=input
const same:PermissionRequestCommunicationInput=root
declare const draft:PermissionRequestCommunicationDraft
draft.payload={data:[]}
// @ts-expect-error Consent identity must be supplied by the caller.
const incomplete:PermissionRequestCommunicationInput={subject:E.didWeb,requester:{did:E.didWeb},missing:input.missing,communicationIdentifier:E.resourceUuid,thid:input.thid,sender:E.didWeb,recipient:E.didWeb}
// @ts-expect-error A requested section is a coding token, not a numeric selector.
const invalid:PermissionRequestCommunicationInput={...same,missing:{sections:[123],resourceTypes:[],pairs:[]}}
