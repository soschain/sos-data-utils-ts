// Flow contract: one explicitly Network provider result preserves the actual canonical identity, separate public alias and Offer while responsibility remains pending. Runtime validation never relabels a Demo URN, fabricates a GW envelope, or supplies controller/evidence/permission authority.
import test from 'node:test'
import assert from 'node:assert/strict'
import {fileURLToPath} from 'node:url'
import ts from 'typescript'
import {encodeMultibaseSha3} from 'antifraud-data-utils-ts/encoding'
import {REPOSITORY_SAFE_EXAMPLES as safe} from '../dist/repository-privacy.js'
import {assertProvisionalSubjectRegistrationReceipt} from '../dist/provisional-subject-registration.js'

const load=()=>import('../dist/individual-registration-contract.js')
const bytes=Uint8Array.from(safe.resourceUuid.replaceAll('-','').match(/../gu),value=>Number.parseInt(value,16))
function result(providerDid=safe.didWeb){return {mode:'network',operationId:safe.resourceUuid,registration:{identity:{organizationId:safe.resourceUuid,canonicalSubjectIdentifier:`${providerDid}:individual:multibase:${encodeMultibaseSha3(bytes,384)}`,publicCardAlias:`${safe.didWeb}:card:synthetic-subject`,providerDid},offerId:'synthetic-offer'},controllerInvitation:{status:'pending'}}}

test('validates the projected Network result without a synthetic GW envelope or mutation',async()=>{
 const {assertNetworkSubjectRegistrationResult}=await load(),value=result(),before=structuredClone(value)
 assert.doesNotThrow(()=>assertNetworkSubjectRegistrationResult(value,{expectedOperationId:safe.resourceUuid,expectedProviderDid:safe.didWeb}))
 assert.deepEqual(value,before)
 value.registration.identity.publicCardAlias=value.registration.identity.canonicalSubjectIdentifier
 assert.doesNotThrow(()=>assertNetworkSubjectRegistrationResult(value))
})

test('retains Demo URN validation separately and rejects rebranding it as a Network receipt',async()=>{
 const {assertNetworkSubjectRegistrationResult}=await load()
 const demo={registrationId:safe.resourceUuid,subjectIdentifier:`urn:uuid:${safe.resourceUuid}`,subjectKind:'human',status:'provisional',controllerInvitation:{invitationId:safe.resourceUuid,status:'pending'},evidence:{status:'pending'}}
 assert.doesNotThrow(()=>assertProvisionalSubjectRegistrationReceipt(demo))
 assert.throws(()=>assertNetworkSubjectRegistrationResult({mode:'network',operationId:safe.resourceUuid,registration:demo,controllerInvitation:{status:'pending'}}))
 const value=result();value.registration.identity.canonicalSubjectIdentifier=`urn:uuid:${safe.resourceUuid}`
 assert.throws(()=>assertNetworkSubjectRegistrationResult(value))
})

test('rejects unbound requests, empty Offer references and fabricated responsibility or authority flags',async()=>{
 const {assertNetworkSubjectRegistrationResult}=await load()
 assert.throws(()=>assertNetworkSubjectRegistrationResult(result(),{expectedOperationId:safe.demoOrganizationUuids.healthCare}))
 assert.throws(()=>assertNetworkSubjectRegistrationResult(result(`${safe.didWeb}:foreign-provider`),{expectedProviderDid:safe.didWeb}))
 const empty=result();empty.registration.offerId=''
 for(const value of [empty,{...result(),mode:'demo'},{...result(),verified:true},{...result(),controllerInvitation:{status:'accepted'}},{...result(),controllerInvitation:{status:'pending',controllerActorDid:safe.didWeb}}])assert.throws(()=>assertNetworkSubjectRegistrationResult(value))
})

test('rejects malformed DID values even when their UUID hash fields are internally consistent',async()=>{
 const {assertNetworkSubjectRegistrationResult}=await load()
 for(const provider of ['did:web:',`${safe.didWeb} invalid`])assert.throws(()=>assertNetworkSubjectRegistrationResult(result(provider)))
 const missingAlias=result();missingAlias.registration.identity.publicCardAlias='did:web:'
 assert.throws(()=>assertNetworkSubjectRegistrationResult(missingAlias))
 for(const field of ['organizationId','canonicalSubjectIdentifier','publicCardAlias','providerDid']){
  const padded=result();padded.registration.identity[field]=` ${padded.registration.identity[field]} `
  assert.throws(()=>assertNetworkSubjectRegistrationResult(padded))
 }
 const compact=result();compact.registration.identity.organizationId=safe.resourceUuid.replaceAll('-','')
 assert.throws(()=>assertNetworkSubjectRegistrationResult(compact))
})

test('rejects missing canonical identities and inherited/coercible fields without reading getters',async()=>{
 const {assertNetworkSubjectRegistrationResult}=await load()
 for(const field of ['organizationId','canonicalSubjectIdentifier','publicCardAlias','providerDid']){const value=result();delete value.registration.identity[field];assert.throws(()=>assertNetworkSubjectRegistrationResult(value))}
 let reads=0
 const accessor=result();Object.defineProperty(accessor,'mode',{get(){reads++;return 'network'}})
 assert.throws(()=>assertNetworkSubjectRegistrationResult(accessor));assert.equal(reads,0)
 const coercible=result();coercible.mode={toString(){reads++;return 'network'}}
 assert.throws(()=>assertNetworkSubjectRegistrationResult(coercible));assert.equal(reads,0)
 assert.throws(()=>assertNetworkSubjectRegistrationResult(Object.assign(Object.create({verified:true}),result())))
})

test('publishes one canonical assertion through root and subpath',async()=>{
 const root=await import('../dist/index.js'),scoped=await import('sos-data-utils-ts/individual-registration-contract')
 assert.equal(typeof scoped.assertNetworkSubjectRegistrationResult,'function')
 assert.equal(root.assertNetworkSubjectRegistrationResult,scoped.assertNetworkSubjectRegistrationResult)
 const {NETWORK_SUBJECT_REGISTRATION_EXAMPLE}=await import('sos-data-utils-ts/individual-registration-examples')
 assert.doesNotThrow(()=>scoped.assertNetworkSubjectRegistrationResult(NETWORK_SUBJECT_REGISTRATION_EXAMPLE))
 assert.equal(Object.isFrozen(NETWORK_SUBJECT_REGISTRATION_EXAMPLE.registration.identity),true)
 assert.equal(Object.isFrozen(NETWORK_SUBJECT_REGISTRATION_EXAMPLE.controllerInvitation),true)
})

test('public consumer narrows Network data without exposing accepted-controller or actor fields',()=>{
 const fixture=fileURLToPath(new URL('./fixtures/network-subject-registration-consumer.ts',import.meta.url))
 const program=ts.createProgram([fixture],{target:ts.ScriptTarget.ES2023,module:ts.ModuleKind.NodeNext,moduleResolution:ts.ModuleResolutionKind.NodeNext,strict:true,noEmit:true,skipLibCheck:true,types:[]})
 assert.deepEqual(ts.getPreEmitDiagnostics(program).map(item=>ts.flattenDiagnosticMessageText(item.messageText,'\n')),[])
})
