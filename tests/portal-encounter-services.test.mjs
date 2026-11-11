// Flow contract: synthetic assigned services are shared across both BFFs, unique per organization and bounded to canonical resource references; catalog entries never grant professional authority.
import test from 'node:test'
import assert from 'node:assert/strict'
import * as data from '../dist/index.js'
import {SOSCHAIN_DEMO_ORGANIZATIONS} from '../dist/portal-access-profiles.data.js'
import {EncounterClaim as E} from 'fhir-data-utils-ts/claims'
import {REPOSITORY_SAFE_EXAMPLES as examples} from '../dist/repository-privacy.js'
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

test('Demo Encounter presentation resolves service references without changing canonical claims',()=>{
  for(const org of SOSCHAIN_DEMO_ORGANIZATIONS.filter(item=>['health-care','animal-care'].includes(item.sector))){
    const reference=org.organizationUrn.replace('urn:uuid:','Organization/'),service=data.createPortalDemoEncounterServices(reference)[0]
    const base=data.portalCareEntryFromView({kind:'encounter',id:examples.resourceUuid,title:'Encounter',status:'planned',organizationReference:reference},examples.didWeb)
    const entry={...base,claims:{...base.claims,[E.ServiceType]:service.reference}}
    const before=structuredClone(entry),view=data.portalDemoCareViewFromEntry(entry)
    assert.ok(!view.title.includes('HealthcareService/'))
    assert.equal(view.senderName,service.label)
    assert.deepEqual(entry,before)
    if(org.sector==='health-care')assert.ok(!view.title.toLowerCase().includes('veterinary'))
    else assert.equal(view.title,`Emergency encounter at ${PORTAL_DEMO_SERVICE_DIRECTORY[0].organization.name}`)
  }
})
