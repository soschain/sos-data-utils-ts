// Flow contract: provider-confirmed directory rows reuse the same pure Organization identity projection as registration receipts, without constructing an Offer or granting authorization. Preserve existing UUID normalization and independent public alias; reject foreign canonical identity and alias substitution.
import assert from 'node:assert/strict'
import test from 'node:test'
import {encodeMultibaseSha3} from 'antifraud-data-utils-ts/encoding'
import {REPOSITORY_SAFE_EXAMPLES as safe} from '../dist/repository-privacy.js'
const load=()=>import('../dist/individual-registration-contract.js')
const bytes=Uint8Array.from(safe.resourceUuid.replaceAll('-','').match(/../gu),pair=>Number.parseInt(pair,16))
const input={organizationId:safe.resourceUuid,providerDid:safe.didWeb,canonicalSubjectIdentifier:`${safe.didWeb}:individual:multibase:${encodeMultibaseSha3(bytes,384)}`,publicCardAlias:`${safe.didWeb}:card:synthetic-dependent`}

test('public pure reader preserves the existing UUID/provider/canonical subject projection independently of Offer data',async()=>{
 const {readIndividualOrganizationIdentity}=await load()
 assert.equal(typeof readIndividualOrganizationIdentity,'function')
 assert.deepEqual(readIndividualOrganizationIdentity({...input,organizationId:`urn:uuid:${safe.resourceUuid}`}),input)
})

test('pure identity reader rejects canonical identity from another row or provider and never accepts alias substitution',async()=>{
 const {readIndividualOrganizationIdentity}=await load()
 assert.equal(typeof readIndividualOrganizationIdentity,'function')
 for(const change of [{organizationId:safe.demoOrganizationUuids.healthCare},{providerDid:`${safe.didWeb}:foreign`},{canonicalSubjectIdentifier:input.publicCardAlias},{canonicalSubjectIdentifier:undefined}])assert.throws(()=>readIndividualOrganizationIdentity({...input,...change}),/binding|canonical/)
})
