// Flow contract: Personal Demo discovers one governed synthetic veterinary service by required country, optional region and service type; no portal invents organization, routing or location identifiers.
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  PORTAL_DEMO_SERVICE_DIRECTORY,
  searchPortalDemoServices,
  formatPortalDemoOrganizationName,
} from '../dist/portal-demo-service-directory.js'
import {SOSCHAIN_DEMO_ORGANIZATIONS} from '../dist/portal-access-profiles.data.js'
import {REPOSITORY_SAFE_EXAMPLES as safe} from '../dist/repository-privacy.js'

test('labels an organization with four leading and four trailing Base58 UUID bytes characters',()=>{
  const label=formatPortalDemoOrganizationName('Dentist Demo Clinic',safe.demoOrganizationUuids.healthCare)
  assert.match(label,/^Dentist Demo Clinic · [1-9A-HJ-NP-Za-km-z]{4}…[1-9A-HJ-NP-Za-km-z]{4}$/u)
  assert.equal(label,'Dentist Demo Clinic · 1111…qZjE')
  assert.equal(label,formatPortalDemoOrganizationName('Dentist Demo Clinic',safe.demoOrganizationUuids.healthCare.toUpperCase()))
  assert.throws(()=>formatPortalDemoOrganizationName('Dentist Demo Clinic','3F9a…k7Qx'),/uuid/u)
})

test('publishes a synthetic dental service in ES-MD under the governed healthcare organization',()=>{
  const [dental]=searchPortalDemoServices(PORTAL_DEMO_SERVICE_DIRECTORY,{country:'ES',region:'ES-MD',serviceType:'emergency-dental-care'})
  assert.ok(dental)
  assert.equal(dental.organization.name,'Dentist Demo Clinic')
  assert.equal(dental.organization.reference,`Organization/${safe.demoOrganizationUuids.healthCare}`)
  assert.equal(dental.subjectKind,'human')
  assert.equal(dental.sector,'health-care')
  assert.equal(dental.service.emergency,true)
  assert.equal(dental.booking.enabled,true)
  assert.equal(dental.demo,true)
})

test('finds the shared veterinary emergency service by country, region and type',()=>{
  const results=searchPortalDemoServices(PORTAL_DEMO_SERVICE_DIRECTORY,{
    country:safe.countryIso2,
    region:'CA-BC',
    serviceType:'emergency-veterinary-care',
  })
  assert.equal(results.length,1)
  assert.equal(results[0].organization.name,SOSCHAIN_DEMO_ORGANIZATIONS.find(item=>item.sector==='animal-care').titleEn)
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

test('service directory and contact catalog use the same sector-first organization name',async()=>{
 const {SOSCHAIN_DEMO_ORGANIZATIONS}=await import('../dist/portal-access-profiles.data.js')
 assert.equal(PORTAL_DEMO_SERVICE_DIRECTORY[0].organization.name,SOSCHAIN_DEMO_ORGANIZATIONS.find(item=>item.sector==='animal-care').titleEn)
})
