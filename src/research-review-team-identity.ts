import {sha1} from '@noble/hashes/legacy.js'

/** Persisted review-team correlation namespace; changing it would break existing Group identifiers. */
export const ResearchStudyReviewTeamIdentifierNamespace='6434afe2-d152-5ec2-a88b-ec2a96e0f010' as const
export const ResearchStudyReviewTeamIdentifierSystem='urn:ietf:rfc:3986' as const
export type ResearchStudyReviewTeamIdentifier=Readonly<{system:typeof ResearchStudyReviewTeamIdentifierSystem;value:string}>

/** RFC9562 UUIDv5 over the normalized study UUID text; an identifier is not an access grant. */
export function buildResearchStudyReviewTeamIdentifier(researchStudyId:string):ResearchStudyReviewTeamIdentifier{
 const name=String(researchStudyId??'').trim().toLowerCase()
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u.test(name))throw new TypeError('research_study_review_team_study_id_invalid')
 const namespace=Uint8Array.from(ResearchStudyReviewTeamIdentifierNamespace.replaceAll('-','').match(/../gu)!,value=>Number.parseInt(value,16))
 const bytes=new TextEncoder().encode(name),input=new Uint8Array(namespace.length+bytes.length)
 input.set(namespace);input.set(bytes,namespace.length)
 const digest=sha1(input).slice(0,16);digest[6]=(digest[6]&0x0f)|0x50;digest[8]=(digest[8]&0x3f)|0x80
 const hex=Array.from(digest,byte=>byte.toString(16).padStart(2,'0')).join('')
 const value=`urn:uuid:${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`
 return Object.freeze({system:ResearchStudyReviewTeamIdentifierSystem,value})
}
/** Standard Group.identifier token search; resolving membership does not establish Consent or SMART authority. */
export function buildResearchStudyReviewTeamGroupSearch(researchStudyId:string):Readonly<{identifier:string}>{
 const identifier=buildResearchStudyReviewTeamIdentifier(researchStudyId)
 return Object.freeze({identifier:`${identifier.system}|${identifier.value}`})
}
