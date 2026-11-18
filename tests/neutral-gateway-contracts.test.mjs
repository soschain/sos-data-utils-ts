// Flow contract: preserve reviewed scheduling, directory, provenance, catalogue, jurisdiction and signed-SHC preparation bytes while each authority and policy remains explicit; reject native nested writes and mismatched controllers, and never substitute an unsigned Demo card for issuer signing.
import assert from 'node:assert/strict'
import test from 'node:test'
import {createHash} from 'node:crypto'
import * as api from '../dist/index.js'
import {REPOSITORY_SAFE_EXAMPLES as safe} from '../dist/repository-privacy.js'

const scoped = safe.organizationScopedResources
const authority = {organizationIdentifier: safe.organizationBusinessNumber, controllerIdentifier: safe.didWeb, actingControllerIdentifier: safe.didWeb}
const location = {id: scoped.placeUuid, organizationReference: scoped.organizationUrn, name: safe.organizationLegalName, latitude: 0, longitude: 0}
const place = {id: scoped.placeUuid, organizationIdentifier: scoped.organizationUrn, name: safe.organizationLegalName,
  address: {addressCountry: safe.countryIso2, postalCode: safe.tenantId}, position: {latitude: 0, longitude: 0}}
const department = {id: scoped.departmentUuid, legalOrganizationIdentifier: scoped.organizationUrn, name: safe.organizationLegalName, placeIdentifiers: [scoped.placeUuid]}
const service = {id: scoped.serviceUuid, organizationIdentifier: scoped.departmentUuid, name: safe.organizationLegalName, placeIdentifiers: [scoped.placeUuid], serviceTypes: [safe.sector]}
const product = {id: safe.resourceUuid, organizationIdentifier: scoped.organizationUrn, name: safe.organizationLegalName, productType: 'insurance-plan', insurance: {status: 'active', coverageTypes: [safe.sector]}}
const provenance = {id: safe.resourceUuid, researchStudyReference: `ResearchStudy/${safe.resourceUuid}`, recorded: new Date(scoped.slotStart).toISOString(), agents: [{type: 'author', who: `PractitionerRole/${safe.resourceUuid}`} ]}
const bundle = {resourceType: 'Bundle', type: 'collection', entry: [{fullUrl: `urn:uuid:${safe.resourceUuid}`, resource: {resourceType: 'Observation', id: safe.resourceUuid, status: 'final', code: {text: safe.organizationLegalName}}}]}
const shc = {issuer: safe.httpsBaseUrl, notBefore: 0, kid: safe.resourceUuid, fhirVersion: '4.0.1', fhirBundle: bundle}

