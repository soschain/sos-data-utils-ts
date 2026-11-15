// Flow contract: existing tenant lifecycle wire keys and readback/purge DTOs are owned independently; status counters remain server evidence rather than authority, and a contained Occupation record ID stays distinct from an inferred FHIR role or contact identity.
import assert from 'node:assert/strict'
import test from 'node:test'
import {execFileSync} from 'node:child_process'
import {createRequire} from 'node:module'
import {fileURLToPath} from 'node:url'
const require=createRequire(import.meta.url)
const owned=await import('../dist/organization-lifecycle-contract.js').catch(error=>{
 if(error.code==='ERR_MODULE_NOT_FOUND')return {}
 throw error
})
const compile=name=>execFileSync(process.execPath,[require.resolve('typescript/bin/tsc'),'--noEmit','--strict','--skipLibCheck','--target','ES2023','--module','NodeNext','--moduleResolution','NodeNext',fileURLToPath(new URL('./fixtures/'+name,import.meta.url))],{stdio:'pipe'})
test('owns the complete existing three-key tenant authorization lifecycle profile',()=>{
 assert.deepEqual(owned.OrganizationLifecycleClaim,{
  TenantAuthorizationStatus:'org.schema.Action.tenantAuthorization.status',
  TenantAuthorizationChangedBy:'org.schema.Action.tenantAuthorization.changedBy',
  TenantAuthorizationLifecycleDisposition:'org.schema.Action.tenantAuthorization.lifecycleDisposition',
 })
 assert.equal(Object.isFrozen(owned.OrganizationLifecycleClaim),true)
})
test('public typed lifecycle readers distinguish actual snapshots from terminal purge receipts',()=>{
 compile('organization-lifecycle-consumer.ts')
})
test('employee inventory carries an optional actual Occupation resource ID without changing contact branches',()=>{
 compile('employee-occupation-consumer.ts')
})
