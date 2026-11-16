// Flow contract: the individual registration response preserves its operational Customer discriminator without claiming a canonical Schema.org class.
import test from 'node:test'
import assert from 'node:assert/strict'
import ts from 'typescript'
import {fileURLToPath} from 'node:url'
import {GatewayResponseEntryTypes} from '../dist/gateway-response-contract.js'

test('individual customer responses retain the exact operational wire tag',()=>{
 assert.equal(GatewayResponseEntryTypes.IndividualCustomer,'Customer')
 assert.equal(Object.isFrozen(GatewayResponseEntryTypes),true)
})

test('public consumers retain the literal Customer response discriminator',()=>{
 const fixture=fileURLToPath(new URL('./fixtures/individual-customer-response-consumer.ts',import.meta.url))
 const program=ts.createProgram([fixture],{target:ts.ScriptTarget.ES2023,module:ts.ModuleKind.NodeNext,moduleResolution:ts.ModuleResolutionKind.NodeNext,strict:true,noEmit:true,skipLibCheck:true,types:[]})
 assert.deepEqual(ts.getPreEmitDiagnostics(program).map(item=>ts.flattenDiagnosticMessageText(item.messageText,'\n')),[])
})
