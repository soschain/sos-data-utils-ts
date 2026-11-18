// Copyright 2026 Connecting Solution & Applications Ltd under the Apache License, Version 2.0.
// Selectively migrated neutral contracts; source attribution is retained in NOTICE.
// Copyright 2026 Connecting Solution & Applications Ltd under the Apache License, Version 2.0.

/** Product sectors whose organization UI may expose HealthDCAT publication. */
export const HealthDcatPublisherSectors = Object.freeze([
  'public-health',
  'animal-care', 'health-care',
  'animal-insurance', 'health-insurance', 'onehealth-insurance',
  'animal-lab', 'health-lab', 'onehealth-lab',
  'animal-research', 'health-research', 'onehealth-research',
] as const)

export type HealthDcatPublisherSector = typeof HealthDcatPublisherSectors[number]
export type HealthDcatAccessRights = 'PUBLIC' | 'RESTRICTED' | 'NON_PUBLIC'
export type HealthDcatSourceKind = 'individual-index' | 'spreadsheet-import' | 'digital-twin-import' | 'curated-dataset'
export type HealthDcatAnonymizationStatus = 'anonymous' | 'pseudonymized' | 'personal'
export type HealthDcatPublisherRole = 'data-holder' | 'authorized-intermediary'
type ClaimValue = string | boolean | number | readonly string[]

/** Standards-derived flat Dataset claims for indexed product persistence. */
export enum ClaimsHealthDcatDataset {
  identifier = 'dct.identifier',
  title = 'dct.title',
  description = 'dct.description',
  creator = 'dct.creator',
  publisher = 'dct.publisher',
  custodian = 'geodcatap.custodian',
  accessRights = 'dct.accessRights',
  applicableLegislation = 'dcatap.applicableLegislation',
  distribution = 'dcat.distribution',
  source = 'dct.source',
  provenance = 'dct.provenance',
  wasGeneratedBy = 'prov.wasGeneratedBy',
  personalData = 'dpv.hasPersonalData',
  healthCategory = 'healthdcatap.healthCategory',
  healthDataAccessBody = 'healthdcatap.hdab',
  structuredData = 'healthdcatap.hasStructuredData',
  variables = 'healthdcatap.hasVariables',
  authorizationReference = 'prov.qualifiedAttribution',
  userSelected = 'Dataset.user-selected',
}

/** Standards-derived flat Catalogue claims for indexed product persistence. */
export enum ClaimsHealthDcatCatalog {
  identifier = 'dct.identifier',
  title = 'dct.title',
  description = 'dct.description',
  creator = 'dct.creator',
  publisher = 'dct.publisher',
  applicableLegislation = 'dcatap.applicableLegislation',
  dataset = 'dcat.dataset',
  userSelected = 'Catalog.user-selected',
}

/** DCAT Catalogue Record editorial claims; status is distinct from data access rights. */
export enum ClaimsHealthDcatCatalogRecord {
  identifier = 'dct.identifier',
  primaryTopic = 'foaf.primaryTopic',
  status = 'adms.status',
  modified = 'dct.modified',
  conformsTo = 'dct.conformsTo',
  userSelected = 'CatalogRecord.user-selected',
}

/** DCAT Distribution claims used for downloadable or controlled-access representations. */
export enum ClaimsHealthDcatDistribution {
  identifier = 'dct.identifier',
  title = 'dct.title',
  accessUrl = 'dcat.accessURL',
  format = 'dct.format',
  mediaType = 'dcat.mediaType',
  accessRights = 'dct.accessRights',
  policy = 'odrl.hasPolicy',
  userSelected = 'Distribution.user-selected',
}

/** DCAT DataService claims used for host APIs serving one or more Datasets. */
export enum ClaimsHealthDcatDataService {
  identifier = 'dct.identifier',
  title = 'dct.title',
  publisher = 'dct.publisher',
  endpointUrl = 'dcat.endpointURL',
  servesDataset = 'dcat.servesDataset',
  accessRights = 'dct.accessRights',
  userSelected = 'DataService.user-selected',
}

