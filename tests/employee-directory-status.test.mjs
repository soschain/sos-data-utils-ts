// Flow contract: workforce directory states and controller action catalogs preserve their complete wire values and public type unions; providers enforce authorization and state transitions.
import test from 'node:test'
import assert from 'node:assert/strict'
import {spawnSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'
test('employee directory catalog preserves the complete operational wire states',async()=>{
 const module=await import('../dist/employee-routing.js')
 assert.deepEqual(module.EmployeeDirectoryStatuses,{Active:'active',Inactive:'inactive',Purged:'purged',Unknown:'unknown'})
 assert.equal(Object.isFrozen(module.EmployeeDirectoryStatuses),true)
})
test('root and leaf typed consumers retain the full directory status union',()=>{
 const result=spawnSync(process.execPath,[fileURLToPath(new URL('../node_modules/typescript/bin/tsc',import.meta.url)),'--noEmit','--strict','--exactOptionalPropertyTypes','--skipLibCheck','--module','NodeNext','--moduleResolution','NodeNext','--target','ES2022',fileURLToPath(new URL('./fixtures/employee-directory-status.ts',import.meta.url))],{encoding:'utf8'})
 assert.equal(result.status,0,result.stdout+result.stderr)
})

// Exact controller action values are the existing employee lifecycle wire contract.
test('employee lifecycle mutation and query catalogs preserve their full wire values',async()=>{
 const module=await import('../dist/employee-routing.js')
 assert.deepEqual(module.EmployeeLifecycleActions,{Disable:'disable',Purge:'purge',RevokeDevice:'revoke_device'})
 assert.deepEqual(module.EmployeeLifecycleQueryActions,{List:'list'})
 assert.equal(Object.isFrozen(module.EmployeeLifecycleActions),true)
 assert.equal(Object.isFrozen(module.EmployeeLifecycleQueryActions),true)
})
test('public root and leaf action consumers reject unsupported lifecycle actions',()=>{
 const result=spawnSync(process.execPath,[fileURLToPath(new URL('../node_modules/typescript/bin/tsc',import.meta.url)),'--noEmit','--strict','--exactOptionalPropertyTypes','--skipLibCheck','--module','NodeNext','--moduleResolution','NodeNext','--target','ES2022',fileURLToPath(new URL('./fixtures/employee-lifecycle-actions.ts',import.meta.url))],{encoding:'utf8'})
 assert.equal(result.status,0,result.stdout+result.stderr)
})
