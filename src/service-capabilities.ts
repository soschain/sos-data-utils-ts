/** Governed SOS provider capability tokens; advertisement is not authorization. */
export const ServiceCapability=Object.freeze({
  OrganizationRegistryProvider:'organization/Organization.cruds',
  IndexReader:'organization/Composition.rs',IndexProvider:'organization/Composition.cruds',
  DigitalTwinReader:'organization/ResearchSubject.rs',DigitalTwinProvider:'organization/ResearchSubject.cruds',
} as const)
export type ServiceCapabilityValue=typeof ServiceCapability[keyof typeof ServiceCapability]

/** Lowercase family identifiers for advertisement classification, never access decisions. */
export const ServiceCapabilityKind = Object.freeze({
  OrganizationRegistry: 'organization/organization',
  Indexing: 'organization/composition',
  DigitalTwin: 'organization/researchsubject',
} as const)
export type ServiceCapabilityKindValue = typeof ServiceCapabilityKind[keyof typeof ServiceCapabilityKind]

/** Historical wire spellings accepted when reading existing service advertisements. */
export const DeprecatedServiceCapabilityToken = Object.freeze({
  OrganizationRegistryProvider: 'organization-registry.cruds',
  IndexReader: 'indexing.rs', IndexProvider: 'indexing.cruds',
  DigitalTwinReader: 'digitaltwin.rs', DigitalTwinProvider: 'digitaltwin.cruds',
} as const)
export type DeprecatedServiceCapabilityTokenValue = typeof DeprecatedServiceCapabilityToken[keyof typeof DeprecatedServiceCapabilityToken]

/** Compatibility field names; new writers should use ServiceCapability. */
export const ServiceCapabilityToken = Object.freeze({
  ...ServiceCapability,
  OrganizationRegistryCruds: ServiceCapability.OrganizationRegistryProvider,
  IndexingReadSearch: ServiceCapability.IndexReader,
  IndexingCruds: ServiceCapability.IndexProvider,
  DigitalTwinReadSearch: ServiceCapability.DigitalTwinReader,
  DigitalTwinCruds: ServiceCapability.DigitalTwinProvider,
  LegacyOrganizationRegistryProvider: DeprecatedServiceCapabilityToken.OrganizationRegistryProvider,
  LegacyIndexReader: DeprecatedServiceCapabilityToken.IndexReader,
  LegacyIndexProvider: DeprecatedServiceCapabilityToken.IndexProvider,
  LegacyDigitalTwinReader: DeprecatedServiceCapabilityToken.DigitalTwinReader,
  LegacyDigitalTwinProvider: DeprecatedServiceCapabilityToken.DigitalTwinProvider,
} as const)
export type ServiceCapabilityTokenValue = typeof ServiceCapabilityToken[keyof typeof ServiceCapabilityToken]

const canonicalTokens = new Map<string, ServiceCapabilityValue>()
for (const key of Object.keys(ServiceCapability) as (keyof typeof ServiceCapability)[]) {
  const value = ServiceCapability[key]
  canonicalTokens.set(value.toLowerCase(), value)
  canonicalTokens.set(DeprecatedServiceCapabilityToken[key].toLowerCase(), value)
}

/** Normalize known spellings while retaining unknown extension tokens verbatim after trimming. */
export function normalizeServiceCapability(value: string | undefined | null): string | undefined {
  const token = String(value || '').trim()
  return token ? canonicalTokens.get(token.toLowerCase()) ?? token : undefined
}

/** Recognize this catalogue only; extensions require their own explicit policy. */
export function isKnownServiceCapability(value: string | undefined | null): boolean {
  return canonicalTokens.has(String(value || '').trim().toLowerCase())
}

/** Parse persisted CSV in first-occurrence order without dropping extension tokens. */
export function parseServiceCapabilityTokens(value: unknown): string[] {
  const result = new Set<string>()
  for (const item of String(value || '').split(',')) {
    const token = normalizeServiceCapability(item)
    if (token) result.add(token)
  }
  return [...result]
}

/** Merge advertisements; callers must still apply their service allowlist and authorization. */
export function mergeServiceCapabilityClaims(...values: unknown[]): string | undefined {
  const tokens = new Set(values.flatMap(parseServiceCapabilityTokens))
  return tokens.size ? [...tokens].join(',') : undefined
}

/** Serialize a sequence of individual tokens with canonical spelling and stable ordering. */
export function serializeServiceCapabilityTokens(values: ReadonlyArray<string | undefined | null>): string | undefined {
  const tokens = new Set<string>()
  for (const value of values) {
    const token = normalizeServiceCapability(value)
    if (token) tokens.add(token)
  }
  return tokens.size ? [...tokens].join(',') : undefined
}

/** Extract the family prefix, including unknown extensions; this is not capability validation. */
export function getServiceCapabilityKind(value: string | undefined): string | undefined {
  const token = normalizeServiceCapability(value)?.toLowerCase()
  if (!token) return undefined
  const dot = token.lastIndexOf('.')
  return (dot < 0 ? token : token.slice(0, dot)) || undefined
}

/** Classify a CSV advertisement without establishing authority for its operation suffix. */
export function hasServiceCapabilityKind(value: unknown, family: ServiceCapabilityKindValue | string): boolean {
  const expected = String(family || '').trim().toLowerCase()
  return Boolean(expected) && parseServiceCapabilityTokens(value).some(token => getServiceCapabilityKind(token) === expected)
}

/** Recognize the three provider tokens in this catalogue, without granting access. */
export function isProviderServiceCapability(value: string | undefined | null): boolean {
  const token = normalizeServiceCapability(value)
  return token === ServiceCapability.OrganizationRegistryProvider
    || token === ServiceCapability.IndexProvider || token === ServiceCapability.DigitalTwinProvider
}
