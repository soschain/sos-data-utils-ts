import { canonicalizeFhirResource } from 'fhir-data-utils-ts'

/** SOS semantic-content profile; never apply these omissions to a stored/signed resource or FHIR view. */
export type OperationalClaimsContentOptions = Readonly<{
  stripJsonLdEnvelope?: boolean
  stripIdentifiers?: boolean
  stripVersionClaims?: boolean
}>

function rejectPrototypeControlKeys(value: unknown): void {
  if (!value || typeof value !== 'object') return
  if (Object.hasOwn(value, '__proto__')) throw new TypeError('operational_claim_content_unsafe_control_key')
  for (const child of Object.values(value)) rejectPrototypeControlKeys(child)
}

/** Stable JSON for operational deduplication. Field omissions are top-level flat claims only. */
export function canonicalizeOperationalClaimsForContentId(
  claims: Readonly<Record<string, unknown>>,
  options: OperationalClaimsContentOptions = {},
): string {
  rejectPrototypeControlKeys(claims)
  const stripEnvelope = options.stripJsonLdEnvelope ?? true
  const stripIdentifiers = options.stripIdentifiers ?? true
  const stripVersions = options.stripVersionClaims ?? true
  const projected = Object.fromEntries(Object.entries(claims || {}).filter(([name]) => {
    const key = name.trim()
    if (!key) return true
    if (stripEnvelope && (key === '@context' || key === '@type' || key === '@id')) return false
    const lower = key.toLowerCase()
    if (stripVersions && lower.endsWith('.meta.versionid')) return false
    return !(stripIdentifiers && (lower === 'id' || lower.endsWith('.id')
      || lower === 'identifier' || lower.endsWith('.identifier') || lower.endsWith('.identifier.value')))
  }))
  return canonicalizeFhirResource(projected, {
    stripMetaVersionId: false, stripNarrativeText: false, stripNestedElementIds: false,
  })
}