export type HealthDcatCatalogRecordStatus = 'draft' | 'published' | 'archived'

/** Complete allowlist for product-persisted HealthDCAT flat claims. */
export const HealthDcatFlatClaimCatalog = Object.freeze({
  Dataset: Object.freeze(Object.values(ClaimsHealthDcatDataset)),
  Catalog: Object.freeze(Object.values(ClaimsHealthDcatCatalog)),
  CatalogRecord: Object.freeze(Object.values(ClaimsHealthDcatCatalogRecord)),
  Distribution: Object.freeze(Object.values(ClaimsHealthDcatDistribution)),
  DataService: Object.freeze(Object.values(ClaimsHealthDcatDataService)),
} as const)

export type HealthDcatResource = Readonly<{
  resourceType: 'Dataset' | 'Catalog' | 'CatalogRecord' | 'Distribution' | 'DataService'
  id: string
  meta: Readonly<{ claims: Readonly<Record<string, ClaimValue>> }>
}>

/** Validates an indexed HealthDCAT resource and rejects nested or unknown claims. */
export function normalizeHealthDcatResource(candidate: unknown): HealthDcatResource {
  if (!candidate || typeof candidate !== 'object') throw new TypeError('health_dcat_resource_invalid')
  const value = candidate as { resourceType?: unknown; id?: unknown; meta?: unknown }
  if (!['Dataset', 'Catalog', 'CatalogRecord', 'Distribution', 'DataService'].includes(String(value.resourceType))) throw new TypeError('health_dcat_resource_invalid')
  if (typeof value.id !== 'string' || !value.id.trim()) throw new TypeError('health_dcat_resource_invalid')
  if (!value.meta || typeof value.meta !== 'object' || Array.isArray(value.meta)) throw new TypeError('health_dcat_resource_invalid')
  const claims = (value.meta as { claims?: unknown }).claims
  if (!claims || typeof claims !== 'object' || Array.isArray(claims)) throw new TypeError('health_dcat_resource_invalid')
  const resourceType = value.resourceType as HealthDcatResource['resourceType']
  const allowed: readonly string[] = HealthDcatFlatClaimCatalog[resourceType]
  const normalized: Record<string, ClaimValue> = {}
  for (const [claim, raw] of Object.entries(claims)) {
    if (!allowed.includes(claim)) throw new TypeError(`health_dcat_claim_not_governed:${claim}`)
    if (typeof raw === 'string' || typeof raw === 'boolean' || typeof raw === 'number') normalized[claim] = raw
    else if (Array.isArray(raw) && raw.every(item => typeof item === 'string')) normalized[claim] = Object.freeze([...raw])
    else throw new TypeError(`health_dcat_claim_value_invalid:${claim}`)
  }
  return Object.freeze({
    resourceType,
    id: value.id,
    meta: Object.freeze({ claims: Object.freeze(normalized) }),
  })
}

