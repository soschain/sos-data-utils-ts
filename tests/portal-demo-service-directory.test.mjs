// Flow contract: Personal Demo discovers one governed synthetic veterinary service by required country, optional region and service type; no portal invents organization, routing or location identifiers.
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  PORTAL_DEMO_SERVICE_DIRECTORY,
  searchPortalDemoServices,
} from '../dist/portal-demo-service-directory.js'
import {REPOSITORY_SAFE_EXAMPLES as safe} from '../dist/repository-privacy.js'

test('finds the shared veterinary emergency service by country, region and type',()=>{
  const results=searchPortalDemoServices(PORTAL_DEMO_SERVICE_DIRECTORY,{
    country:safe.countryIso2,
    region:'CA-BC',
    serviceType:'emergency-veterinary-care',
  })
  assert.equal(results.length,1)
  assert.equal(results[0].organization.name,safe.organizationLegalName)
  assert.equal(results[0].place.country,safe.countryIso2)
  assert.equal(results[0].place.region,'CA-BC')
  assert.equal(results[0].service.emergency,true)
  assert.match(results[0].routing.professionalGroupReference,/^Group\//u)
})

test('treats region as optional and rejects absent or unsupported countries',()=>{
  assert.equal(searchPortalDemoServices(PORTAL_DEMO_SERVICE_DIRECTORY,{
    country:safe.countryIso2,
    serviceType:'emergency-veterinary-care',
  }).length,1)
  assert.throws(()=>searchPortalDemoServices(PORTAL_DEMO_SERVICE_DIRECTORY,{
    country:'',serviceType:'emergency-veterinary-care',
  }),/portal_demo_service_country_required/u)
  assert.deepEqual(searchPortalDemoServices(PORTAL_DEMO_SERVICE_DIRECTORY,{
    country:'US',serviceType:'emergency-veterinary-care',
  }),[])
})

test('returns no match for another region or service type',()=>{
  assert.deepEqual(searchPortalDemoServices(PORTAL_DEMO_SERVICE_DIRECTORY,{
    country:safe.countryIso2,region:'CA-ON',serviceType:'emergency-veterinary-care',
  }),[])
  assert.deepEqual(searchPortalDemoServices(PORTAL_DEMO_SERVICE_DIRECTORY,{
    country:safe.countryIso2,serviceType:'human-emergency-care',
  }),[])
})
