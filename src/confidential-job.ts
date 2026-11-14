import type { JwsHeader, ProtectedHeadersJWE } from 'antifraud-data-utils-ts/cryptography'
import type { ConfidentialStorageDoc } from './confidential-storage.js'

/** SOS operational routing profile, separate from the generic DID service model. */
export interface ServiceEndpointSelector {
  apiVersion?: string
  sector?: string
  section: string
  format: string
  resourceType: string
  action: string
}
export interface SecureServiceEndpointSelector extends ServiceEndpointSelector { requiredScope: string }

/** Decoded fields are not themselves proof of signature verification or actor authority. */
export interface DidCommDecodedMetadata {
  jws?: { protected?: JwsHeader; signature?: string }
  jwe?: { header?: ProtectedHeadersJWE }
  bearer?: { compact?: string; jwt: { header?: JwsHeader; payload?: Record<string, any> } }
}
/** Operational envelope. The issuer identifies its signer; business actor identity remains in the validated body. */
export interface DecodedDidcommPayload<Body = any> {
  iss: string
  aud: string
  jti: string
  thid: string
  type: string
  body: Body
  meta?: DidCommDecodedMetadata
  exp?: number
  nbf?: number
  iat?: number
  id?: string
  pthid?: string
  to?: string[]
  from?: string
}
/** Compatibility spelling for existing envelope consumers. */
export type IDecodedDidcommPayload<Body = any> = DecodedDidcommPayload<Body>

export enum JobStatus {
  DRAFT = 'DRAFT',
  SUBMITTING = 'SUBMITTING',
  SENT = 'SENT',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ERROR_RETRYABLE = 'ERROR_RETRYABLE',
}
export interface JobRequestInfo extends ServiceEndpointSelector {
  tenantId?: string
  jurisdiction?: string
  createdAtTimestamp: number
  requestUrl?: string
  httpMethod?: string
  contentType?: string
  language?: string
}
/** Same record contract for memory and durable adapters; the SDK owns dispatch and state transitions. */
export interface JobRequest extends ConfidentialStorageDoc, JobRequestInfo {
  status: JobStatus
  content?: DecodedDidcommPayload
  thid?: string
  previousSequence?: number
  onBehalfOf?: string
  locationUrl?: string
  retryCount?: number
  responseMessageId?: string
  errorMessage?: string
}