const JsonLdClaimNames: Readonly<Record<string, string>> = Object.freeze({
  [ClaimsHealthDcatDataset.identifier]: 'dct:identifier',
  [ClaimsHealthDcatDataset.title]: 'dct:title',
  [ClaimsHealthDcatDataset.description]: 'dct:description',
  [ClaimsHealthDcatDataset.creator]: 'dct:creator',
  [ClaimsHealthDcatDataset.publisher]: 'dct:publisher',
  [ClaimsHealthDcatDataset.custodian]: 'geodcatap:custodian',
  [ClaimsHealthDcatDataset.accessRights]: 'dct:accessRights',
  [ClaimsHealthDcatDataset.applicableLegislation]: 'dcatap:applicableLegislation',
  [ClaimsHealthDcatDataset.distribution]: 'dcat:distribution',
  [ClaimsHealthDcatDataset.source]: 'dct:source',
  [ClaimsHealthDcatDataset.provenance]: 'dct:provenance',
  [ClaimsHealthDcatDataset.wasGeneratedBy]: 'prov:wasGeneratedBy',
  [ClaimsHealthDcatDataset.personalData]: 'dpv:hasPersonalData',
  [ClaimsHealthDcatDataset.healthCategory]: 'healthdcatap:healthCategory',
  [ClaimsHealthDcatDataset.healthDataAccessBody]: 'healthdcatap:hdab',
  [ClaimsHealthDcatDataset.structuredData]: 'healthdcatap:hasStructuredData',
  [ClaimsHealthDcatDataset.variables]: 'healthdcatap:hasVariables',
  [ClaimsHealthDcatDataset.authorizationReference]: 'prov:qualifiedAttribution',
  [ClaimsHealthDcatCatalog.dataset]: 'dcat:dataset',
  [ClaimsHealthDcatCatalogRecord.primaryTopic]: 'foaf:primaryTopic',
  [ClaimsHealthDcatCatalogRecord.status]: 'adms:status',
  [ClaimsHealthDcatCatalogRecord.modified]: 'dct:modified',
  [ClaimsHealthDcatCatalogRecord.conformsTo]: 'dct:conformsTo',
  [ClaimsHealthDcatDistribution.accessUrl]: 'dcat:accessURL',
  [ClaimsHealthDcatDistribution.format]: 'dct:format',
  [ClaimsHealthDcatDistribution.mediaType]: 'dcat:mediaType',
  [ClaimsHealthDcatDistribution.policy]: 'odrl:hasPolicy',
  [ClaimsHealthDcatDataService.endpointUrl]: 'dcat:endpointURL',
  [ClaimsHealthDcatDataService.servesDataset]: 'dcat:servesDataset',
})

/** Explicitly projects internal flat claims to DCAT/HealthDCAT JSON-LD. */
export function projectHealthDcatResourceToJsonLd(resource: unknown): Readonly<Record<string, unknown>> {
  const normalized = normalizeHealthDcatResource(resource)
  const output: Record<string, unknown> = {
    '@context': Object.freeze({
      dcat: 'http://www.w3.org/ns/dcat#',
      dct: 'http://purl.org/dc/terms/',
      dcatap: 'http://data.europa.eu/r5r/',
      geodcatap: 'http://data.europa.eu/930/',
      healthdcatap: 'http://healthdataportal.eu/ns/health#',
      dpv: 'https://w3id.org/dpv#',
      prov: 'http://www.w3.org/ns/prov#',
      foaf: 'http://xmlns.com/foaf/0.1/',
      adms: 'http://www.w3.org/ns/adms#',
      odrl: 'http://www.w3.org/ns/odrl/2/',
    }),
    '@id': normalized.id,
    '@type': `dcat:${normalized.resourceType}`,
  }
  for (const [claim, value] of Object.entries(normalized.meta.claims)) {
    const jsonLdName = JsonLdClaimNames[claim]
    if (jsonLdName) output[jsonLdName] = value
  }
  return Object.freeze(output)
}

type ControllerAuthority = Readonly<{
  organizationIdentifier: string
  controllerIdentifier: string
  actingControllerIdentifier: string
}>

function required(value: string, field: string): string {
  const normalized = value.trim()
  if (!normalized) throw new Error(`${field} is required`)
  return normalized
}

function assertController(input: ControllerAuthority): void {
  if (required(input.actingControllerIdentifier, 'actingControllerIdentifier') !==
      required(input.controllerIdentifier, 'controllerIdentifier')) {
    throw new Error('Only the organization controller may perform this operation')
  }
}

