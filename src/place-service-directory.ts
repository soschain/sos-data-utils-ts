// Copyright 2026 Connecting Solution & Applications Ltd under the Apache License, Version 2.0.
// Selectively migrated neutral contracts; source attribution is retained in NOTICE.
// Copyright 2026 Connecting Solution & Applications Ltd under the Apache License, Version 2.0.

/** Schema.org flat claims for a persistent, sector-neutral public Place. */
export enum ClaimsPlaceSchemaorg {
  identifier = 'org.schema.Place.identifier',
  additionalType = 'org.schema.Place.additionalType',
  name = 'org.schema.Place.name',
  description = 'org.schema.Place.description',
  ownerIdentifier = 'org.schema.Place.owner.identifier',
  addressCountry = 'org.schema.Place.address.addressCountry',
  addressRegion = 'org.schema.Place.address.addressRegion',
  addressLocality = 'org.schema.Place.address.addressLocality',
  extendedAddress = 'org.schema.Place.address.extendedAddress',
  postalCode = 'org.schema.Place.address.postalCode',
  streetAddress = 'org.schema.Place.address.streetAddress',
  latitude = 'org.schema.Place.geo.latitude',
  longitude = 'org.schema.Place.geo.longitude',
  elevation = 'org.schema.Place.geo.elevation',
  photoContentUrl = 'org.schema.Place.photo.contentUrl',
  amenityFeature = 'org.schema.Place.amenityFeature',
  publicAccess = 'org.schema.Place.publicAccess',
  openingHoursSpecification = 'org.schema.Place.openingHoursSpecification',
  specialOpeningHoursSpecification = 'org.schema.Place.specialOpeningHoursSpecification',
  userSelected = 'Place.user-selected',
}

/** Schema.org flat claims for a public department/subOrganization. */
export enum ClaimsDirectoryOrganizationSchemaorg {
  identifier = 'org.schema.Organization.identifier',
  name = 'org.schema.Organization.name',
  description = 'org.schema.Organization.description',
  parentOrganizationIdentifier = 'org.schema.Organization.parentOrganization.identifier',
  additionalType = 'org.schema.Organization.additionalType',
  sameAs = 'org.schema.Organization.sameAs',
  locationIdentifier = 'org.schema.Organization.location.identifier',
  logoContentUrl = 'org.schema.Organization.logo.contentUrl',
  imageContentUrl = 'org.schema.Organization.image.contentUrl',
  userSelected = 'Organization.user-selected',
}

/** Schema.org Service claims needed to join a public service to one or more Places. */
export enum ClaimsDirectoryServiceSchemaorg {
  identifier = 'org.schema.Service.identifier',
  name = 'org.schema.Service.name',
  description = 'org.schema.Service.description',
  providerIdentifier = 'org.schema.Service.provider.identifier',
  placeIdentifier = 'org.schema.Service.availableChannel.serviceLocation.identifier',
  serviceType = 'org.schema.Service.serviceType',
  category = 'org.schema.Service.category',
  areaServed = 'org.schema.Service.areaServed',
  userSelected = 'Service.user-selected',
}

/** Schema.org Product claims for an organization's public commercial offering. */
export enum ClaimsProductSchemaorg {
  identifier = 'org.schema.Product.identifier',
  additionalType = 'org.schema.Product.additionalType',
  name = 'org.schema.Product.name',
  description = 'org.schema.Product.description',
  providerIdentifier = 'org.schema.Product.provider.identifier',
  category = 'org.schema.Product.category',
  areaServed = 'org.schema.Product.areaServed',
  url = 'org.schema.Product.url',
  imageContentUrl = 'org.schema.Product.image.contentUrl',
  availabilityStarts = 'org.schema.Product.offers.availabilityStarts',
  availabilityEnds = 'org.schema.Product.offers.availabilityEnds',
  price = 'org.schema.Product.offers.price',
  priceCurrency = 'org.schema.Product.offers.priceCurrency',
  insuranceStatus = 'org.schema.Product.additionalProperty.insuranceStatus',
  insuranceCoverageType = 'org.schema.Product.additionalProperty.insuranceCoverageType',
  insuranceNetwork = 'org.schema.Product.additionalProperty.insuranceNetwork',
  userSelected = 'Product.user-selected',
}

