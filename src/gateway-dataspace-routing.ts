import {DataspaceWellKnownPaths} from './gateway-did-profile.js'

/** Version advertised by this existing gateway DSP compatibility profile. */
export const GatewayDataspaceProtocolVersions=Object.freeze({Current:'2025-1'} as const)
export type GatewayDataspaceProtocolVersion=typeof GatewayDataspaceProtocolVersions[keyof typeof GatewayDataspaceProtocolVersions]
export type GatewayDataspaceProtocolVersionEntry=Readonly<{version:string;path:string}>
export type GatewayDataspaceVersionMetadata=Readonly<{
  protocolVersions:readonly GatewayDataspaceProtocolVersionEntry[]
}>

/** Return independent metadata objects without rewriting the supplied path. */
export function buildGatewayDataspaceVersionMetadata(path:string,version:GatewayDataspaceProtocolVersion=GatewayDataspaceProtocolVersions.Current):GatewayDataspaceVersionMetadata{
  return {protocolVersions:[{version,path}]}
}

/** Explicit relative-path selectors. Formatting these fields confers no access. */
export type GatewayDataspaceRouteContext=Readonly<{
  participantId?:string
  tenantId?:string
  jurisdiction?:string
  hostCoverageScope?:string
  version?:string
  hostNetwork?:string
  /** Historical compatibility field; prefer hostNetwork. */
  hostNetworkOrBusinessSector?:string
  businessSector?:string
  sector?:string
}>

function participantPrefix(input:GatewayDataspaceRouteContext):string{
  const participant=String(input.participantId||input.tenantId||'').trim()
  const hostScoped=Boolean(participant&&!String(input.tenantId||'').trim())
  const scope=String(hostScoped?(input.hostCoverageScope||input.jurisdiction||''):(input.jurisdiction||'')).trim()
  const version=String(input.version||'').trim()
  const sector=String(input.hostNetwork||input.hostNetworkOrBusinessSector||input.businessSector||input.sector||'').trim()
  return participant&&scope&&version&&sector?`/${participant}/cds-${scope}/${version}/${sector}`:''
}

/** Preserve scoped paths and the explicit unscoped /dsp compatibility fallback. */
export function buildGatewayDataspaceBasePath(input:GatewayDataspaceRouteContext={}):string{
  return participantPrefix(input)+'/dsp'
}
/** Build a relative version-discovery path, without resolving an origin. */
export function buildGatewayDataspaceVersionPath(input:GatewayDataspaceRouteContext={}):string{
  return participantPrefix(input)+DataspaceWellKnownPaths.VersionMetadata
}
export function buildGatewayDataspaceCatalogRequestPath(input:GatewayDataspaceRouteContext={}):string{
  return buildGatewayDataspaceBasePath(input)+'/catalog/request'
}
export function buildGatewayDataspaceCatalogCollectionPath(input:GatewayDataspaceRouteContext={}):string{
  return buildGatewayDataspaceBasePath(input)+'/catalog'
}
export function buildGatewayDataspaceCatalogArtifactPath(input:GatewayDataspaceRouteContext={}):string{
  return buildGatewayDataspaceBasePath(input)+'/catalog/dcat.json'
}
/** Dataset IDs are supplied wire data; this formatter does not encode or authorize them. */
export function buildGatewayDataspaceCatalogDatasetPath(input:GatewayDataspaceRouteContext={},datasetId=':id'):string{
  return buildGatewayDataspaceBasePath(input)+`/catalog/datasets/${datasetId}`
}
