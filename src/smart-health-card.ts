// Copyright 2026 Connecting Solution & Applications Ltd under the Apache License, Version 2.0.
// Selectively migrated neutral contracts; source attribution is retained in NOTICE.
import {canonicalizeFhirResource} from 'fhir-data-utils-ts'
import {Content} from 'antifraud-data-utils-ts/cryptography'
import {deflateRaw, inflateRaw} from 'pako'

export type SmartHealthCardPayload = Readonly<{
  iss: string
  nbf: number
  vc: Readonly<{
    type: readonly string[]
    credentialSubject: Readonly<{
      /** Optional W3C VC subject identifier for named-subject SHC profiles. */
      id?: string
      fhirVersion: string
      fhirBundle: Record<string, unknown>
    }>
  }>
}>

export type PreparedSmartHealthCard = Readonly<{
  protectedHeader: Readonly<{ alg: 'ES256', zip: 'DEF', kid: string }>
  payload: SmartHealthCardPayload
  payloadBytes: Uint8Array
  encodedHeader: string
  encodedPayload: string
  signingInput: string
  signingBytes: Uint8Array
}>

type JsonRecord = Record<string, unknown>

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function nonEmptyString(value: unknown, errorCode: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(errorCode)
  return value.trim()
}

function collectBundleReferences(bundle: JsonRecord): Map<string, string> {
  const references = new Map<string, string>()
  const entries = Array.isArray(bundle.entry) ? bundle.entry : []
  entries.forEach((entry, index) => {
    if (!isRecord(entry) || !isRecord(entry.resource)) return
    const shortReference = `resource:${index}`
    if (typeof entry.fullUrl === 'string') references.set(entry.fullUrl, shortReference)
    if (typeof entry.resource.resourceType === 'string' && typeof entry.resource.id === 'string') {
      references.set(`${entry.resource.resourceType}/${entry.resource.id}`, shortReference)
    }
  })
  return references
}

function minimizeValue(value: unknown, references: ReadonlyMap<string, string>, resourceRoot = false): unknown {
  if (Array.isArray(value)) return value.map(item => minimizeValue(item, references))
  if (!isRecord(value)) return value

  const output: JsonRecord = {}
  const isResource = resourceRoot || typeof value.resourceType === 'string'
  const isCoding = typeof value.system === 'string' && typeof value.code === 'string'
  const isCodeableConcept = Array.isArray(value.coding)

  for (const [key, child] of Object.entries(value)) {
    if (isResource && (key === 'id' || key === 'text')) continue
    if (isResource && key === 'meta') {
      if (isRecord(child) && Array.isArray(child.security)) {
        output.meta = { security: minimizeValue(child.security, references) }
      }
      continue
    }
    if (isCoding && key === 'display') continue
    if (isCodeableConcept && key === 'text') continue
    if (key === 'reference' && typeof child === 'string' && references.has(child)) {
      output.reference = references.get(child)
      continue
    }
    output[key] = minimizeValue(child, references)
  }
  return output
}

/** Applies the payload-size rules required by the SMART Health Cards framework. */
export function minimizeFhirBundleForSmartHealthCard(input: Record<string, unknown>): Record<string, unknown> {
  if (input.resourceType !== 'Bundle') throw new TypeError('shc_fhir_bundle_required')
  const references = collectBundleReferences(input)
  const minimized = minimizeValue(input, references, true) as JsonRecord
  const entries = Array.isArray(minimized.entry) ? minimized.entry : []
  minimized.entry = entries.map((entry, index) => isRecord(entry)
    ? { ...entry, fullUrl: `resource:${index}` }
    : entry)
  return JSON.parse(canonicalizeFhirResource(minimized, {
    stripMetaVersionId: true,
    stripNarrativeText: true,
    stripNestedElementIds: true,
  })) as Record<string, unknown>
}

/** Prepares the exact raw-DEFLATE compact-JWS input to be signed by an external ES256 issuer key. */
export function prepareSmartHealthCard(input: Readonly<{
  issuer: string
  notBefore: number
  kid: string
  fhirVersion: string
  fhirBundle: Record<string, unknown>
  credentialSubjectId?: string
  additionalTypes?: readonly string[]
}>): PreparedSmartHealthCard {
  const issuer = nonEmptyString(input.issuer, 'shc_issuer_required')
  if (!issuer.startsWith('https://') || issuer.endsWith('/')) throw new TypeError('shc_issuer_https_without_trailing_slash_required')
  if (!Number.isInteger(input.notBefore) || input.notBefore < 0) throw new TypeError('shc_not_before_seconds_required')
  const kid = nonEmptyString(input.kid, 'shc_kid_required')
  const fhirVersion = nonEmptyString(input.fhirVersion, 'shc_fhir_version_required')
  const credentialSubjectId = input.credentialSubjectId === undefined
    ? undefined
    : nonEmptyString(input.credentialSubjectId, 'shc_credential_subject_id_required')
  const payload = {
    iss: issuer,
    nbf: input.notBefore,
    vc: {
      type: ['https://smarthealth.cards#health-card', ...(input.additionalTypes ?? [])],
      credentialSubject: {
        ...(credentialSubjectId ? { id: credentialSubjectId } : {}),
        fhirVersion,
        fhirBundle: minimizeFhirBundleForSmartHealthCard(input.fhirBundle),
      },
    },
  } satisfies SmartHealthCardPayload
  const protectedHeader = { alg: 'ES256', zip: 'DEF', kid } as const
  const encodedHeader = Content.objectToRawBase64UrlSafe(protectedHeader)
  const canonicalPayload = canonicalizeFhirResource(payload as unknown as Record<string, unknown>, {
    stripMetaVersionId: false,
  })
  const payloadBytes = Content.stringToBytesUTF8(canonicalPayload)
  const encodedPayload = Content.bytesToRawBase64UrlSafe(deflateRaw(payloadBytes))
  const signingInput = `${encodedHeader}.${encodedPayload}`
  return {
    protectedHeader,
    payload: JSON.parse(canonicalPayload) as SmartHealthCardPayload,
    payloadBytes,
    encodedHeader,
    encodedPayload,
    signingInput,
    signingBytes: Content.stringToBytesUTF8(signingInput),
  }
}

export function assembleSmartHealthCardJws(
  prepared: Pick<PreparedSmartHealthCard, 'encodedHeader' | 'encodedPayload'>,
  signatureBase64Url: string,
): string {
  const signature = nonEmptyString(signatureBase64Url, 'shc_signature_required')
  if (!/^[A-Za-z0-9_-]+$/.test(signature)) throw new TypeError('shc_signature_base64url_required')
  return `${prepared.encodedHeader}.${prepared.encodedPayload}.${signature}`
}

/** Returns the exact uncompressed payload bytes that every detached companion proof verifies. */
export function decodeSmartHealthCardPayloadBytes(compactJws: string): Uint8Array {
  const parts = compactJws.split('.')
  if (parts.length !== 3) throw new TypeError('shc_compact_jws_invalid')
  return inflateRaw(Content.base64ToBytes(parts[1]))
}