/** Claims-only Place, Service, Organization and Product directory profile. */
export const DirectoryFlatClaimCatalog = Object.freeze({
  Organization: Object.freeze(Object.values(ClaimsDirectoryOrganizationSchemaorg)),
  Place: Object.freeze(Object.values(ClaimsPlaceSchemaorg)),
  Service: Object.freeze(Object.values(ClaimsDirectoryServiceSchemaorg)),
  Product: Object.freeze(Object.values(ClaimsProductSchemaorg)),
} as const)

export type DirectoryResourceType = keyof typeof DirectoryFlatClaimCatalog
export type DirectoryClaimValue = string | number | boolean | readonly string[]
export type DirectoryResource = Readonly<{
  resourceType: DirectoryResourceType
  id: string
  meta: Readonly<{ claims: Readonly<Record<string, DirectoryClaimValue>> }>
}>
export type DirectoryFlatClaimsResource = Readonly<{
  resourceType: DirectoryResourceType
  id: string
  meta: Readonly<{ claims: Readonly<Record<string, readonly string[]>> }>
}>

export type OpeningHoursInput = Readonly<{
  daysOfWeek: readonly string[]
  opens: string
  closes: string
  validFrom?: string
  validThrough?: string
}>

export type SpecialOpeningHoursInput = Readonly<{
  validFrom: string
  validThrough: string
  closed?: boolean
  opens?: string
  closes?: string
}>

export type DepartmentDirectoryInput = Readonly<{
  id: string
  legalOrganizationIdentifier: string
  name: string
  description?: string
  specialty?: Readonly<{ system: 'http://loinc.org'; code: string; display: string }>
  placeIdentifiers: readonly string[]
  logoUrl?: string
  imageUrls?: readonly string[]
  userSelected?: boolean
}>

export type PlaceDirectoryInput = Readonly<{
  id: string
  organizationIdentifier: string
  name: string
  description?: string
  additionalType?: string
  address: Readonly<{
    addressCountry: string
    addressRegion?: string
    addressLocality?: string
    extendedAddress?: string
    postalCode: string
    streetAddress?: string
  }>
  position: Readonly<{ latitude: number; longitude: number; elevation?: number }>
  photoUrl?: string
  accessibilityFeatures?: readonly string[]
  publicAccess?: boolean
  openingHours?: readonly OpeningHoursInput[]
  specialOpeningHours?: readonly SpecialOpeningHoursInput[]
  userSelected?: boolean
}>

export type ServiceDirectoryInput = Readonly<{
  id: string
  organizationIdentifier: string
  placeIdentifiers: readonly string[]
  name: string
  description?: string
  serviceTypes: readonly string[]
  categories?: readonly string[]
  areaServed?: readonly string[]
  userSelected?: boolean
}>

export type ProductDirectoryInput = Readonly<{
  id: string
  organizationIdentifier: string
  name: string
  description?: string
  productType: string
  categories?: readonly string[]
  areaServed?: readonly string[]
  url?: string
  imageUrl?: string
  availableFrom?: string
  availableThrough?: string
  price?: number
  priceCurrency?: string
  insurance?: Readonly<{
    status: 'draft' | 'active' | 'retired' | 'unknown'
    coverageTypes: readonly string[]
    networks?: readonly string[]
  }>
  userSelected?: boolean
}>

const RESOURCE_ID_PATTERN = /^[A-Za-z0-9\-.]{1,64}$/
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const DAY_NAMES = new Set(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])

function required(value: unknown, code: string): string {
  const normalized = String(value ?? '').trim()
  if (!normalized) throw new TypeError(code)
  return normalized
}

function optional(value: unknown): string | undefined {
  const normalized = String(value ?? '').trim()
  return normalized || undefined
}

function optionalHttpsUrl(value: unknown, code: string): string | undefined {
  const normalized = optional(value)
  if (!normalized) return undefined
  try {
    const parsed = new URL(normalized)
    if (parsed.protocol !== 'https:') throw new Error()
    return parsed.toString()
  } catch { throw new TypeError(code) }
}

