import {IdentityEvidenceReviewMethods,assertSha3_384EvidenceContentId,type IdentityEvidenceReviewMethod} from 'antifraud-data-utils-ts/identity-assurance'

export const PendingSubjectEvidencePolicy=Object.freeze({maxFileBytes:10*1024*1024,maxFiles:3,mediaTypes:Object.freeze(['application/pdf','image/png','image/jpeg'] as const)})
export type PendingSubjectEvidenceSlot='subject'|'controller'|'relationship'
export type PendingSubjectEvidenceCommand=Readonly<{
 operationId:string;registrationId:string;verificationMethod:IdentityEvidenceReviewMethod
 subject:Readonly<{identifier?:Readonly<{system:string;value:string}>}>
 controller:Readonly<{identifier?:Readonly<{type:string;value:string;country:string}>}>
}>
export type PendingSubjectEvidenceReceipt=Readonly<{
 evidenceId:string;registrationId:string;status:'pending'
 documents:readonly Readonly<{slot:PendingSubjectEvidenceSlot;contentId:string;mediaType:string;fileName:string;size:number}>[]
}>
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu
function record(input:unknown,keys:readonly string[]):Record<string,unknown>{
 if(!input||typeof input!=='object'||Array.isArray(input))throw new TypeError('subject_registration_evidence_input_invalid')
 const descriptors=Object.getOwnPropertyDescriptors(input),snapshot:Record<string,unknown>=Object.create(null)
 for(const key of Reflect.ownKeys(descriptors)){
  if(typeof key!=='string'||!keys.includes(key)||!('value' in descriptors[key]!))throw new TypeError('subject_registration_evidence_field_forbidden')
  snapshot[key]=descriptors[key]!.value
 }
 return snapshot
}
function text(input:unknown,max:number):string{if(typeof input!=='string'||!input.trim()||input.trim().length>max)throw new TypeError('subject_registration_evidence_text_invalid');return input.trim()}
function uuid(input:unknown):string{if(typeof input!=='string'||!UUID.test(input))throw new TypeError('subject_registration_evidence_identifier_invalid');return input.toLowerCase()}
export function normalizePendingSubjectEvidenceCommand(input:unknown):PendingSubjectEvidenceCommand{
 const command=record(input,['operationId','registrationId','verificationMethod','subject','controller'])
 const subject=record(command.subject,['identifier']),controller=record(command.controller,['identifier'])
 const subjectId=Object.hasOwn(subject,'identifier')?record(subject.identifier,['system','value']):undefined
 const controllerId=Object.hasOwn(controller,'identifier')?record(controller.identifier,['type','value','country']):undefined
 if(typeof command.verificationMethod!=='string'||!Object.values(IdentityEvidenceReviewMethods).some(method=>method===command.verificationMethod))throw new TypeError('subject_registration_evidence_method_invalid')
 const country=controllerId?text(controllerId.country,2).toUpperCase():undefined
 if(country&&!/^[A-Z]{2}$/u.test(country))throw new TypeError('subject_registration_evidence_country_invalid')
 return Object.freeze({operationId:uuid(command.operationId),registrationId:uuid(command.registrationId),verificationMethod:command.verificationMethod as IdentityEvidenceReviewMethod,
  subject:Object.freeze(subjectId?{identifier:Object.freeze({system:text(subjectId.system,256),value:text(subjectId.value,160)})}:{}),
  controller:Object.freeze(controllerId?{identifier:Object.freeze({type:text(controllerId.type,64),value:text(controllerId.value,160),country:country!})}:{})})
}
export function assertPendingSubjectEvidenceReceipt(input:unknown):asserts input is PendingSubjectEvidenceReceipt{
 const receipt=record(input,['evidenceId','registrationId','status','documents'])
 uuid(receipt.evidenceId);uuid(receipt.registrationId)
 if(receipt.status!=='pending'||!Array.isArray(receipt.documents)||receipt.documents.length<1||receipt.documents.length>PendingSubjectEvidencePolicy.maxFiles)throw new TypeError('subject_registration_evidence_receipt_invalid')
 const slots=new Set<string>()
 for(const item of receipt.documents){
  const document=record(item,['slot','contentId','mediaType','fileName','size'])
  if(typeof document.slot!=='string'||!['subject','controller','relationship'].includes(document.slot)||slots.has(document.slot))throw new TypeError('subject_registration_evidence_slot_invalid')
  slots.add(document.slot)
  assertSha3_384EvidenceContentId(text(document.contentId,200))
  if(typeof document.mediaType!=='string'||!PendingSubjectEvidencePolicy.mediaTypes.some(type=>type===document.mediaType))throw new TypeError('subject_registration_evidence_media_invalid')
  const name=text(document.fileName,180)
  if(/[\\/\u0000-\u001f]/u.test(name)||typeof document.size!=='number'||!Number.isSafeInteger(document.size)||document.size<1||document.size>PendingSubjectEvidencePolicy.maxFileBytes)throw new TypeError('subject_registration_evidence_document_invalid')
 }
 if(!slots.has('subject'))throw new TypeError('subject_registration_evidence_subject_document_required')
}
