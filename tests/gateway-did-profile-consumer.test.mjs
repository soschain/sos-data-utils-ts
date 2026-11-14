// Flow contract: route-specific DID selectors and operation lists belong to SOS while standard DID relationships remain owned by Antifraud.
import assert from 'node:assert/strict'
import test from 'node:test'
import ts from 'typescript'
import { fileURLToPath } from 'node:url'
test('public gateway DID profile retains explicit routing metadata without widening unknown extensions',()=>{
 const fixture=fileURLToPath(new URL('./fixtures/gateway-did-profile-consumer.ts',import.meta.url))
 const program=ts.createProgram([fixture],{target:ts.ScriptTarget.ES2023,module:ts.ModuleKind.NodeNext,moduleResolution:ts.ModuleResolutionKind.NodeNext,strict:true,noEmit:true,skipLibCheck:true,types:[]})
 assert.deepEqual(ts.getPreEmitDiagnostics(program).map(item=>ts.flattenDiagnosticMessageText(item.messageText,'\n')),[])
})
