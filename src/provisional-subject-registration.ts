import {HL7_RELATED_PERSON_FUNCTIONAL_ROLES} from 'fhir-data-utils-ts'
import {normalizeProfileIndexContact,ProfileIndexContactKind} from './confidential-profile-index.js'
import {HUMAN_SPECIES_ID7,normalizeSubjectSpeciesId7} from './subject-card-index.js'

/** Proposed HL7 responsible-party role, never proof of a legal relationship. */
export const ProposedSubjectControllerRelationship='RESPRSN' as const
if(!HL7_RELATED_PERSON_FUNCTIONAL_ROLES.some(role=>role.code===ProposedSubjectControllerRelationship))throw new Error('Responsible-party relationship catalog is unavailable')
type Demographics=Readonly<{alternateName:string;birthDate?:string;birthYear?:number;gender?:'female'|'male'|'other'|'unknown'}>
export type SubjectRegistrationCommand=Readonly<{
 operationId:string
 subject:(Demographics&Readonly<{kind:'animal';ncbiTaxonomyId:string}>)|(Demographics&Readonly<{kind:'human';ncbiTaxonomyId?:never}>)
 controller:Readonly<{legalName:string;contact:Readonly<{kind:'email'|'telephone';value:string}>;relationship:typeof ProposedSubjectControllerRelationship}>
}>
export type ProvisionalSubjectRegistrationReceipt=Readonly<{
 registrationId:string;subjectIdentifier:string;subjectKind:'human'|'animal';status:'provisional'
 controllerInvitation:Readonly<{invitationId:string;status:'pending'}>
 evidence:Readonly<{status:'pending'}>
}>
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu
function record(value:unknown,allowed:readonly string[]):Record<string,unknown>{
 if(!value||typeof value!=='object'||Array.isArray(value))throw new TypeError('subject_registration_input_invalid')
 const descriptors=Object.getOwnPropertyDescriptors(value)
 if(Reflect.ownKeys(descriptors).some(key=>typeof key!=='string'||!allowed.includes(key)||!('value' in descriptors[key]!)))throw new TypeError('subject_registration_field_forbidden')
 const snapshot:Record<string,unknown>=Object.create(null)
 for(const key of Object.keys(descriptors))snapshot[key]=descriptors[key]!.value
 return snapshot
}
function text(value:unknown,max:number):string{
 if(typeof value!=='string'||!value.trim()||value.trim().length>max)throw new TypeError('subject_registration_text_invalid')
 return value.trim()
}
function uuid(value:unknown):string{if(typeof value!=='string'||!UUID.test(value))throw new TypeError('subject_registration_identifier_invalid');return value.toLowerCase()}
export function normalizeSubjectRegistrationCommand(input:unknown):SubjectRegistrationCommand{
 const command=record(input,['operationId','subject','controller'])
 const operationId=uuid(command.operationId)
 const subject=record(command.subject,['kind','alternateName','birthDate','birthYear','gender','ncbiTaxonomyId'])
 const controller=record(command.controller,['legalName','contact','relationship'])
 const contact=record(controller.contact,['kind','value'])
 if(subject.kind!=='human'&&subject.kind!=='animal')throw new TypeError('subject_registration_kind_invalid')
 const alternateName=text(subject.alternateName,80)
 const now=new Date(),today=now.toISOString().slice(0,10)
 const birthDate=subject.birthDate===undefined?undefined:text(subject.birthDate,10)
 if(birthDate&&(!/^\d{4}-\d{2}-\d{2}$/u.test(birthDate)||!Number.isFinite(Date.parse(birthDate))||new Date(birthDate).toISOString().slice(0,10)!==birthDate||birthDate<'1900-01-01'||birthDate>today))throw new TypeError('subject_registration_birth_invalid')
 const birthYear=subject.birthYear
 if(birthYear!==undefined&&(!Number.isSafeInteger(birthYear)||Number(birthYear)<1900||Number(birthYear)>now.getUTCFullYear()||birthDate))throw new TypeError('subject_registration_birth_invalid')
 if(subject.gender!==undefined&&(typeof subject.gender!=='string'||!['female','male','other','unknown'].includes(subject.gender)))throw new TypeError('subject_registration_gender_invalid')
 if(subject.kind==='human'&&Object.hasOwn(subject,'ncbiTaxonomyId'))throw new TypeError('subject_registration_taxonomy_forbidden')
 const ncbiTaxonomyId=subject.kind==='animal'?text(subject.ncbiTaxonomyId,12):undefined
 if(ncbiTaxonomyId&&!/^[1-9][0-9]*$/u.test(ncbiTaxonomyId))throw new TypeError('subject_registration_taxonomy_invalid')
 if(ncbiTaxonomyId){
  let speciesId7:string
  try{speciesId7=normalizeSubjectSpeciesId7(ncbiTaxonomyId)}catch{throw new TypeError('subject_registration_card_profile_unsupported')}
  if(speciesId7===HUMAN_SPECIES_ID7)throw new TypeError('subject_registration_card_profile_unsupported')
 }
 if(controller.relationship!==ProposedSubjectControllerRelationship)throw new TypeError('subject_registration_relationship_invalid')
 if(contact.kind!=='email'&&contact.kind!=='telephone')throw new TypeError('subject_registration_contact_invalid')
 const value=normalizeProfileIndexContact(contact.kind==='email'?ProfileIndexContactKind.Email:ProfileIndexContactKind.Telephone,text(contact.value,254))
 const demographics={alternateName,...(birthDate?{birthDate}:{}),...(birthYear!==undefined?{birthYear:Number(birthYear)}:{}),...(subject.gender?{gender:subject.gender as Demographics['gender']}:{})}
 return Object.freeze({operationId,subject:subject.kind==='animal'?Object.freeze({...demographics,kind:'animal' as const,ncbiTaxonomyId:ncbiTaxonomyId!}):Object.freeze({...demographics,kind:'human' as const}),controller:Object.freeze({legalName:text(controller.legalName,160),contact:Object.freeze({kind:contact.kind,value}),relationship:ProposedSubjectControllerRelationship})})
}
export function assertProvisionalSubjectRegistrationReceipt(input:unknown):asserts input is ProvisionalSubjectRegistrationReceipt{
 const receipt=record(input,['registrationId','subjectIdentifier','subjectKind','status','controllerInvitation','evidence'])
 uuid(receipt.registrationId)
 if(typeof receipt.subjectIdentifier!=='string'||!receipt.subjectIdentifier.startsWith('urn:uuid:'))throw new TypeError('subject_registration_receipt_invalid')
 uuid(receipt.subjectIdentifier.slice(9))
 const invitation=record(receipt.controllerInvitation,['invitationId','status']),evidence=record(receipt.evidence,['status'])
 uuid(invitation.invitationId)
 if(typeof receipt.subjectKind!=='string'||!['human','animal'].includes(receipt.subjectKind)||receipt.status!=='provisional'||invitation.status!=='pending'||evidence.status!=='pending')throw new TypeError('subject_registration_receipt_invalid')
}
