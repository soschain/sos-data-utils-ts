import type { DidCommPayload } from 'antifraud-data-utils-ts/didcomm-contracts'
import type { ClaimsRecord } from './confidential-storage.js'

/** Internal SOS message entry, distinct from a native FHIR resource and protocol envelope. */
export interface DataEntry {
  id: string
  type: string
  resource: Record<string, any>
  meta?: { claims: ClaimsRecord }
}

/** Gateway exchange projection, not a new client-facing authoring format.
 * Protocol type identifies the envelope; each body's entry type identifies its
 * content layer. The native clinical resource remains inside the business data.
 * Neither this shape nor its fields establish signature verification or access.
 */
export interface CommMsgExtended extends DidCommPayload<{ data: DataEntry[] }> {}