function unique(values: readonly string[] | undefined, code: string): readonly string[] {
  const result = [...new Set((values ?? []).map(value => required(value, code)))]
  return Object.freeze(result)
}

function assertCoordinate(value: number, minimum: number, maximum: number, code: string): void {
  if (!Number.isFinite(value) || value < minimum || value > maximum) throw new TypeError(code)
}

function assertDate(value: string, code: string): string {
  if (!DATE_PATTERN.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) throw new TypeError(code)
  return value
}

function timeMinutes(value: string, code: string): number {
  if (!TIME_PATTERN.test(value)) throw new TypeError(code)
  const [hour, minute] = value.split(':').map(Number)
  return hour * 60 + minute
}

function encodeOpeningHours(value: OpeningHoursInput): string {
  const daysOfWeek = unique(value.daysOfWeek, 'place_opening_hours_invalid')
  if (!daysOfWeek.length || daysOfWeek.some(day => !DAY_NAMES.has(day))) throw new TypeError('place_opening_hours_invalid')
  if (timeMinutes(value.opens, 'place_opening_hours_invalid') >= timeMinutes(value.closes, 'place_opening_hours_invalid')) throw new TypeError('place_opening_hours_invalid')
  const validFrom = value.validFrom ? assertDate(value.validFrom, 'place_opening_hours_invalid') : undefined
  const validThrough = value.validThrough ? assertDate(value.validThrough, 'place_opening_hours_invalid') : undefined
  if (Boolean(validFrom) !== Boolean(validThrough) || (validFrom && validThrough && validFrom > validThrough)) throw new TypeError('place_opening_hours_invalid')
  return JSON.stringify({ daysOfWeek, opens: value.opens, closes: value.closes, ...(validFrom ? { validFrom, validThrough } : {}) })
}

function encodeSpecialOpeningHours(value: SpecialOpeningHoursInput): string {
  const validFrom = assertDate(value.validFrom, 'place_special_opening_hours_invalid')
  const validThrough = assertDate(value.validThrough, 'place_special_opening_hours_invalid')
  if (validFrom > validThrough) throw new TypeError('place_special_opening_hours_invalid')
  if (value.closed) return JSON.stringify({ validFrom, validThrough, closed: true })
  if (!value.opens || !value.closes || timeMinutes(value.opens, 'place_special_opening_hours_invalid') >= timeMinutes(value.closes, 'place_special_opening_hours_invalid')) throw new TypeError('place_special_opening_hours_invalid')
  return JSON.stringify({ validFrom, validThrough, opens: value.opens, closes: value.closes })
}

/**
 * Builds the claims-only public department Organization.
 *
 * One department is one Schema.org/FHIR Organization. Each offered Service
 * remains a separate directory record and owns its own HealthcareService
 * projection through providerIdentifier.
 */
