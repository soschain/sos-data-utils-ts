// Flow contract: publish the existing persisted PIN-plus-host envelope without executable cryptography, profile authority or a replacement format; a public consumer retains fixed algorithm and key-length discriminators.
import assert from 'node:assert/strict'
import test from 'node:test'
import ts from 'typescript'
import {fileURLToPath} from 'node:url'
test('publishes the exact persisted discriminator through root and public subpath',async()=>{
 const scoped=await import('sos-data-utils-ts/server-profile-secret-contract'),root=await import('../dist/index.js')
 assert.equal(scoped.PROFILE_SECRET_ENVELOPE_VERSION,'gdc-pin-host-envelope-v1')
 assert.equal(root.PROFILE_SECRET_ENVELOPE_VERSION,scoped.PROFILE_SECRET_ENVELOPE_VERSION)
})
test('public types retain fixed scrypt, key-length and envelope discriminators without executable crypto',()=>{
 const fixture=fileURLToPath(new URL('./fixtures/server-profile-secret-consumer.ts',import.meta.url))
 const program=ts.createProgram([fixture],{target:ts.ScriptTarget.ES2023,module:ts.ModuleKind.NodeNext,moduleResolution:ts.ModuleResolutionKind.NodeNext,strict:true,noEmit:true,skipLibCheck:true,types:[]})
 assert.deepEqual(ts.getPreEmitDiagnostics(program).map(item=>ts.flattenDiagnosticMessageText(item.messageText,'\n')),[])
})