// Golden vectors captured from released vet-data-utils-ts@0.8.7 using governed synthetic fixtures.
// Reviewed source revision: ce71d5c4f43f99e73bf56c1168030228e2f89cb9. No predecessor package is loaded at test time.
const reviewed = Object.freeze({
  "location": "{\"resourceType\":\"Location\",\"id\":\"00000000-0000-4000-8000-000000000012\",\"meta\":{\"claims\":{\"Location.identifier\":\"00000000-0000-4000-8000-000000000012\",\"Location.status\":\"active\",\"Location.name\":\"Example Animal Care Organization\",\"Location.near\":\"0|0\",\"Location.organization\":\"urn:cds-ca-bc:v1:organization:bn:123456789\"}}}",
  "normalizedLocation": "{\"resourceType\":\"Location\",\"id\":\"00000000-0000-4000-8000-000000000012\",\"meta\":{\"claims\":{\"Location.identifier\":[\"00000000-0000-4000-8000-000000000012\"],\"Location.status\":[\"active\"],\"Location.name\":[\"Example Animal Care Organization\"],\"Location.near\":[\"0|0\"],\"Location.organization\":[\"urn:cds-ca-bc:v1:organization:bn:123456789\"]}}}",
  "directory": [
    "{\"resourceType\":\"Organization\",\"id\":\"00000000-0000-4000-8000-000000000010\",\"meta\":{\"claims\":{\"org.schema.Organization.identifier\":\"00000000-0000-4000-8000-000000000010\",\"org.schema.Organization.name\":\"Example Animal Care Organization\",\"org.schema.Organization.parentOrganization.identifier\":\"urn:cds-ca-bc:v1:organization:bn:123456789\",\"org.schema.Organization.sameAs\":\"Organization/00000000-0000-4000-8000-000000000010\",\"org.schema.Organization.location.identifier\":[\"00000000-0000-4000-8000-000000000012\"],\"Organization.user-selected\":false}}}",
    "{\"resourceType\":\"Place\",\"id\":\"00000000-0000-4000-8000-000000000012\",\"meta\":{\"claims\":{\"org.schema.Place.identifier\":\"00000000-0000-4000-8000-000000000012\",\"org.schema.Place.owner.identifier\":\"urn:cds-ca-bc:v1:organization:bn:123456789\",\"org.schema.Place.name\":\"Example Animal Care Organization\",\"org.schema.Place.address.addressCountry\":\"CA\",\"org.schema.Place.address.postalCode\":\"example-tenant\",\"org.schema.Place.geo.latitude\":0,\"org.schema.Place.geo.longitude\":0,\"org.schema.Place.publicAccess\":true,\"Place.user-selected\":false}}}",
    "{\"resourceType\":\"Service\",\"id\":\"00000000-0000-4000-8000-000000000011\",\"meta\":{\"claims\":{\"org.schema.Service.identifier\":\"00000000-0000-4000-8000-000000000011\",\"org.schema.Service.provider.identifier\":\"00000000-0000-4000-8000-000000000010\",\"org.schema.Service.availableChannel.serviceLocation.identifier\":[\"00000000-0000-4000-8000-000000000012\"],\"org.schema.Service.name\":\"Example Animal Care Organization\",\"org.schema.Service.serviceType\":[\"animal-care\"],\"Service.user-selected\":false}}}",
    "{\"resourceType\":\"Product\",\"id\":\"00000000-0000-4000-8000-000000000001\",\"meta\":{\"claims\":{\"org.schema.Product.identifier\":\"00000000-0000-4000-8000-000000000001\",\"org.schema.Product.provider.identifier\":\"urn:cds-ca-bc:v1:organization:bn:123456789\",\"org.schema.Product.name\":\"Example Animal Care Organization\",\"org.schema.Product.additionalType\":\"insurance-plan\",\"Product.user-selected\":false,\"org.schema.Product.additionalProperty.insuranceStatus\":\"active\",\"org.schema.Product.additionalProperty.insuranceCoverageType\":[\"animal-care\"]}}}"
  ],
  "normalizedDirectory": [
    "{\"resourceType\":\"Organization\",\"id\":\"00000000-0000-4000-8000-000000000010\",\"meta\":{\"claims\":{\"org.schema.Organization.identifier\":[\"00000000-0000-4000-8000-000000000010\"],\"org.schema.Organization.name\":[\"Example Animal Care Organization\"],\"org.schema.Organization.parentOrganization.identifier\":[\"urn:cds-ca-bc:v1:organization:bn:123456789\"],\"org.schema.Organization.sameAs\":[\"Organization/00000000-0000-4000-8000-000000000010\"],\"org.schema.Organization.location.identifier\":[\"00000000-0000-4000-8000-000000000012\"],\"Organization.user-selected\":[\"false\"]}}}",
    "{\"resourceType\":\"Place\",\"id\":\"00000000-0000-4000-8000-000000000012\",\"meta\":{\"claims\":{\"org.schema.Place.identifier\":[\"00000000-0000-4000-8000-000000000012\"],\"org.schema.Place.owner.identifier\":[\"urn:cds-ca-bc:v1:organization:bn:123456789\"],\"org.schema.Place.name\":[\"Example Animal Care Organization\"],\"org.schema.Place.address.addressCountry\":[\"CA\"],\"org.schema.Place.address.postalCode\":[\"example-tenant\"],\"org.schema.Place.geo.latitude\":[\"0\"],\"org.schema.Place.geo.longitude\":[\"0\"],\"org.schema.Place.publicAccess\":[\"true\"],\"Place.user-selected\":[\"false\"]}}}",
    "{\"resourceType\":\"Service\",\"id\":\"00000000-0000-4000-8000-000000000011\",\"meta\":{\"claims\":{\"org.schema.Service.identifier\":[\"00000000-0000-4000-8000-000000000011\"],\"org.schema.Service.provider.identifier\":[\"00000000-0000-4000-8000-000000000010\"],\"org.schema.Service.availableChannel.serviceLocation.identifier\":[\"00000000-0000-4000-8000-000000000012\"],\"org.schema.Service.name\":[\"Example Animal Care Organization\"],\"org.schema.Service.serviceType\":[\"animal-care\"],\"Service.user-selected\":[\"false\"]}}}",
    "{\"resourceType\":\"Product\",\"id\":\"00000000-0000-4000-8000-000000000001\",\"meta\":{\"claims\":{\"org.schema.Product.identifier\":[\"00000000-0000-4000-8000-000000000001\"],\"org.schema.Product.provider.identifier\":[\"urn:cds-ca-bc:v1:organization:bn:123456789\"],\"org.schema.Product.name\":[\"Example Animal Care Organization\"],\"org.schema.Product.additionalType\":[\"insurance-plan\"],\"Product.user-selected\":[\"false\"],\"org.schema.Product.additionalProperty.insuranceStatus\":[\"active\"],\"org.schema.Product.additionalProperty.insuranceCoverageType\":[\"animal-care\"]}}}"
  ],
  "provenance": "{\"resourceType\":\"Provenance\",\"id\":\"00000000-0000-4000-8000-000000000001\",\"meta\":{\"claims\":{\"Provenance.target\":[\"ResearchStudy/00000000-0000-4000-8000-000000000001\"],\"Provenance.recorded\":[\"2026-09-29T16:00:00.000Z\"],\"Provenance.agent\":[\"PractitionerRole/00000000-0000-4000-8000-000000000001\"],\"Provenance.agent-type\":[\"http://terminology.hl7.org/CodeSystem/provenance-participant-type|author\"],\"Provenance.agent-author-who\":[\"PractitionerRole/00000000-0000-4000-8000-000000000001\"]}}}",
  "dataset": "{\"resourceType\":\"Dataset\",\"id\":\"00000000-0000-4000-8000-000000000001\",\"meta\":{\"claims\":{\"dct.identifier\":\"00000000-0000-4000-8000-000000000001\",\"dct.title\":\"Example Animal Care Organization\",\"dct.description\":\"Example Animal Care Organization\",\"dct.creator\":\"did:web:example.invalid:example-tenant\",\"dct.publisher\":\"123456789\",\"geodcatap.custodian\":\"urn:cds-ca-bc:v1:organization:bn:123456789\",\"dct.accessRights\":\"RESTRICTED\",\"dcatap.applicableLegislation\":[\"GDPR\"],\"dcat.distribution\":[\"00000000-0000-4000-8000-000000000012\"],\"dct.source\":\"00000000-0000-4000-8000-000000000001\",\"dct.provenance\":\"curated-dataset:00000000-0000-4000-8000-000000000001\",\"dpv.hasPersonalData\":true,\"healthdcatap.healthCategory\":[\"animal-care\"],\"healthdcatap.hdab\":\"did:web:example.invalid:example-tenant\",\"healthdcatap.hasStructuredData\":true,\"Dataset.user-selected\":true,\"healthdcatap.hasVariables\":[\"00000000-0000-4000-8000-000000000001\"]}}}",
  "isoCountryCount": 249,
  "isoSubdivisionCount": 5046,
  "shcHeader": "eyJhbGciOiJFUzI1NiIsInppcCI6IkRFRiIsImtpZCI6IjAwMDAwMDAwLTAwMDAtNDAwMC04MDAwLTAwMDAwMDAwMDAwMSJ9",
  "shcPayload": "ZZAxT8MwEIX_SnSsIU0lJm-AmDsAXaoOF-dCjC5OdL5ELVX-O3ZdYGCyvnd-7_x8ARcCGOhVp2A2GzrhMDFVzi_IroUSfNOBqUtYLJgLWKGWvDrk17n5JKtJ7HonT7NvmRLFsZzBHKI-M78Lx3ihMM5iydQx8QeueWN7PZVOMQpe8vri0bsBuXhGoWInH-jdF6obPax_9rfzFK2wawLJkqclBEWdU6HOeWRY1-M_w-2lJWhmOzLHIrf01GVPEhIaeKjqapvkfPfw-09hQNGekLWvLEob7jLcJ4Djun4D",
  "shcPayloadBytes": "eyJpc3MiOiJodHRwczovL2V4YW1wbGUuaW52YWxpZCIsIm5iZiI6MCwidmMiOnsiY3JlZGVudGlhbFN1YmplY3QiOnsiZmhpckJ1bmRsZSI6eyJlbnRyeSI6W3siZnVsbFVybCI6InJlc291cmNlOjAiLCJyZXNvdXJjZSI6eyJjb2RlIjp7InRleHQiOiJFeGFtcGxlIEFuaW1hbCBDYXJlIE9yZ2FuaXphdGlvbiJ9LCJyZXNvdXJjZVR5cGUiOiJPYnNlcnZhdGlvbiIsInN0YXR1cyI6ImZpbmFsIn19XSwicmVzb3VyY2VUeXBlIjoiQnVuZGxlIiwidHlwZSI6ImNvbGxlY3Rpb24ifSwiZmhpclZlcnNpb24iOiI0LjAuMSJ9LCJ0eXBlIjpbImh0dHBzOi8vc21hcnRoZWFsdGguY2FyZHMjaGVhbHRoLWNhcmQiXX19",
  "shcQr": "[\"shc:/56762959532654603460292540772804336028702865676754222809286237253760287028647167452228092861207432232074322320743139207432232071332320743222030732232074313920743223207432232074322320743238291201454520753911327424284350386538702840036329640020642370204352663425005522612208345531082431414300340645554426227673655500105075112037542226345941670520052677695932232541776050286966403857333421684071443129583142302642732369620410650829307129102766653910337364373125704577212730280032101131750660593232086076553675113656725642331035454134323667561173696003537021724359266642286527006155250966533552755012695777253005745274312962685463212442554009273456423744040032507400056329425964347731272869570304264135245928525630616852677362573557740003125936332656623142733124665310613154290723617265072301540663725526596355266361\"]"
})

