// Flow contract: a GW individual registration receipt binds its actual Organization UUID and provider to a canonical private subject DID, preserves the separate public card alias, and rejects missing, ambiguous or foreign identity/Offer data. Projection does not grant employee authority, recipient acceptance or DCR access.
import test from 'node:test'
import assert from 'node:assert/strict'
import {encodeMultibaseSha3} from 'antifraud-data-utils-ts/encoding'
import {REPOSITORY_SAFE_EXAMPLES as safe} from '../dist/repository-privacy.js'

const load=()=>import('../dist/individual-registration-contract.js')
const providerDid=safe.didWeb
const organizationId=safe.resourceUuid
const uuidBytes=Uint8Array.from(organizationId.replaceAll('-','').match(/../gu),pair=>Number.parseInt(pair,16))
const canonicalSubjectIdentifier=`${providerDid}:individual:multibase:${encodeMultibaseSha3(uuidBytes,384)}`
const publicCardAlias=`${safe.didWeb}:card:synthetic-dependent`
const binding={requestedOrganizationId:organizationId,expectedProviderDid:providerDid}
function row(){return {type:'Family-registration-offer-v1.0',resource:{resourceType:'Organization',id:organizationId,meta:{claims:{
 'org.schema.Organization.did':canonicalSubjectIdentifier,
 'org.schema.Organization.sameAs':publicCardAlias,
 'org.schema.Offer.identifier':'synthetic-offer',
 'org.schema.Offer.offeredBy':providerDid,
}}},response:{status:'201'}}}
const response=rows=>({body:{resourceType:'Bundle',type:'collection',data:rows}})

test('projects actual canonical Organization DID and public alias as separate server-confirmed identities',async()=>{
 const {readIndividualOrganizationBootstrapReceipt}=await load()
 assert.notEqual(publicCardAlias,canonicalSubjectIdentifier)
 assert.deepEqual(readIndividualOrganizationBootstrapReceipt(response([row()]),binding),{
  identity:{organizationId,canonicalSubjectIdentifier,publicCardAlias,providerDid},offerId:'synthetic-offer',
 })
})

test('rejects another actual Organization row UUID or provider despite the requested identity appearing in claims',async()=>{
 const {readIndividualOrganizationBootstrapReceipt}=await load()
 const wrongId=row();wrongId.resource.id=safe.demoOrganizationUuids.healthCare
 wrongId.resource.meta.claims['org.schema.Organization.identifier.value']=organizationId
 const wrongProvider=row();wrongProvider.resource.meta.claims['org.schema.Offer.offeredBy']=`${providerDid}:foreign-provider`
 for(const item of [wrongId,wrongProvider])assert.throws(()=>readIndividualOrganizationBootstrapReceipt(response([item]),binding),/binding/)
})

test('rejects missing or mismatched canonical DID without substituting the public alias',async()=>{
 const {readIndividualOrganizationBootstrapReceipt}=await load()
 for(const value of [undefined,publicCardAlias,`${providerDid}:individual:foreign-subject`]){
  const item=row()
  if(value===undefined)delete item.resource.meta.claims['org.schema.Organization.did']
  else item.resource.meta.claims['org.schema.Organization.did']=value
  assert.throws(()=>readIndividualOrganizationBootstrapReceipt(response([item]),binding),/binding|canonical/)
 }
})

test('rejects missing identities, an unrelated-row Offer, failed entries and ambiguous registration rows',async()=>{
 const {readIndividualOrganizationBootstrapReceipt}=await load()
 const missingId=row();delete missingId.resource.id
 const missingOffer=row();delete missingOffer.resource.meta.claims['org.schema.Offer.identifier']
 const unrelated={type:'Offer-search-response-v1.0',resource:{meta:{claims:{'org.schema.Offer.identifier':'synthetic-offer'}}},response:{status:'200'}}
 const failed=row();failed.response.status='403'
 for(const rows of [[missingId],[missingOffer,unrelated],[failed],[row(),row()],[]]){
  assert.throws(()=>readIndividualOrganizationBootstrapReceipt(response(rows),binding),/binding|receipt|offer/)
 }
})

test('retains contextualized claims and replay status without inventing an actor or completed controller state',async()=>{
 const {readIndividualOrganizationBootstrapReceipt}=await load()
 const item=row();item.response.status='200'
 item.resource.meta.claims=Object.fromEntries([['@context','org.schema'],...Object.entries(item.resource.meta.claims).map(([key,value])=>[key.replace(/^org\.schema\./u,''),value])])
 const result=readIndividualOrganizationBootstrapReceipt({resourceType:'Bundle',type:'collection',data:[item]},binding)
 assert.equal(result.identity.canonicalSubjectIdentifier,canonicalSubjectIdentifier)
 for(const field of ['controllerActorDid','controllerAccepted','verified','active'])assert.equal(Object.hasOwn(result.identity,field),false)
})

test('does not project a pending per-entry status as a completed bootstrap identity',async()=>{
 const {readIndividualOrganizationBootstrapReceipt}=await load()
 const pending=row();pending.response.status='202'
 assert.throws(()=>readIndividualOrganizationBootstrapReceipt(response([pending]),binding),/binding|receipt/)
})

test('retains the existing GW reader normalization while the Network projection assertion stays strict',async()=>{
 const {readIndividualOrganizationBootstrapReceipt}=await load()
 const item=row();item.resource.id=organizationId.replaceAll('-','')
 for(const key of ['org.schema.Organization.did','org.schema.Organization.sameAs','org.schema.Offer.offeredBy'])item.resource.meta.claims[key]=` ${item.resource.meta.claims[key]} `
 assert.deepEqual(readIndividualOrganizationBootstrapReceipt(response([item]),binding),{identity:{organizationId,canonicalSubjectIdentifier,publicCardAlias,providerDid},offerId:'synthetic-offer'})
})