export function buildDepartmentDirectoryResource(input: DepartmentDirectoryInput): DirectoryResource {
  const id = required(input.id, 'department_id_required')
  if (!RESOURCE_ID_PATTERN.test(id)) throw new TypeError('department_id_invalid')
  const placeIdentifiers = unique(input.placeIdentifiers, 'department_place_invalid')
  if (!placeIdentifiers.length) throw new TypeError('department_place_required')
  const logoUrl = optionalHttpsUrl(input.logoUrl, 'department_logo_url_invalid')
  const imageUrls = unique(input.imageUrls, 'department_image_url_invalid').map(value => {
    const imageUrl = optionalHttpsUrl(value, 'department_image_url_invalid')
    if (!imageUrl) throw new TypeError('department_image_url_invalid')
    return imageUrl
  })
  const claims: Record<string, DirectoryClaimValue> = {
    [ClaimsDirectoryOrganizationSchemaorg.identifier]: id,
    [ClaimsDirectoryOrganizationSchemaorg.name]: required(input.name, 'department_name_required'),
    [ClaimsDirectoryOrganizationSchemaorg.parentOrganizationIdentifier]: required(
      input.legalOrganizationIdentifier,
      'department_parent_organization_required',
    ),
    [ClaimsDirectoryOrganizationSchemaorg.sameAs]: `Organization/${id}`,
    [ClaimsDirectoryOrganizationSchemaorg.locationIdentifier]: placeIdentifiers,
    [ClaimsDirectoryOrganizationSchemaorg.userSelected]: input.userSelected ?? false,
  }
  const description = optional(input.description)
  if (description) claims[ClaimsDirectoryOrganizationSchemaorg.description] = description
  if (input.specialty) {
    if (input.specialty.system !== 'http://loinc.org'
      || !/^L(?:A|P)\d+(?:-\d+)?$/.test(input.specialty.code)
      || !optional(input.specialty.display)) throw new TypeError('department_specialty_invalid')
    claims[ClaimsDirectoryOrganizationSchemaorg.additionalType] = `${input.specialty.system}/${input.specialty.code}`
  }
  if (logoUrl) claims[ClaimsDirectoryOrganizationSchemaorg.logoContentUrl] = logoUrl
  if (imageUrls.length) claims[ClaimsDirectoryOrganizationSchemaorg.imageContentUrl] = Object.freeze(imageUrls)
  return Object.freeze({ resourceType: 'Organization', id, meta: Object.freeze({ claims: Object.freeze(claims) }) })
}

/** Builds the claims-only public Place authored by an organization. */
export function buildPlaceDirectoryResource(input: PlaceDirectoryInput): DirectoryResource {
  const id = required(input.id, 'place_id_required')
  if (!RESOURCE_ID_PATTERN.test(id)) throw new TypeError('place_id_invalid')
  assertCoordinate(input.position.latitude, -90, 90, 'place_latitude_invalid')
  assertCoordinate(input.position.longitude, -180, 180, 'place_longitude_invalid')
  if (input.position.elevation !== undefined && !Number.isFinite(input.position.elevation)) throw new TypeError('place_elevation_invalid')
  let photoUrl: string | undefined
  if (input.photoUrl) {
    try { const parsed = new URL(input.photoUrl); if (parsed.protocol !== 'https:') throw new Error() ; photoUrl = parsed.toString() }
    catch { throw new TypeError('place_photo_url_invalid') }
  }
  const accessibilityFeatures = unique(input.accessibilityFeatures, 'place_amenity_feature_invalid')
  const openingHours = Object.freeze((input.openingHours ?? []).map(encodeOpeningHours))
  const specialOpeningHours = Object.freeze((input.specialOpeningHours ?? []).map(encodeSpecialOpeningHours))
  const claims: Record<string, DirectoryClaimValue> = {
    [ClaimsPlaceSchemaorg.identifier]: id,
    [ClaimsPlaceSchemaorg.ownerIdentifier]: required(input.organizationIdentifier, 'place_organization_required'),
    [ClaimsPlaceSchemaorg.name]: required(input.name, 'place_name_required'),
    [ClaimsPlaceSchemaorg.addressCountry]: required(input.address.addressCountry, 'place_country_required').toUpperCase(),
    [ClaimsPlaceSchemaorg.postalCode]: required(input.address.postalCode, 'place_postal_code_required'),
    [ClaimsPlaceSchemaorg.latitude]: input.position.latitude,
    [ClaimsPlaceSchemaorg.longitude]: input.position.longitude,
    [ClaimsPlaceSchemaorg.publicAccess]: input.publicAccess ?? true,
    [ClaimsPlaceSchemaorg.userSelected]: input.userSelected ?? false,
  }
  const textValues: ReadonlyArray<readonly [ClaimsPlaceSchemaorg, unknown]> = [
    [ClaimsPlaceSchemaorg.additionalType, input.additionalType], [ClaimsPlaceSchemaorg.description, input.description],
    [ClaimsPlaceSchemaorg.addressRegion, input.address.addressRegion], [ClaimsPlaceSchemaorg.addressLocality, input.address.addressLocality],
    [ClaimsPlaceSchemaorg.extendedAddress, input.address.extendedAddress], [ClaimsPlaceSchemaorg.streetAddress, input.address.streetAddress],
  ]
  for (const [name, raw] of textValues) { const value = optional(raw); if (value) claims[name] = value }
  if (input.position.elevation !== undefined) claims[ClaimsPlaceSchemaorg.elevation] = input.position.elevation
  if (photoUrl) claims[ClaimsPlaceSchemaorg.photoContentUrl] = photoUrl
  if (accessibilityFeatures.length) claims[ClaimsPlaceSchemaorg.amenityFeature] = accessibilityFeatures
  if (openingHours.length) claims[ClaimsPlaceSchemaorg.openingHoursSpecification] = openingHours
  if (specialOpeningHours.length) claims[ClaimsPlaceSchemaorg.specialOpeningHoursSpecification] = specialOpeningHours
  return Object.freeze({ resourceType: 'Place', id, meta: Object.freeze({ claims: Object.freeze(claims) }) })
}