/** Builds a claims-first HealthDCAT Dataset description under explicit tenant authority. */
export function buildHealthDcatDataset(input: ControllerAuthority & Readonly<{
  sector: HealthDcatPublisherSector
  id: string
  title: string
  description: string
  publisherRole: HealthDcatPublisherRole
  dataHolderIdentifier: string
  authorizationReference?: string
  sourceKind: HealthDcatSourceKind
  sourceReference: string
  accessRights: HealthDcatAccessRights
  anonymizationStatus: HealthDcatAnonymizationStatus
  healthCategory: readonly string[]
  healthDataAccessBodyIdentifier: string
  structuredData: boolean
  variableTableGroupIdentifiers?: readonly string[]
  distributionIdentifiers: readonly string[]
  applicableLegislation: readonly string[]
}>): HealthDcatResource {
  assertController(input)
  if (!(HealthDcatPublisherSectors as readonly string[]).includes(input.sector)) {
    throw new Error(`Sector ${input.sector} cannot publish HealthDCAT metadata`)
  }
  if (input.publisherRole === 'authorized-intermediary' && !input.authorizationReference?.trim()) {
    throw new Error('authorizationReference is required for an authorized intermediary')
  }
  if (input.healthCategory.length === 0) throw new Error('healthCategory is required')
  if (input.applicableLegislation.length === 0) throw new Error('applicableLegislation is required')
  if (input.accessRights === 'NON_PUBLIC' && input.distributionIdentifiers.length === 0) {
    throw new Error('A non-public Dataset requires an HDAB Distribution')
  }
  if (input.structuredData && !input.variableTableGroupIdentifiers?.length) {
    throw new Error('Structured data requires variableTableGroupIdentifiers')
  }

  const organizationIdentifier = required(input.organizationIdentifier, 'organizationIdentifier')
  const sourceReference = required(input.sourceReference, 'sourceReference')
  const claims: Record<string, ClaimValue> = {
    [ClaimsHealthDcatDataset.identifier]: required(input.id, 'id'),
    [ClaimsHealthDcatDataset.title]: required(input.title, 'title'),
    [ClaimsHealthDcatDataset.description]: required(input.description, 'description'),
    [ClaimsHealthDcatDataset.creator]: input.controllerIdentifier,
    [ClaimsHealthDcatDataset.publisher]: organizationIdentifier,
    [ClaimsHealthDcatDataset.custodian]: required(input.dataHolderIdentifier, 'dataHolderIdentifier'),
    [ClaimsHealthDcatDataset.accessRights]: input.accessRights,
    [ClaimsHealthDcatDataset.applicableLegislation]: Object.freeze([...input.applicableLegislation]),
    [ClaimsHealthDcatDataset.distribution]: Object.freeze([...input.distributionIdentifiers]),
    [ClaimsHealthDcatDataset.source]: sourceReference,
    [ClaimsHealthDcatDataset.provenance]: `${input.sourceKind}:${sourceReference}`,
    [ClaimsHealthDcatDataset.personalData]: input.anonymizationStatus !== 'anonymous',
    [ClaimsHealthDcatDataset.healthCategory]: Object.freeze([...input.healthCategory]),
    [ClaimsHealthDcatDataset.healthDataAccessBody]: required(input.healthDataAccessBodyIdentifier, 'healthDataAccessBodyIdentifier'),
    [ClaimsHealthDcatDataset.structuredData]: input.structuredData,
    [ClaimsHealthDcatDataset.userSelected]: true,
  }
  if (input.variableTableGroupIdentifiers?.length) {
    claims[ClaimsHealthDcatDataset.variables] = Object.freeze([...input.variableTableGroupIdentifiers])
  }
  if (input.authorizationReference) {
    claims[ClaimsHealthDcatDataset.authorizationReference] = input.authorizationReference
  }
  return Object.freeze({ resourceType: 'Dataset', id: input.id, meta: Object.freeze({ claims: Object.freeze(claims) }) })
}

