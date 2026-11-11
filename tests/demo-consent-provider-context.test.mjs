// Flow contract: synthetic organizations expose stable distinct Consent targets and a governed jurisdiction; the Demo catalog supplies test context and never grants employment or access authority.
import test from 'node:test'
import assert from 'node:assert/strict'
import {SOSCHAIN_DEMO_ORGANIZATIONS} from '../dist/portal-access-profiles.data.js'
import {REPOSITORY_SAFE_EXAMPLES as examples} from '../dist/repository-privacy.js'
test('each Demo organization has its own non-operational domain and country for Consent matching',()=>{
 const domains=new Set()
 for(const organization of SOSCHAIN_DEMO_ORGANIZATIONS){
  assert.equal(organization.jurisdiction,examples.countryIso2)
  assert.ok(organization.organizationDid.startsWith('did:web:'))
  assert.ok(organization.organizationDomain.endsWith('.'+examples.domain))
  assert.equal(organization.organizationDid,'did:web:'+organization.organizationDomain)
  assert.equal(organization.grantsAuthority,false)
  domains.add(organization.organizationDomain)
 }
 assert.equal(domains.size,SOSCHAIN_DEMO_ORGANIZATIONS.length)
})
