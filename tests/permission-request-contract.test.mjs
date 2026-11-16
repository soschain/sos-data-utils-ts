// Flow contract: permission-request DTOs expose a stable draft Consent entry type and require explicit subject, actor, correlation and resource identifiers through both public type surfaces.
import assert from 'node:assert/strict'
import {spawnSync} from 'node:child_process'
import test from 'node:test'
import * as data from '../dist/index.js'

test('the request entry type retains the existing persisted wire value',()=>{
 assert.equal(data.PermissionRequestConsentEntryType,'Consent-create-request-v1.0')
})

test('root and leaf permission-request types enforce an explicit correlated draft proposal',()=>{
 const result=spawnSync(process.execPath,['node_modules/typescript/bin/tsc','--noEmit','--strict','--target','ES2022','--module','NodeNext','--moduleResolution','NodeNext','tests/fixtures/permission-request-contract.consumer.ts'],{encoding:'utf8'})
 assert.equal(result.status,0,result.stdout+result.stderr)
})