/** Builds a claims-only Schema.org Service joined to its provider and public Places. */
export function buildServiceDirectoryResource(input: ServiceDirectoryInput): DirectoryResource {
  const id = required(input.id, 'service_id_required')
  if (!RESOURCE_ID_PATTERN.test(id)) throw new TypeError('service_id_invalid')
  const placeIdentifiers = unique(input.placeIdentifiers, 'service_place_required')
  const serviceTypes = unique(input.serviceTypes, 'service_type_required')
  if (!placeIdentifiers.length) throw new TypeError('service_place_required')
  if (!serviceTypes.length) throw new TypeError('service_type_required')
  const categories = unique(input.categories, 'service_category_invalid')
  const areaServed = unique(input.areaServed, 'service_area_invalid')
  const claims: Record<string, DirectoryClaimValue> = {
    [ClaimsDirectoryServiceSchemaorg.identifier]: id,
    [ClaimsDirectoryServiceSchemaorg.providerIdentifier]: required(input.organizationIdentifier, 'service_organization_required'),
    [ClaimsDirectoryServiceSchemaorg.placeIdentifier]: placeIdentifiers,
    [ClaimsDirectoryServiceSchemaorg.name]: required(input.name, 'service_name_required'),
    [ClaimsDirectoryServiceSchemaorg.serviceType]: serviceTypes,
    [ClaimsDirectoryServiceSchemaorg.userSelected]: input.userSelected ?? false,
  }
  const description = optional(input.description)
  if (description) claims[ClaimsDirectoryServiceSchemaorg.description] = description
  if (categories.length) claims[ClaimsDirectoryServiceSchemaorg.category] = categories
  if (areaServed.length) claims[ClaimsDirectoryServiceSchemaorg.areaServed] = areaServed
  return Object.freeze({ resourceType: 'Service', id, meta: Object.freeze({ claims: Object.freeze(claims) }) })
}

