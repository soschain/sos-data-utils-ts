import type {ConsentActorDescriptor,MissingPermissionSet} from './consent-access.js'

/** Existing operational entry type for a controller's pending access proposal. */
export const PermissionRequestConsentEntryType='Consent-create-request-v1.0' as const

/** Explicit identifiers let callers retry one proposal with the same correlation. */
export type PermissionRequestCommunicationInput=Readonly<{
 subject:string
 requester:ConsentActorDescriptor
 requesterRole?:string
 purpose?:string
 missing:MissingPermissionSet
 communicationIdentifier:string
 consentIdentifier:string
 thid:string
 sender:string
 recipient:string|string[]
 justification?:string
}>

/** Mutable payload supports the caller's governed default-permission proposal. */
export interface PermissionRequestCommunicationDraft {
 thid:string
 subject:string
 sender:string
 recipient:string|string[]
 category:string[]
 text:string
 claims:Record<string,string|string[]>
 payload:Record<string,unknown>
}