test('exposes the neutral gateway contracts without a product-package dependency', () => {
  for (const name of ['normalizeSchedulingFlatClaimsResource', 'normalizeDirectoryFlatClaimsResource',
    'normalizeProvenanceR5FlatClaimsResource', 'normalizeHealthDcatResource', 'isIso3166CountryCode',
    'prepareSmartHealthCard', 'decodeSmartHealthCardPayloadBytes']) assert.equal(typeof api[name], 'function', `Missing neutral contract: ${name}`)
  assert.deepEqual(api.PaymentProviderIds, {Stripe: 'STRIPE', EvmTransfer: 'EVM_TRANSFER'})
})

test('preserves claims-only scheduling and rejects nested native and unknown claims', () => {
  const actual = api.buildLocationResource(location)
  assert.equal(JSON.stringify(actual), reviewed.location)
  assert.equal(JSON.stringify(api.normalizeSchedulingFlatClaimsResource(actual)), reviewed.normalizedLocation)
  assert.throws(() => api.normalizeSchedulingFlatClaimsResource({...actual, status: 'active'}))
  assert.throws(() => api.normalizeSchedulingFlatClaimsResource({...actual, meta: {claims: {'Location.unreviewed': 'x'}}}))
})

test('preserves public department, place, service and product claims without granting authority', () => {
  const builders = [[api.buildDepartmentDirectoryResource, department], [api.buildPlaceDirectoryResource, place],
    [api.buildServiceDirectoryResource, service], [api.buildProductDirectoryResource, product]]
  for (const [index, [builder, input]] of builders.entries()) {
    assert.equal(JSON.stringify(builder(input)), reviewed.directory[index])
    assert.equal(JSON.stringify(api.normalizeDirectoryFlatClaimsResource(builder(input))), reviewed.normalizedDirectory[index])
  }
  assert.throws(() => api.normalizeDirectoryFlatClaimsResource({...api.buildPlaceDirectoryResource(place), address: {country: safe.countryIso2}}))
  assert.throws(() => api.buildServiceDirectoryResource({...service, placeIdentifiers: []}))
})

