import {SchemaOrgServiceClaim} from 'antifraud-data-utils-ts/organization-service-catalog'
import type {BundleJsonApi,BundleEntry} from './bundle-contract.js'

export type GatewayNetworkKind='test'|'local-network'|'test-network'|'network'
export type RouteContext=Readonly<{tenantId:string;jurisdiction:string;sector:string}>
export type HostRouteContext=Readonly<{
  jurisdiction:string;hostNetwork?:string;hostNetworkOrTenantSector?:string;sector?:string
  controllerDid?:string;hostDid?:string
}>
export type AppInfo=Readonly<{appId:string;appVersion?:string;appType:string;sector:string}>
export type PollOptions=Readonly<{timeoutMs?:number;intervalMs?:number}>
export type SubmitAndPollResult=Readonly<{
  submit:Readonly<{status:number;location?:string;body:unknown}>
  poll:Readonly<{status:number;body:unknown;attempts:number}>
}>
export type LegalOrganizationOrderInput=Readonly<{
  offerId:string;jurisdiction?:string;hostNetwork?:string;hostNetworkOrTenantSector?:string;sector?:string
  dataType?:string;additionalClaims?:Readonly<Record<string,unknown>>;timeoutSeconds?:number;intervalSeconds?:number
}>
export type OrganizationVerificationBinding=Readonly<{
  did?:string;email?:string;sameAs?:string;url?:string;publicKeyJwk?:Readonly<Record<string,unknown>>
  jwks?:Readonly<{keys:ReadonlyArray<Readonly<Record<string,unknown>>>}>
}>
export type LegalOrganizationVerificationTransactionInput=Readonly<{
  claims:Readonly<Record<string,unknown>>;controller:OrganizationVerificationBinding
  organization?:OrganizationVerificationBinding
  legalRepresentativePayload?:Readonly<{email?:string;sameAs?:string}>
  verification?:Readonly<{resourceType?:string}>
  organizationTestNetworkCredential?:object;testNetworkCredentials?:readonly object[];attachments?:readonly unknown[]
}>
export type OrganizationVerificationBundle=BundleJsonApi<BundleEntry>&{attachments?:unknown[]}

/** Claims-first verification intent; public controller binding and signed-document evidence remain distinct. */
export function buildLegalOrganizationVerificationTransactionBundle(input:LegalOrganizationVerificationTransactionInput):OrganizationVerificationBundle{
  const sector=input.claims[SchemaOrgServiceClaim.Category]
  if(typeof sector!=='string'||!sector.trim())throw new TypeError('organization_verification_sector_required')
  const bundle:OrganizationVerificationBundle={resourceType:'Bundle',type:'collection',total:1,data:[{
    type:'Organization-verification-transaction-request-v1.0',resource:{
      meta:{claims:structuredClone(input.claims)},controller:structuredClone(input.controller),
      ...(input.organization?{organization:structuredClone(input.organization)}:{}),
      ...(input.legalRepresentativePayload?{legalRepresentativePayload:structuredClone(input.legalRepresentativePayload)}:{}),
      verification:{resourceType:input.verification?.resourceType?.trim()||'contract'},
      ...(input.organizationTestNetworkCredential?{organizationTestNetworkCredential:structuredClone(input.organizationTestNetworkCredential)}:{}),
      ...(input.testNetworkCredentials?.length?{testNetworkCredentials:structuredClone(input.testNetworkCredentials)}:{}),
    },
  }]}
  if(input.attachments?.length)bundle.attachments=structuredClone([...input.attachments])
  return bundle
}
