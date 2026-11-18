// Flow contract: parsing preserves the complete hosted organization boundary and never merges tenants sharing a hostname; legacy root identities retain their interpretation and parsing grants no authority.
import test from 'node:test'
import assert from 'node:assert/strict'
import {buildAuthorityDidWeb} from 'antifraud-data-utils-ts/organization-identity'
import {parseActorFromSub} from '../dist/actor-identity.js'
import {buildOrganizationDidWeb,buildProfessionalDidWeb} from '../dist/hosted-did.js'
import {REPOSITORY_SAFE_EXAMPLES as safe} from '../dist/repository-privacy.js'
import {HealthcareActorRoles} from '../dist/healthcare-roles.js'
import {DataspaceSectors} from '../dist/dataspace-sectors.js'
import {EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_CONTEXT as context} from '../dist/gateway-resource-flow-examples.js'

const organization=tenantId=>buildOrganizationDidWeb({hostDidWeb:safe.didWeb,tenantId,jurisdiction:context.jurisdiction,sector:DataspaceSectors.HealthCare})
const actor=organizationDidWeb=>buildProfessionalDidWeb({organizationDidWeb,email:safe.individualEmail,role:HealthcareActorRoles.Physician})

test('retains the full organization prefix of a canonical hosted professional DID',()=>{
 const did=organization(context.providerTenantId)
 const parsed=parseActorFromSub(actor(did))
 assert.equal(parsed.organization,did)
 assert.equal(parsed.role,HealthcareActorRoles.Physician)
 assert.equal(parsed.memberKind,'organization')
})
test('different hosted tenants on one hostname remain distinct even for the same contact and role',()=>{
 const provider=organization(context.providerTenantId),consumer=organization(context.consumerTenantId)
 const first=parseActorFromSub(actor(provider)),second=parseActorFromSub(actor(consumer))
 assert.notEqual(provider,consumer)
 assert.equal(first.organization,provider)
 assert.equal(second.organization,consumer)
 assert.notEqual(first.organization,second.organization)
 assert.equal(first.identifier,second.identifier)
})
test('legacy root organization professional identities retain their exact original organization',()=>{
 const root=buildAuthorityDidWeb({authority:safe.httpsBaseUrl})
 const parsed=parseActorFromSub(actor(root))
 assert.equal(parsed.organization,root)
 assert.equal(parsed.role,HealthcareActorRoles.Physician)
 assert.deepEqual(parseActorFromSub(''),{sub:''})
})