test('preserves correlated Provenance agents and exact assignment-derived references', () => {
  assert.equal(api.buildPractitionerRoleReferenceFromAssignmentIdentifier(safe.resourceUuid), `PractitionerRole/${safe.resourceUuid}`)
  assert.equal(JSON.stringify(api.buildResearchStudyProvenanceResource(provenance)), reviewed.provenance)
  assert.throws(() => api.normalizeProvenanceR5FlatClaimsResource({resourceType: 'Provenance', id: safe.resourceUuid, agent: [], meta: {claims: {}}}))
  assert.throws(() => api.buildResearchStudyProvenanceResource({...provenance, agents: []}))
})

test('requires the exact controller for dataset publication and catalogue status transitions', () => {
  const input = {...authority, id: safe.resourceUuid, sector: safe.sector, title: safe.organizationLegalName, description: safe.organizationLegalName,
    publisherRole: 'data-holder', dataHolderIdentifier: scoped.organizationUrn, sourceKind: 'curated-dataset', sourceReference: safe.resourceUuid,
    accessRights: 'RESTRICTED', anonymizationStatus: 'pseudonymized', healthCategory: [safe.sector], healthDataAccessBodyIdentifier: safe.didWeb,
    structuredData: true, variableTableGroupIdentifiers: [safe.resourceUuid], distributionIdentifiers: [scoped.placeUuid], applicableLegislation: ['GDPR']}
  const dataset = api.buildHealthDcatDataset(input)
  assert.equal(JSON.stringify(dataset), reviewed.dataset)
  assert.throws(() => api.buildHealthDcatDataset({...input, actingControllerIdentifier: safe.resourceUuid}))
  assert.throws(() => api.updateHealthDcatCatalogRecordStatus({...authority, actingControllerIdentifier: safe.resourceUuid,
    record: {resourceType: 'CatalogRecord', id: safe.resourceUuid, meta: {claims: {}}}, status: 'archived', modifiedAt: provenance.recorded}))
})

