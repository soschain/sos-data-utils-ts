// Flow contract: controller-owned evidence is pending, strictly bounded and separate from professional/provisional registration; commands carry no ownership authority and receipts expose opaque protected files only.
import assert from 'node:assert/strict'
import test from 'node:test'
import ts from 'typescript'
import {fileURLToPath} from 'node:url'
import {REPOSITORY_SAFE_EXAMPLES as safe} from '../dist/repository-privacy.js'
const load=()=>import('../dist/controller-identity-evidence.js').catch(error=>{if(error.code==='ERR_MODULE_NOT_FOUND')return {};throw error})
const command=()=>({operationId:safe.resourceUuid,verificationMethod:'sripp',subject:{},controller:{}})
const id=index=>safe.resourceUuid.slice(0,-1)+String(index)
const receipt=slots=>({evidenceId:safe.resourceUuid,operationId:safe.resourceUuid,status:'pending',files:slots.map((slot,index)=>({fileId:id(index+1),slot}))})

test('strict commands keep optional private subject/controller identifiers without browser ownership or verification authority',async()=>{
 const {normalizeControllerIdentityEvidenceCommand:normalize}=await load()
 assert.equal(typeof normalize,'function','missing owned controller evidence normalizer')
 assert.deepEqual(normalize(command()),command())
 const supplied={...command(),subject:{identifier:{system:'urn:synthetic:document',value:safe.resourceUuid}},controller:{identifier:{type:'passport',value:safe.resourceUuid,country:safe.countryIso2.toLowerCase()}}}
 const normalized=normalize(supplied)
 assert.equal(normalized.controller.identifier.country,safe.countryIso2)
 supplied.subject.identifier.value='changed-after-normalization'
 assert.equal(normalized.subject.identifier.value,safe.resourceUuid)
 for(const key of ['cardId','ownerId','subjectIdentifier','controllerActorIdentifier','generationId','verified','signature','status'])assert.throws(()=>normalize({...command(),[key]:'forged'}))
})

test('opaque pending receipts permit controller-only or relationship-only proof and all three distinct slots',async()=>{
 const {assertControllerIdentityEvidenceReceipt:check}=await load()
 assert.equal(typeof check,'function','missing owned controller evidence receipt assertion')
 for(const slots of [['controller'],['relationship'],['subject','controller','relationship']])assert.doesNotThrow(()=>check(receipt(slots)))
 for(const bad of [{...receipt(['controller']),status:'verified'},receipt([]),receipt(['subject','subject']),receipt(['subject','controller','relationship','subject']),
  {...receipt(['controller']),files:[{fileId:id(1),slot:'controller',fileName:'private.pdf'}]},
  {...receipt(['controller']),files:[{fileId:id(1),slot:'controller',url:safe.didWeb}]},
  {...receipt(['controller']),subjectIdentifier:safe.didWeb},
  {...receipt(['controller']),operationId:'not-a-uuid'},
  {...receipt(['subject','controller']),files:[{fileId:id(1),slot:'subject'},{fileId:id(1),slot:'controller'}]},
 ])assert.throws(()=>check(bad))
})

test('file policy and normalization reject coercion, partial identifiers and accessors before reading authority',async()=>{
 const {ControllerIdentityEvidencePolicy:policy,normalizeControllerIdentityEvidenceCommand:normalize}=await load()
 assert.ok(policy,'missing owned controller evidence upload policy')
 assert.equal(Object.isFrozen(policy),true);assert.equal(Object.isFrozen(policy.mediaTypes),true);assert.equal(policy.maxFiles,3);assert.equal(policy.maxFileBytes,10*1024*1024)
 assert.deepEqual(policy.mediaTypes,['application/pdf','image/png','image/jpeg'])
 let invoked=0
 for(const value of [{...command(),verificationMethod:{toString(){invoked++;return 'sripp'}}},{...command(),subject:{identifier:{system:'urn:synthetic:document'}}},
  Object.defineProperty({...command()},'controller',{get(){invoked++;return {}}}),
 ])assert.throws(()=>normalize(value))
 const {assertControllerIdentityEvidenceReceipt:check}=await load()
 const accessorFiles=Object.defineProperty([undefined],'0',{get(){invoked++;return {fileId:id(1),slot:'controller'}}})
 assert.throws(()=>check({...receipt(['controller']),files:accessorFiles}))
 assert.equal(invoked,0)
})

test('public typed consumers expose neither verified evidence nor plaintext receipt metadata',()=>{
 const program=ts.createProgram([fileURLToPath(new URL('./fixtures/controller-identity-evidence-consumer.ts',import.meta.url))],{target:ts.ScriptTarget.ES2023,module:ts.ModuleKind.NodeNext,moduleResolution:ts.ModuleResolutionKind.NodeNext,strict:true,exactOptionalPropertyTypes:true,noEmit:true,skipLibCheck:true,types:[]})
 assert.deepEqual(ts.getPreEmitDiagnostics(program).map(item=>ts.flattenDiagnosticMessageText(item.messageText,'\n')),[])
})
