// Flow contract: a storage consumer compiles solely against SOS-owned public records and rejects incomplete decrypted content and blob references.
import assert from 'node:assert/strict'
import test from 'node:test'
import ts from 'typescript'
import { fileURLToPath } from 'node:url'
test('public storage records preserve the typed confidential and decrypted boundaries',()=>{
 const fixture=fileURLToPath(new URL('./fixtures/confidential-storage-consumer.ts',import.meta.url))
 const program=ts.createProgram([fixture],{target:ts.ScriptTarget.ES2023,module:ts.ModuleKind.NodeNext,moduleResolution:ts.ModuleResolutionKind.NodeNext,strict:true,noEmit:true,skipLibCheck:true,types:[]})
 assert.deepEqual(ts.getPreEmitDiagnostics(program).map(item=>ts.flattenDiagnosticMessageText(item.messageText,'\n')),[])
})
