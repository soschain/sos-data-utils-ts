import { decodeUnverifiedJsonOrJwtObject, extractUnverifiedPresentationCredentials } from 'antifraud-data-utils-ts/credential-decoding'
import type { VpTokenHeader, VpTokenPayload, VpCredential, VpCredentialInput } from 'antifraud-data-utils-ts/credential-contracts'
import { W3cCredentialContexts, W3cCredentialTypes, ORGANIZATION_ACTIVATION_VC_TYPES, REPRESENTATIVE_ACTIVATION_VC_TYPES, SERVICE_CONTROLLER_ACTIVATION_VC_TYPES } from './identity-credential-contracts.js'
import { buildJwtCompact, prepareJwtBytesForSignature, prepareJwtForSignature } from './jwt.js'
export type { VpTokenHeader, VpTokenPayload, VpCredential, VpCredentialInput } from 'antifraud-data-utils-ts/credential-contracts'

/** Presentation identifiers use the platform cryptographic random source; no weak fallback is selected. */
export function generateUuidLike(): string { return globalThis.crypto.randomUUID() }
export function buildEpochWindow(ttlSeconds = 300): { iat: number; exp: number } {
  const iat = Math.floor(Date.now() / 1000)
  return { iat, exp: iat + Math.max(1, Math.floor(ttlSeconds)) }
}
export function createVP(input?: Partial<VpTokenPayload>): VpTokenPayload {
  const ttl = input?.exp && input?.iat ? undefined : buildEpochWindow(300)
  return {
    iss: String(input?.iss || ''), sub: input?.sub, aud: input?.aud,
    jti: input?.jti || generateUuidLike(), iat: input?.iat ?? ttl?.iat, exp: input?.exp ?? ttl?.exp,
    nonce: input?.nonce || generateUuidLike(),
    vp: { '@context': [W3cCredentialContexts.V1], type: [W3cCredentialTypes.VerifiablePresentation], holder: input?.vp?.holder || input?.iss || '', verifiableCredential: [], ...(input?.vp || {}) },
  }
}
export function addVC(payload: VpTokenPayload, credential: VpCredentialInput): VpTokenPayload {
  if (credential && typeof credential === 'object') payload.vp.verifiableCredential.push({ ...credential })
  else if (typeof credential === 'string' && credential.trim()) payload.vp.verifiableCredential.push(credential.trim())
  return payload
}
export function addVCs(payload: VpTokenPayload, credentials: VpCredentialInput[]): VpTokenPayload {
  for (const credential of credentials || []) addVC(payload, credential)
  return payload
}
/** Decode/match helpers never establish signatures, issuer trust, key state or authorization. */
export const decodeVpTokenPayload = (token: string): VpTokenPayload | undefined => decodeUnverifiedJsonOrJwtObject(token) as VpTokenPayload | undefined
export const getVpCredentials = (token: string): VpCredential[] => extractUnverifiedPresentationCredentials(token)
function hasType(credential: Record<string, unknown> | undefined, types: readonly string[]): boolean {
  if (!credential) return false
  const nested = credential.vc ?? credential.credential
  const value = credential.type ?? (nested && typeof nested === 'object' ? (nested as Record<string, unknown>).type : undefined)
  const actual = Array.isArray(value) ? value.map(String) : [String(value || '')]
  return types.some(type => actual.includes(type))
}
export const getVpCredentialByAnyType = (token: string, types: readonly string[]): VpCredential | undefined => getVpCredentials(token).find(credential => hasType(credential, types))
export const getOrganizationCredentialFromVpToken = (token: string): VpCredential | undefined => getVpCredentialByAnyType(token, ORGANIZATION_ACTIVATION_VC_TYPES)
export const getLegalRepresentativeCredentialFromVpToken = (token: string): VpCredential | undefined => getVpCredentialByAnyType(token, REPRESENTATIVE_ACTIVATION_VC_TYPES)
export const getOrganizationControllerCredentialFromVpToken = (token: string): VpCredential | undefined => getVpCredentialByAnyType(token, SERVICE_CONTROLLER_ACTIVATION_VC_TYPES)
export const getServiceControllerCredentialFromVpToken = getOrganizationControllerCredentialFromVpToken
function addTyped(payload: VpTokenPayload, credential: VpCredentialInput, types: readonly string[], label: string): VpTokenPayload {
  if (!hasType(decodeUnverifiedJsonOrJwtObject(credential), types)) throw new Error(`${label} VC must include one of types: ${types.join(', ')}`)
  return addVC(payload, credential)
}
export const addOrganizationCredential = (payload: VpTokenPayload, credential: VpCredentialInput): VpTokenPayload => addTyped(payload, credential, ORGANIZATION_ACTIVATION_VC_TYPES, 'Organization')
export const addLegalRepresentativeCredential = (payload: VpTokenPayload, credential: VpCredentialInput): VpTokenPayload => addTyped(payload, credential, REPRESENTATIVE_ACTIVATION_VC_TYPES, 'LegalRepresentative')
export const addOrganizationControllerCredential = (payload: VpTokenPayload, credential: VpCredentialInput): VpTokenPayload => addTyped(payload, credential, SERVICE_CONTROLLER_ACTIVATION_VC_TYPES, 'ServiceController')
export const addServiceControllerCredential = addOrganizationControllerCredential
export const prepareForSignature = (header: VpTokenHeader, payload: VpTokenPayload): ReturnType<typeof prepareJwtForSignature> => prepareJwtForSignature(header, payload)
export const prepareBytesForSignature = (header: VpTokenHeader, payload: VpTokenPayload): Uint8Array => prepareJwtBytesForSignature(header, payload)
export const buildVpTokenCompact = buildJwtCompact
