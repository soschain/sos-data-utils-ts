// Flow contract: the existing UUIDv5 namespace yields the same ResearchStudy review-team identifier and Group.identifier search; correlation alone never grants research access.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import test from 'node:test'
import * as data from '../dist/index.js'
import {REPOSITORY_SAFE_EXAMPLES as SAFE} from '../dist/repository-privacy.js'

const namespace='6434afe2-d152-5ec2-a88b-ec2a96e0f010'
function independentUuidV5(name){
 const digest=createHash('sha1').update(Buffer.from(namespace.replaceAll('-',''),'hex')).update(name).digest().subarray(0,16)
 digest[6]=(digest[6]&0x0f)|0x50;digest[8]=(digest[8]&0x3f)|0x80
 const hex=digest.toString('hex');return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`
}

test('preserves the governed UUID namespace and RFC9562 v5 study-name bytes',()=>{
 assert.equal(typeof data.buildResearchStudyReviewTeamIdentifier,'function')
 assert.equal(data.ResearchStudyReviewTeamIdentifierNamespace,namespace)
 const identifier=data.buildResearchStudyReviewTeamIdentifier(SAFE.resourceUuid)
 assert.deepEqual(identifier,{system:'urn:ietf:rfc:3986',value:`urn:uuid:${independentUuidV5(SAFE.resourceUuid)}`})
 assert.deepEqual(data.buildResearchStudyReviewTeamGroupSearch(SAFE.resourceUuid),{identifier:`${identifier.system}|${identifier.value}`})
 assert.deepEqual(data.buildResearchStudyReviewTeamIdentifier(` ${SAFE.resourceUuid.toUpperCase()} `),identifier)
})

test('rejects non-UUID study references instead of generating a different namespace or linkage',()=>{
 for(const value of ['',SAFE.didWeb,`ResearchStudy/${SAFE.resourceUuid}`,SAFE.resourceUuid.replaceAll('-',''),null])assert.throws(()=>data.buildResearchStudyReviewTeamIdentifier(value))
})