/** Builds the tenant-owned marketplace Catalogue; creation is controller-only. */
export function buildHealthDcatCatalog(input: ControllerAuthority & Readonly<{
  id: string
  title: string
  description: string
  datasetIdentifiers: readonly string[]
  applicableLegislation: readonly string[]
}>): HealthDcatResource {
  assertController(input)
  if (input.applicableLegislation.length === 0) throw new Error('applicableLegislation is required')
  const claims: Record<string, ClaimValue> = {
    [ClaimsHealthDcatCatalog.identifier]: required(input.id, 'id'),
    [ClaimsHealthDcatCatalog.title]: required(input.title, 'title'),
    [ClaimsHealthDcatCatalog.description]: required(input.description, 'description'),
    [ClaimsHealthDcatCatalog.creator]: input.controllerIdentifier,
    [ClaimsHealthDcatCatalog.publisher]: required(input.organizationIdentifier, 'organizationIdentifier'),
    [ClaimsHealthDcatCatalog.applicableLegislation]: Object.freeze([...input.applicableLegislation]),
    [ClaimsHealthDcatCatalog.dataset]: Object.freeze([...input.datasetIdentifiers]),
    [ClaimsHealthDcatCatalog.userSelected]: true,
  }
  return Object.freeze({ resourceType: 'Catalog', id: input.id, meta: Object.freeze({ claims: Object.freeze(claims) }) })
}

/** Builds a governed Dataset Distribution without exposing the source records. */
export function buildHealthDcatDistribution(input: ControllerAuthority & Readonly<{
  id: string
  title: string
  accessUrl: string
  format: string
  mediaType?: string
  accessRights: HealthDcatAccessRights
  healthDataAccessBodyIdentifier: string
  policyIdentifier?: string
}>): HealthDcatResource {
  assertController(input)
  required(input.healthDataAccessBodyIdentifier, 'healthDataAccessBodyIdentifier')
  const accessUrl = required(input.accessUrl, 'accessUrl')
  if (!accessUrl.startsWith('https://')) throw new TypeError('accessUrl must use HTTPS')
  const claims: Record<string, ClaimValue> = {
    [ClaimsHealthDcatDistribution.identifier]: required(input.id, 'id'),
    [ClaimsHealthDcatDistribution.title]: required(input.title, 'title'),
    [ClaimsHealthDcatDistribution.accessUrl]: accessUrl,
    [ClaimsHealthDcatDistribution.format]: required(input.format, 'format'),
    [ClaimsHealthDcatDistribution.accessRights]: input.accessRights,
    [ClaimsHealthDcatDistribution.userSelected]: true,
  }
  if (input.mediaType) claims[ClaimsHealthDcatDistribution.mediaType] = required(input.mediaType, 'mediaType')
  if (input.policyIdentifier) claims[ClaimsHealthDcatDistribution.policy] = required(input.policyIdentifier, 'policyIdentifier')
  return normalizeHealthDcatResource({ resourceType: 'Distribution', id: input.id, meta: { claims } })
}

/** Builds metadata for a host API that serves published Dataset descriptions. */
export function buildHealthDcatDataService(input: ControllerAuthority & Readonly<{
  id: string
  title: string
  endpointUrl: string
  servesDatasetIdentifiers: readonly string[]
  accessRights: HealthDcatAccessRights
}>): HealthDcatResource {
  assertController(input)
  const endpointUrl = required(input.endpointUrl, 'endpointUrl')
  if (!endpointUrl.startsWith('https://')) throw new TypeError('endpointUrl must use HTTPS')
  if (!input.servesDatasetIdentifiers.length) throw new TypeError('servesDatasetIdentifiers are required')
  return normalizeHealthDcatResource({
    resourceType: 'DataService', id: input.id, meta: { claims: {
      [ClaimsHealthDcatDataService.identifier]: required(input.id, 'id'),
      [ClaimsHealthDcatDataService.title]: required(input.title, 'title'),
      [ClaimsHealthDcatDataService.publisher]: required(input.organizationIdentifier, 'organizationIdentifier'),
      [ClaimsHealthDcatDataService.endpointUrl]: endpointUrl,
      [ClaimsHealthDcatDataService.servesDataset]: Object.freeze([...input.servesDatasetIdentifiers]),
      [ClaimsHealthDcatDataService.accessRights]: input.accessRights,
      [ClaimsHealthDcatDataService.userSelected]: true,
    } },
  })
}