/** Builds a claims-only Schema.org Product; insurance details remain a public plan definition, not personal Coverage. */
export function buildProductDirectoryResource(input: ProductDirectoryInput): DirectoryResource {
  const id = required(input.id, 'product_id_required')
  if (!RESOURCE_ID_PATTERN.test(id)) throw new TypeError('product_id_invalid')
  const productType = required(input.productType, 'product_type_required')
  const categories = unique(input.categories, 'product_category_invalid')
  const areaServed = unique(input.areaServed, 'product_area_invalid')
  const url = optionalHttpsUrl(input.url, 'product_url_invalid')
  const imageUrl = optionalHttpsUrl(input.imageUrl, 'product_image_url_invalid')
  const availableFrom = input.availableFrom ? assertDate(input.availableFrom, 'product_period_invalid') : undefined
  const availableThrough = input.availableThrough ? assertDate(input.availableThrough, 'product_period_invalid') : undefined
  if (Boolean(availableFrom) !== Boolean(availableThrough) || (availableFrom && availableThrough && availableFrom > availableThrough)) throw new TypeError('product_period_invalid')
  if (input.price !== undefined && (!Number.isFinite(input.price) || input.price < 0)) throw new TypeError('product_price_invalid')
  const priceCurrency = optional(input.priceCurrency)?.toUpperCase()
  if ((input.price === undefined) !== (priceCurrency === undefined) || (priceCurrency && !/^[A-Z]{3}$/.test(priceCurrency))) throw new TypeError('product_price_invalid')
  if (productType === 'insurance-plan' && !input.insurance) throw new TypeError('insurance_product_profile_required')
  const coverageTypes = unique(input.insurance?.coverageTypes, 'insurance_coverage_type_invalid')
  if (input.insurance && !coverageTypes.length) throw new TypeError('insurance_coverage_type_invalid')
  const networks = unique(input.insurance?.networks, 'insurance_network_invalid')
  const claims: Record<string, DirectoryClaimValue> = {
    [ClaimsProductSchemaorg.identifier]: id,
    [ClaimsProductSchemaorg.providerIdentifier]: required(input.organizationIdentifier, 'product_organization_required'),
    [ClaimsProductSchemaorg.name]: required(input.name, 'product_name_required'),
    [ClaimsProductSchemaorg.additionalType]: productType,
    [ClaimsProductSchemaorg.userSelected]: input.userSelected ?? false,
  }
  const description = optional(input.description)
  if (description) claims[ClaimsProductSchemaorg.description] = description
  if (categories.length) claims[ClaimsProductSchemaorg.category] = categories
  if (areaServed.length) claims[ClaimsProductSchemaorg.areaServed] = areaServed
  if (url) claims[ClaimsProductSchemaorg.url] = url
  if (imageUrl) claims[ClaimsProductSchemaorg.imageContentUrl] = imageUrl
  if (availableFrom) claims[ClaimsProductSchemaorg.availabilityStarts] = availableFrom
  if (availableThrough) claims[ClaimsProductSchemaorg.availabilityEnds] = availableThrough
  if (input.price !== undefined) claims[ClaimsProductSchemaorg.price] = input.price
  if (priceCurrency) claims[ClaimsProductSchemaorg.priceCurrency] = priceCurrency
  if (input.insurance) claims[ClaimsProductSchemaorg.insuranceStatus] = input.insurance.status
  if (coverageTypes.length) claims[ClaimsProductSchemaorg.insuranceCoverageType] = coverageTypes
  if (networks.length) claims[ClaimsProductSchemaorg.insuranceNetwork] = networks
  return Object.freeze({ resourceType: 'Product', id, meta: Object.freeze({ claims: Object.freeze(claims) }) })
}

/** Rejects native fields and converts a directory resource into deterministic array-valued claims. */
export function normalizeDirectoryFlatClaimsResource(input: unknown): DirectoryFlatClaimsResource {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('directory_flat_resource_invalid')
  const value = input as Record<string, unknown>
  if ((value.resourceType !== 'Organization' && value.resourceType !== 'Place' && value.resourceType !== 'Service' && value.resourceType !== 'Product') || Object.keys(value).some(key => !['resourceType', 'id', 'meta'].includes(key))) throw new TypeError('directory_flat_resource_invalid')
  const resourceType = value.resourceType
  const id = required(value.id, 'directory_flat_resource_invalid')
  if (!RESOURCE_ID_PATTERN.test(id)) throw new TypeError('directory_flat_resource_invalid')
  const rawClaims = (value.meta as { claims?: unknown } | undefined)?.claims
  if (!rawClaims || typeof rawClaims !== 'object' || Array.isArray(rawClaims)) throw new TypeError('directory_flat_resource_invalid')
  const allowed = new Set<string>(DirectoryFlatClaimCatalog[resourceType])
  const claims: Record<string, readonly string[]> = {}
  for (const [name, raw] of Object.entries(rawClaims as Record<string, unknown>)) {
    if (!allowed.has(name)) throw new TypeError('directory_flat_claim_invalid')
    const values = (Array.isArray(raw) ? raw : [raw]).map(item => String(item).trim())
    if (!values.length || values.some(item => !item)) throw new TypeError('directory_flat_claim_invalid')
    claims[name] = Object.freeze([...new Set(values)])
  }
  return Object.freeze({ resourceType, id, meta: Object.freeze({ claims: Object.freeze(claims) }) })
}
