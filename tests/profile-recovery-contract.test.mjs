// Flow contract: existing email recovery records retain their exact fields while phone recovery has a separate contact/version branch. Public types describe stored evidence and never authorize recovery.
import assert from 'node:assert/strict';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';

function diagnostics(fixture){
 const program=ts.createProgram([fileURLToPath(new URL('./fixtures/'+fixture,import.meta.url))],{target:ts.ScriptTarget.ES2023,module:ts.ModuleKind.NodeNext,moduleResolution:ts.ModuleResolutionKind.NodeNext,strict:true,exactOptionalPropertyTypes:true,noEmit:true,skipLibCheck:true,types:[]});
 return ts.getPreEmitDiagnostics(program).map(value=>ts.flattenDiagnosticMessageText(value.messageText,'\n'));
}
test('public recovery types preserve the legacy email record and notification wire',()=>{
 assert.deepEqual(diagnostics('profile-recovery-email-consumer.ts'),[]);
});
test('phone recovery records and notifications remain distinct from email and reject mixed contacts',()=>{
 assert.deepEqual(diagnostics('profile-recovery-phone-consumer.ts'),[]);
});
