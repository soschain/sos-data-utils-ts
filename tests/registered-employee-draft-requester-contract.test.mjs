// Flow contract: completed employee enrollment tuples and the public draft-requester projection retain existing record fields without exposing a wallet/PIN session or treating invitation expiry as ongoing employment authority.
import assert from 'node:assert/strict'
import test from 'node:test'
import {spawnSync} from 'node:child_process'
import {resolve} from 'node:path'
import {EmployeeActivationGrantVersions} from '../dist/employee-routing.js'

test('provides the owned DTO leaf without a runtime enrollment or grant constructor',async()=>{
 const leaf=await import('../dist/registered-employee-draft-requester-contract.js')
 assert.deepEqual(Object.keys(leaf),[])
})
test('root and leaf types preserve the consumed tuple and reject secret or browser-role fields',()=>{
 const result=spawnSync(process.execPath,[resolve('node_modules/typescript/bin/tsc'),'--noEmit','--strict','--module','NodeNext','--moduleResolution','NodeNext','--target','ES2022','tests/fixtures/registered-employee-draft-requester-consumer.ts'],{encoding:'utf8'})
 assert.equal(result.status,0,result.stdout+result.stderr)
})
test('retains the existing invitation/grant wire version independently of consumption',()=>{
 assert.equal(EmployeeActivationGrantVersions.V1,'employee-activation-grant-v1')
})
