// Flow contract: retain the existing persisted registered-profile/session field spellings and protected-envelope type, make routed account/profile binding explicit, and permit legacy records without revision or optional public-storage metadata without claiming that absence authorizes runtime migration.
import assert from 'node:assert/strict'
import test from 'node:test'
import ts from 'typescript'
import {fileURLToPath} from 'node:url'
test('registered profile and session consumer types preserve stored fields and reject cross-layer secret substitutions',()=>{
 const fixture=fileURLToPath(new URL('./fixtures/registered-profile-consumer.ts',import.meta.url))
 const program=ts.createProgram([fixture],{target:ts.ScriptTarget.ES2023,module:ts.ModuleKind.NodeNext,moduleResolution:ts.ModuleResolutionKind.NodeNext,strict:true,noEmit:true,skipLibCheck:true,types:[]})
 assert.deepEqual(ts.getPreEmitDiagnostics(program).map(item=>ts.flattenDiagnosticMessageText(item.messageText,'\n')),[])
})
