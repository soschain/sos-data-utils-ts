// Flow contract: the owned employee directory exposes all four existing operational states unchanged and keeps its public DTO status union compatible; catalog values do not grant employment or transition authority.
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
