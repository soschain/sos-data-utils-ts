// Flow contract: public editor types retain required coding-system identity and constrain scope codes without conferring authority.
import assert from 'node:assert/strict'
import test from 'node:test'
import ts from 'typescript'
import {fileURLToPath} from 'node:url'
test('public Consent editor models compile through the owning SOS Data subpath',()=>{
  const fixture=fileURLToPath(new URL('./fixtures/consent-access-editor-consumer.ts',import.meta.url))
  const program=ts.createProgram([fixture],{target:ts.ScriptTarget.ES2023,module:ts.ModuleKind.NodeNext,moduleResolution:ts.ModuleResolutionKind.NodeNext,strict:true,noEmit:true,skipLibCheck:true,types:[]})
  assert.deepEqual(ts.getPreEmitDiagnostics(program).map(item=>ts.flattenDiagnosticMessageText(item.messageText,'\n')),[])
})
