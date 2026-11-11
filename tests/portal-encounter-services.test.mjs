// Flow contract: synthetic assigned services are shared across both BFFs, unique per organization and bounded to canonical resource references; catalog entries never grant professional authority.
import test from 'node:test'
import assert from 'node:assert/strict'
import * as data from '../dist/index.js'
import {SOSCHAIN_DEMO_ORGANIZATIONS} from '../dist/portal-access-profiles.data.js'
import {PORTAL_DEMO_SERVICE_DIRECTORY} from '../dist/portal-demo-service-directory.js'
test('human, animal and operational organizations retain distinct services and the existing veterinary service',()=>{
  const references=[]
  for(const org of SOSCHAIN_DEMO_ORGANIZATIONS){
    const organizationReference=org.organizationUrn.replace('urn:uuid:','Organization/')
    const services=data.createPortalDemoEncounterServices(organizationReference)
    assert.equal(services.length,3)
    for(const service of services){
      assert.equal(service.organizationReference,organizationReference)
      assert.match(service.reference,/^HealthcareService\/[A-Za-z0-9.-]{1,64}$/u)
      assert.ok(service.label&&service.classToken)
      references.push(service.reference)
    }
  }
  assert.equal(new Set(references).size,references.length)
  const legacy=PORTAL_DEMO_SERVICE_DIRECTORY[0]
  assert.equal(data.createPortalDemoEncounterServices(legacy.organization.reference)[0].reference,legacy.service.reference)
})
test('malformed organization references cannot become a catalog',()=>{
  for(const reference of ['',undefined,'Organization/*','Group/not-an-organization'])assert.throws(()=>data.createPortalDemoEncounterServices(reference),/organization/)
})
