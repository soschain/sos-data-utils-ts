import * as pako from 'pako'
import { Content } from 'antifraud-data-utils-ts/cryptography'
import type { JwtCompactParts } from 'antifraud-data-utils-ts/cryptography'

/** Decoded data only; signature verification belongs to the neutral cryptography verifier. */
export type DecodedJwtData = { protected: Record<string, unknown>; payload: object; signature?: Uint8Array }
export function getPartsJWT(token: string | undefined): JwtCompactParts | undefined {
  if (!token) return undefined
  const parts = token.split('.')
  return parts.length === 3 ? { protected: parts[0], payload: parts[1], signature: parts[2] } : undefined
}
export function decodeHeader(value: string): Record<string, unknown> {
  try { return Content.base64UrlSafeToJSON(value) } catch { return {} }
}
export async function decodePayload(value: string, isDeflated = false): Promise<object> {
  try {
    const bytes = Content.base64ToBytes(value)
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(isDeflated ? pako.inflate(bytes) : bytes))
  } catch { return {} }
}
export async function getDataJWT(token: string | undefined): Promise<DecodedJwtData | undefined> {
  const parts = getPartsJWT(token)
  if (!parts) return undefined
  const header = decodeHeader(parts.protected)
  return { protected: header, payload: await decodePayload(parts.payload, header.zip === 'DEF'), signature: parts.signature ? Content.base64ToBytes(parts.signature) : undefined }
}
export const encodeHeader = (header: object): string => Content.objectToRawBase64UrlSafe(header)
export async function encodePayload(payload: object, deflate = false): Promise<string> {
  const bytes = Content.objectToBytes(payload)
  return Content.bytesToRawBase64UrlSafe(deflate ? pako.deflate(bytes) : bytes)
}
export const encodeSignature = (signature?: Uint8Array): string => signature?.length ? Content.bytesToRawBase64UrlSafe(signature) : ''
export async function compactJWT(header: object, payload: object, signature?: Uint8Array): Promise<string> {
  return `${encodeHeader(header)}.${await encodePayload(payload, (header as { zip?: unknown }).zip === 'DEF')}.${encodeSignature(signature)}`
}
/** Exact JSON insertion-order signing bytes, not a semantic reserialization of a signed payload. */
export function prepareJwtForSignature(header: object, payload: object): { encodedHeader: string; encodedPayload: string; signingInput: string } {
  const encodedHeader = encodeHeader(header)
  const encodedPayload = Content.objectToRawBase64UrlSafe(payload)
  return { encodedHeader, encodedPayload, signingInput: `${encodedHeader}.${encodedPayload}` }
}
export const prepareJwtBytesForSignature = (header: object, payload: object): Uint8Array => new TextEncoder().encode(prepareJwtForSignature(header, payload).signingInput)
export const buildJwtCompact = (header: string, payload: string, signature: string): string => `${header}.${payload}.${String(signature || '').trim()}`
/** Explicit unsigned fixture builder. It creates syntax only and grants no verification or access. */
export function buildUnsignedJwt(payload: Record<string, unknown>, options: Readonly<{ nowSeconds?: number; ttlSeconds?: number; nonce?: string }> = {}): string {
  const now = options.nowSeconds ?? Math.floor(Date.now() / 1000)
  const claims = { iat: now, exp: now + (options.ttlSeconds ?? 600), nonce: options.nonce ?? `nonce-${now}`, ...payload }
  return `${encodeHeader({ alg: 'none', typ: 'JWT' })}.${Content.objectToRawBase64UrlSafe(claims)}.`
}
export const buildUnsignedVpJwt = buildUnsignedJwt
