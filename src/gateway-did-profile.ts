import type { DidDocument, DidService } from 'antifraud-data-utils-ts/did-document'
import type { ServiceEndpointSelector } from './confidential-job.js'

/** SOS DID service fragments; publication does not establish access authority. */
export const DidServiceIds = Object.freeze({
  DidDocument: '#did-document', Jwks: '#jwks',
  OpenIdConfiguration: '#openid-configuration', SmartConfiguration: '#smart-configuration',
  SmartToken: '#identity:openid:smart:token', CredentialIssuer: '#openid-credential-issuer',
  CapabilityStatement: '#fhir:capabilitystatement', Catalog: '#catalog',
} as const)

/** Service-type values advertised by the existing SOS gateway profile. */
export const DidServiceTypes = Object.freeze({
  LinkedDomains: 'LinkedDomains', JsonWebKeyService2020: 'JsonWebKeyService2020',
  OpenIdProvider: 'OpenIdProvider', SmartOnFhirConfiguration: 'SmartOnFhirConfiguration',
  ApiService: 'ApiService', CredentialIssuer: 'OpenIdCredentialIssuer',
  FhirCapabilityStatement: 'CapabilityStatement', CatalogService: 'CatalogService',
} as const)

/** Relative DSP version metadata path; URL construction remains a runtime concern. */
export const DataspaceWellKnownPaths = Object.freeze({
  VersionMetadata: '/.well-known/dspace-version',
} as const)

export type GatewayDidServiceSelector = Pick<ServiceEndpointSelector, 'section' | 'format'>
  & Partial<Pick<ServiceEndpointSelector, 'sector' | 'apiVersion'>>

/** SOS route advertisement over a generic DID service; advertisement is not an access grant. */
export interface GatewayDidService extends DidService {
  selector?: GatewayDidServiceSelector
  actions?: string[]
}
/** Standard DID relationships with the explicit SOS routing service profile. */
export type GatewayDidDocument = DidDocument<GatewayDidService>
