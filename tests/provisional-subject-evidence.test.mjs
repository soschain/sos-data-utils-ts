// Flow contract: pending document evidence retains separate subject and proposed-controller identifiers, explicit review method and bounded file metadata; neither a file nor a submitted method becomes trusted verification or signed identity.
import test from 'node:test'
import assert from 'node:assert/strict'
import {SyntheticConfidentialDocumentFixture as fixture} from 'antifraud-data-utils-ts/identity-assurance'
import {REPOSITORY_SAFE_EXAMPLES as safe} from '../dist/repository-privacy.js'
import ts from 'typescript'
import {fileURLToPath} from 'node:url'
const load=()=>import('../dist/provisional-subject-evidence.js')
const command=()=>({operationId:safe.resourceUuid,registrationId:safe.resourceUuid,verificationMethod:'sripp',subject:{identifier:{system:'urn:synthetic:subject-identifier',value:'subject-document-number'}},controller:{identifier:{type:'passport',value:'controller-document-number',country:'CA'}}})
const receipt=()=>({evidenceId:safe.resourceUuid,registrationId:safe.resourceUuid,status:'pending',documents:[{slot:'subject',contentId:fixture.attachment.contentId,mediaType:'image/png',fileName:'subject.png',size:100}]})
test('retains separate scanned identifiers and an explicitly chosen existing review method',async()=>{
 const {normalizePendingSubjectEvidenceCommand}=await load()
 const result=normalizePendingSubjectEvidenceCommand(command())
 assert.equal(result.subject.identifier.value,'subject-document-number')
 assert.equal(result.controller.identifier.value,'controller-document-number')
 assert.equal(result.verificationMethod,'sripp')
})
test('allows absent issued identifiers with a pending subject document but rejects partial identifier objects',async()=>{
 const {normalizePendingSubjectEvidenceCommand,assertPendingSubjectEvidenceReceipt}=await load()
 const normalized=normalizePendingSubjectEvidenceCommand({...command(),subject:{},controller:{}})
 assert.deepEqual(normalized.subject,{})
 assert.deepEqual(normalized.controller,{})
 assert.doesNotThrow(()=>assertPendingSubjectEvidenceReceipt(receipt()))
 assert.throws(()=>normalizePendingSubjectEvidenceCommand({...command(),subject:{identifier:{system:'urn:synthetic:identifier'}}}))
 assert.throws(()=>normalizePendingSubjectEvidenceCommand({...command(),controller:{identifier:{country:'CA'}}}))
})
test('rejects omitted/coercible methods and caller-selected verification, subject binding or controller authority',async()=>{
 const {normalizePendingSubjectEvidenceCommand}=await load()
 let coercions=0
 for(const value of [undefined,'automatic',{toString(){coercions++;return 'pipp'}}])assert.throws(()=>normalizePendingSubjectEvidenceCommand({...command(),verificationMethod:value}))
 for(const field of ['subjectReference','controllerActorIdentifier','verified','signature','organizationReference'])assert.throws(()=>normalizePendingSubjectEvidenceCommand({...command(),[field]:'forged'}))
 assert.equal(coercions,0)
})
test('accepts only pending bounded distinct document slots and valid canonical evidence CIDs',async()=>{
 const {assertPendingSubjectEvidenceReceipt}=await load()
 assert.doesNotThrow(()=>assertPendingSubjectEvidenceReceipt(receipt()))
 for(const changed of [{...receipt(),status:'verified'},{...receipt(),documents:[{...receipt().documents[0],contentId:'invalid-cid'}]},{...receipt(),documents:[...receipt().documents,...receipt().documents]},{...receipt(),documents:[{...receipt().documents[0],size:10*1024*1024+1}]}])assert.throws(()=>assertPendingSubjectEvidenceReceipt(changed))
})
test('public consumer keeps optional issued identifiers and pending-only evidence typed',()=>{
 const fixture=fileURLToPath(new URL('./fixtures/provisional-subject-evidence-consumer.ts',import.meta.url))
 const program=ts.createProgram([fixture],{target:ts.ScriptTarget.ES2023,module:ts.ModuleKind.NodeNext,moduleResolution:ts.ModuleResolutionKind.NodeNext,strict:true,noEmit:true,skipLibCheck:true,types:[]})
 assert.deepEqual(ts.getPreEmitDiagnostics(program).map(item=>ts.flattenDiagnosticMessageText(item.messageText,'\n')),[])
})
