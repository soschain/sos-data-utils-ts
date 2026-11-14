// Flow contract: subject registration prepares a provisional subject and a proposed responsible-party invitation, with strict human/animal data and no client-owned controller, authorization or verification state.
import test from 'node:test'
import assert from 'node:assert/strict'
import {REPOSITORY_SAFE_EXAMPLES as safe} from '../dist/repository-privacy.js'
import ts from 'typescript'
import {fileURLToPath} from 'node:url'

const animal=()=>({operationId:safe.resourceUuid,subject:{kind:'animal',alternateName:'Provisional subject',ncbiTaxonomyId:'9615',gender:'unknown'},controller:{legalName:'Proposed responsible party',contact:{kind:'email',value:safe.firstContactEmail},relationship:'RESPRSN'}})
const load=()=>import('../dist/provisional-subject-registration.js')

test('normalizes a proposed controller contact without assigning ownership',async()=>{
  const {normalizeSubjectRegistrationCommand}=await load()
  const command=normalizeSubjectRegistrationCommand(animal())
  assert.equal(command.controller.relationship,'RESPRSN')
  assert.equal(command.controller.contact.value,safe.firstContactEmail)
  assert.equal(Object.hasOwn(command.controller,'verified'),false)
  assert.equal(Object.hasOwn(command.controller,'uid'),false)
})
test('separates human demographics from mandatory animal taxonomy',async()=>{
  const {normalizeSubjectRegistrationCommand}=await load()
  const human={...animal(),subject:{kind:'human',alternateName:'Dependent subject',birthDate:'2015-01-01'}}
  assert.equal(normalizeSubjectRegistrationCommand(human).subject.kind,'human')
  assert.throws(()=>normalizeSubjectRegistrationCommand({...human,subject:{...human.subject,ncbiTaxonomyId:'9615'}}))
  assert.throws(()=>normalizeSubjectRegistrationCommand({...animal(),subject:{kind:'animal',alternateName:'Subject'}}))
})
test('rejects impossible dates, unbounded fields and unknown subject kinds',async()=>{
  const {normalizeSubjectRegistrationCommand}=await load()
  for(const subject of [{kind:'human',alternateName:'Subject',birthDate:'2025-02-30'},{kind:'human',alternateName:'x'.repeat(161)},{kind:'other',alternateName:'Subject'},{kind:'animal',alternateName:'Subject',ncbiTaxonomyId:'bad'}]){
    assert.throws(()=>normalizeSubjectRegistrationCommand({...animal(),subject}))
  }
})
test('rejects an alternate name exceeding the existing card provider 80-character limit',async()=>{
 const {normalizeSubjectRegistrationCommand}=await load()
 assert.equal(normalizeSubjectRegistrationCommand({...animal(),subject:{...animal().subject,alternateName:'x'.repeat(80)}}).subject.alternateName.length,80)
 assert.throws(()=>normalizeSubjectRegistrationCommand({...animal(),subject:{...animal().subject,alternateName:'x'.repeat(81)}}))
})
test('rejects caller authority at every nested command boundary',async()=>{
  const {normalizeSubjectRegistrationCommand}=await load()
  for(const field of ['uid','organizationReference','actorIdentifier','workspaceOwnerUid','personalPin','status'])assert.throws(()=>normalizeSubjectRegistrationCommand({...animal(),[field]:'forged'}))
  assert.throws(()=>normalizeSubjectRegistrationCommand({...animal(),controller:{...animal().controller,verified:true}}))
  assert.throws(()=>normalizeSubjectRegistrationCommand({...animal(),subject:{...animal().subject,cardNumber:'forged'}}))
})
test('accepts only provisional pending invitation and pending evidence creation receipts',async()=>{
  const {assertProvisionalSubjectRegistrationReceipt}=await load()
  const receipt={registrationId:safe.resourceUuid,subjectIdentifier:`urn:uuid:${safe.resourceUuid}`,subjectKind:'animal',status:'provisional',controllerInvitation:{invitationId:safe.resourceUuid,status:'pending'},evidence:{status:'pending'}}
  assert.doesNotThrow(()=>assertProvisionalSubjectRegistrationReceipt(receipt))
  assert.throws(()=>assertProvisionalSubjectRegistrationReceipt({...receipt,status:'active'}))
  assert.throws(()=>assertProvisionalSubjectRegistrationReceipt({...receipt,evidence:{status:'verified'}}))
  assert.throws(()=>assertProvisionalSubjectRegistrationReceipt({...receipt,controllerInvitation:{...receipt.controllerInvitation,status:'active'}}))
})
test('public consumer preserves human/animal and provisional-state discriminators',()=>{
 const fixture=fileURLToPath(new URL('./fixtures/provisional-subject-registration-consumer.ts',import.meta.url))
 const program=ts.createProgram([fixture],{target:ts.ScriptTarget.ES2023,module:ts.ModuleKind.NodeNext,moduleResolution:ts.ModuleResolutionKind.NodeNext,strict:true,noEmit:true,skipLibCheck:true,types:[]})
 assert.deepEqual(ts.getPreEmitDiagnostics(program).map(item=>ts.flattenDiagnosticMessageText(item.messageText,'\n')),[])
})
test('reads only own data descriptors without inherited getters or proxy property reads',async()=>{
 const {normalizeSubjectRegistrationCommand}=await load()
 let reads=0
 const inherited=Object.create({get operationId(){reads++;return safe.resourceUuid}})
 Object.assign(inherited,{subject:animal().subject,controller:animal().controller})
 assert.throws(()=>normalizeSubjectRegistrationCommand(inherited))
 assert.equal(reads,0)
 const proxy=new Proxy(animal(),{get(){reads++;throw new Error('unexpected_property_read')}})
 assert.doesNotThrow(()=>normalizeSubjectRegistrationCommand(proxy))
 assert.equal(reads,0)
})
test('rejects coercible gender and receipt kind objects without running coercion',async()=>{
 const {normalizeSubjectRegistrationCommand,assertProvisionalSubjectRegistrationReceipt}=await load()
 let coercions=0
 const gender={toString(){coercions++;return 'female'}}
 assert.throws(()=>normalizeSubjectRegistrationCommand({...animal(),subject:{...animal().subject,gender}}))
 const receipt={registrationId:safe.resourceUuid,subjectIdentifier:`urn:uuid:${safe.resourceUuid}`,subjectKind:{toString(){coercions++;return 'animal'}},status:'provisional',controllerInvitation:{invitationId:safe.resourceUuid,status:'pending'},evidence:{status:'pending'}}
 assert.throws(()=>assertProvisionalSubjectRegistrationReceipt(receipt))
 assert.equal(coercions,0)
})
