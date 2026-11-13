// Flow contract: organization verification carries explicit public bindings and governed business claims while document evidence stays at the message boundary; constructing the bundle grants no admission or activation.
import assert from 'node:assert/strict'
import test from 'node:test'
import {buildLegalOrganizationVerificationTransactionBundle} from '../dist/gateway-transport-contract.js'
import {REPOSITORY_SAFE_EXAMPLES as safe} from '../dist/repository-privacy.js'
import {SchemaOrgServiceClaim} from 'antifraud-data-utils-ts/organization-service-catalog'

test('builds isolated verification data without collapsing evidence into business claims',()=>{
  const input={claims:{[SchemaOrgServiceClaim.Category]:safe.sector},controller:{did:safe.didWeb,email:safe.individualEmail},attachments:[{id:'synthetic-evidence'}]}
  const bundle=buildLegalOrganizationVerificationTransactionBundle(input)
  assert.equal(bundle.data[0].resource.verification.resourceType,'contract')
  assert.equal(bundle.data[0].resource.controller.did,safe.didWeb)
  assert.deepEqual(bundle.attachments,input.attachments)
  assert.equal(Object.hasOwn(bundle.data[0].resource,'attachments'),false)
  bundle.data[0].resource.meta.claims[SchemaOrgServiceClaim.Category]='changed'
  assert.equal(input.claims[SchemaOrgServiceClaim.Category],safe.sector)
  assert.throws(()=>buildLegalOrganizationVerificationTransactionBundle({...input,claims:{}}))
})