test('validates the complete ISO country/subdivision catalogue and keeps country binding exact', () => {
  assert.equal(createHash('sha256').update(JSON.stringify({countries: api.Iso3166Countries, subdivisions: api.Iso3166Subdivisions})).digest('hex'), '5c3fe585e8bf4c9540a71382231441c69cd894ce8f36adf29288042f705b954f')
  assert.equal(api.Iso3166Countries.length, reviewed.isoCountryCount)
  assert.equal(api.Iso3166Subdivisions.length, reviewed.isoSubdivisionCount)
  assert.equal(api.isIso3166CountryCode(safe.countryIso2), true)
  assert.equal(api.isIso3166CountryCode('ZZ'), false)
  assert.equal(api.isIso3166SubdivisionForCountry('CA-BC', safe.countryIso2), true)
  assert.equal(api.isIso3166SubdivisionForCountry('US-CA', safe.countryIso2), false)
})

test('prepares exact signed-SHC issuer input and decodes the same payload without claiming a signature', () => {
  const actual = api.prepareSmartHealthCard(shc)
  assert.equal(actual.encodedHeader, reviewed.shcHeader)
  assert.equal(actual.encodedPayload, reviewed.shcPayload)
  assert.equal(Buffer.from(actual.payloadBytes).toString('base64url'), reviewed.shcPayloadBytes)
  // The placeholder signature exercises encoding only; no verification result is produced.
  const compact = `${actual.signingInput}.c3ludGhldGlj`
  assert.deepEqual(api.decodeSmartHealthCardPayloadBytes(compact), actual.payloadBytes)
  const qr = api.encodeSoschainSmartHealthCardQr(compact)
  assert.equal(JSON.stringify(qr), reviewed.shcQr)
  assert.equal(api.decodeSoschainSmartHealthCardQr(qr), compact)
  assert.throws(() => api.prepareSmartHealthCard({...shc, issuer: safe.httpsBaseUrl.replace('https:', 'http:')}))
})

test('requires an explicit notification profile instead of assigning another product topic', () => {
  const input = {id: safe.resourceUuid, appointmentReference: `Appointment/${safe.resourceUuid}`,
    actorReference: safe.didWeb, participantStatus: 'accepted', respondedAt: provenance.recorded,
    notificationRecipientReference: scoped.organizationUrn, notificationRecipientEmail: safe.individualEmail}
  assert.throws(() => api.buildAppointmentResponseResource(input), /profile/i)
  const topic = `${safe.httpsBaseUrl}/topics|appointment-response`
  const response = api.buildAppointmentResponseResource({...input, notificationProfile: {appointmentResponseTopic: topic}})
  assert.equal(response.contained[0].meta.claims['Communication.topic'], topic)
})
