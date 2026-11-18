// Flow contract: discovery country and emergency vocabularies describe a profile;
// they never authorize an actor or bypass subject validation.
import test from 'node:test'
import assert from 'node:assert/strict'
import {isEuCountryCode,normalizeCountryCode,EU_COUNTRY_CODES} from 'sos-data-utils-ts/eu-countries'
import {AnimalEmergencyProfile,HealthcareConsentActions,GatewayResourceTypes} from 'sos-data-utils-ts/gateway-profile-values'
import {HealthcareCoreSections as S} from 'sos-data-utils-ts/healthcare-sections'

test('discovery normalizes country membership without accepting a region as a country',()=>{
 assert.equal(EU_COUNTRY_CODES.length,27)
 assert.equal(normalizeCountryCode(' es '),'ES')
 assert.equal(isEuCountryCode('es'),true)
 assert.equal(isEuCountryCode('CA'),false)
 assert.equal(isEuCountryCode('EU'),false)
})
test('existing emergency profile and consent selection wire values remain unchanged',()=>{
 assert.deepEqual(AnimalEmergencyProfile,{ReasonCode:'animal-emergency',MaxLifetimeSeconds:900})
 assert.equal(HealthcareConsentActions.PatientSummaryDocument,S.PatientSummaryDocument.attributeValue)
 assert.equal(HealthcareConsentActions.AllergiesAndIntolerances,S.AllergiesAndIntolerances.attributeValue)
 assert.equal(GatewayResourceTypes.Customer,'Customer')
})

test('route and host-network wire labels are available independently of deployment policy',async()=>{
 const {GatewayJobActions,HostNetworkTypes}=await import('sos-data-utils-ts/gateway-profile-values')
 const {KnownClaimNamespaces}=await import('sos-data-utils-ts/gateway-transport-values')
 assert.equal(GatewayJobActions._batch,'_batch')
 assert.equal(GatewayJobActions._search,'_search')
 assert.equal(HostNetworkTypes.Test,'test')
 assert.equal(KnownClaimNamespaces['org.hl7.fhir.api'],'org.hl7.fhir.api')
})

test('retains the registration request discriminator independently of response types',async()=>{
 const {GatewayRequestEntryTypes}=await import('sos-data-utils-ts/gateway-response-contract')
 assert.equal(GatewayRequestEntryTypes.OrganizationOrder,'Organization-order-request-v1.0')
})
