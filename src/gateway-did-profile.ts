import type { DidDocument, DidService } from 'antifraud-data-utils-ts/did-document'
import type { ServiceEndpointSelector } from './confidential-job.js'

export type GatewayDidServiceSelector = Pick<ServiceEndpointSelector, 'section' | 'format'>
  & Partial<Pick<ServiceEndpointSelector, 'sector' | 'apiVersion'>>

/** SOS route advertisement over a generic DID service; advertisement is not an access grant. */
export interface GatewayDidService extends DidService {
  selector?: GatewayDidServiceSelector
  actions?: string[]
}
/** Standard DID relationships with the explicit SOS routing service profile. */
export type GatewayDidDocument = DidDocument<GatewayDidService>