/**
 * Links one cohort Dataset to the ResearchStudy that generated it and creates
 * the separate editorial CatalogRecord controlling external discoverability.
 * ResearchSubject identifiers are deliberately absent from this projection.
 */
export function buildResearchStudyDatasetPublication(input: ControllerAuthority & Readonly<{
  dataset: unknown
  researchStudyIdentifier: string
  provenanceReference: string
  catalogRecordIdentifier: string
  status: HealthDcatCatalogRecordStatus
  modifiedAt: string
}>): Readonly<{ dataset: HealthDcatResource; record: HealthDcatResource }> {
  assertController(input)
  const dataset = normalizeHealthDcatResource(input.dataset)
  if (dataset.resourceType !== 'Dataset') throw new TypeError('research_dataset_required')
  const researchStudyIdentifier = required(input.researchStudyIdentifier, 'researchStudyIdentifier')
  if (!researchStudyIdentifier.startsWith('ResearchStudy/')) throw new TypeError('research_study_reference_invalid')
  const provenanceReference = required(input.provenanceReference, 'provenanceReference')
  if (!provenanceReference.startsWith('Provenance/')) throw new TypeError('provenance_reference_invalid')
  const modifiedAt = new Date(input.modifiedAt)
  if (!Number.isFinite(modifiedAt.getTime()) || modifiedAt.toISOString() !== input.modifiedAt) throw new TypeError('modifiedAt must be an ISO instant')
  const linkedDataset = normalizeHealthDcatResource({
    ...dataset,
    meta: { claims: {
      ...dataset.meta.claims,
      [ClaimsHealthDcatDataset.wasGeneratedBy]: researchStudyIdentifier,
      [ClaimsHealthDcatDataset.provenance]: provenanceReference,
    } },
  })
  const recordId = required(input.catalogRecordIdentifier, 'catalogRecordIdentifier')
  const record = normalizeHealthDcatResource({
    resourceType: 'CatalogRecord',
    id: recordId,
    meta: { claims: {
      [ClaimsHealthDcatCatalogRecord.identifier]: recordId,
      [ClaimsHealthDcatCatalogRecord.primaryTopic]: `Dataset/${dataset.id}`,
      [ClaimsHealthDcatCatalogRecord.status]: input.status,
      [ClaimsHealthDcatCatalogRecord.modified]: input.modifiedAt,
      [ClaimsHealthDcatCatalogRecord.conformsTo]: 'HealthDCAT-AP Release 7',
      [ClaimsHealthDcatCatalogRecord.userSelected]: true,
    } },
  })
  return Object.freeze({ dataset: linkedDataset, record })
}

/** Controller-only editorial transition; archiving removes external discovery only. */
export function updateHealthDcatCatalogRecordStatus(input: ControllerAuthority & Readonly<{
  record: unknown
  status: HealthDcatCatalogRecordStatus
  modifiedAt: string
}>): HealthDcatResource {
  assertController(input)
  const record = normalizeHealthDcatResource(input.record)
  if (record.resourceType !== 'CatalogRecord') throw new TypeError('health_dcat_catalog_record_required')
  const timestamp = new Date(input.modifiedAt)
  if (!Number.isFinite(timestamp.getTime()) || timestamp.toISOString() !== input.modifiedAt) throw new TypeError('modifiedAt must be an ISO instant')
  return normalizeHealthDcatResource({
    ...record,
    meta: { claims: {
      ...record.meta.claims,
      [ClaimsHealthDcatCatalogRecord.status]: input.status,
      [ClaimsHealthDcatCatalogRecord.modified]: input.modifiedAt,
    } },
  })
}

/** True only for records eligible for an external marketplace search result. */
export function isHealthDcatCatalogRecordExternallyDiscoverable(record: unknown): boolean {
  try {
    const normalized = normalizeHealthDcatResource(record)
    return normalized.resourceType === 'CatalogRecord'
      && normalized.meta.claims[ClaimsHealthDcatCatalogRecord.status] === 'published'
  } catch {
    return false
  }
}
