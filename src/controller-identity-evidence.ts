import {IdentityEvidenceReviewMethods,type IdentityEvidenceReviewMethod} from 'antifraud-data-utils-ts/identity-assurance'

/** Upload limits describe private evidence intake; selecting a method never verifies identity. */
export const ControllerIdentityEvidencePolicy=Object.freeze({maxFileBytes:10*1024*1024,maxFiles:3,mediaTypes:Object.freeze(['application/pdf','image/png','image/jpeg'] as const)})
export type ControllerIdentityEvidenceSlot='subject'|'controller'|'relationship'
export type ControllerIdentityEvidenceCommand=Readonly<{
 operationId:string
 verificationMethod:IdentityEvidenceReviewMethod
 subject:Readonly<{identifier?:Readonly<{system:string;value:string}>}>
 controller:Readonly<{identifier?:Readonly<{type:string;value:string;country:string}>}>
}>
export type ControllerIdentityEvidenceReceipt=Readonly<{
 evidenceId:string
 operationId:string
 status:'pending'
 files:readonly Readonly<{fileId:string;slot:ControllerIdentityEvidenceSlot}>[]
}>
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu
function invalid():never{throw new TypeError('controller_identity_evidence_input_invalid')}
function record(input:unknown,allowed:readonly string[]):Record<string,unknown>{
 if(!input||typeof input!=='object'||Array.isArray(input))return invalid()
 const prototype=Object.getPrototypeOf(input)
 if(prototype!==Object.prototype&&prototype!==null)return invalid()
 const descriptors=Object.getOwnPropertyDescriptors(input),result:Record<string,unknown>=Object.create(null)
 for(const key of Reflect.ownKeys(descriptors)){
  if(typeof key!=='string'||!allowed.includes(key))return invalid()
  const descriptor=descriptors[key]!
  if(!Object.hasOwn(descriptor,'value'))return invalid()
  result[key]=descriptor.value
 }
 return result
}
function text(input:unknown,max:number):string{
 if(typeof input!=='string'||!input.trim()||input.trim().length>max)return invalid()
 return input.trim()
}
function uuid(input:unknown):string{if(typeof input!=='string'||!UUID.test(input))return invalid();return input.toLowerCase()}
function reviewMethod(input:unknown):IdentityEvidenceReviewMethod{
 for(const method of Object.values(IdentityEvidenceReviewMethods))if(input===method)return method
 return invalid()
}
function slot(input:unknown):ControllerIdentityEvidenceSlot{
 if(input==='subject'||input==='controller'||input==='relationship')return input
 return invalid()
}
/** Snapshot array elements without evaluating accessors, custom iterators or extra metadata. */
function files(input:unknown):readonly unknown[]{
 if(!Array.isArray(input))return invalid()
 const source:object=input
 const descriptors=Object.getOwnPropertyDescriptors(source),length=descriptors.length?.value
 if(typeof length!=='number'||length<1||length>ControllerIdentityEvidencePolicy.maxFiles)return invalid()
 for(const key of Reflect.ownKeys(descriptors)){
  if(key==='length')continue
  if(typeof key!=='string'||!/^(?:0|[1-9][0-9]*)$/u.test(key)||Number(key)>=length||!Object.hasOwn(descriptors[key]!,'value'))return invalid()
 }
 const result:unknown[]=[]
 for(let index=0;index<length;index++){
  const descriptor=descriptors[String(index)]
  if(!descriptor||!Object.hasOwn(descriptor,'value'))return invalid()
  result.push(descriptor.value)
 }
 return result
}

/** No account, card, generation or ownership assertion is accepted from this browser command. */
export function normalizeControllerIdentityEvidenceCommand(input:unknown):ControllerIdentityEvidenceCommand{
 const command=record(input,['operationId','verificationMethod','subject','controller'])
 const subject=record(command.subject,['identifier']),controller=record(command.controller,['identifier'])
 const subjectId=Object.hasOwn(subject,'identifier')?record(subject.identifier,['system','value']):undefined
 const controllerId=Object.hasOwn(controller,'identifier')?record(controller.identifier,['type','value','country']):undefined
 const country=controllerId?text(controllerId.country,2).toUpperCase():undefined
 if(country!==undefined&&!/^[A-Z]{2}$/u.test(country))return invalid()
 return Object.freeze({operationId:uuid(command.operationId),verificationMethod:reviewMethod(command.verificationMethod),
  subject:Object.freeze(subjectId?{identifier:Object.freeze({system:text(subjectId.system,256),value:text(subjectId.value,160)})}:{}),
  controller:Object.freeze(controllerId&&country?{identifier:Object.freeze({type:text(controllerId.type,64),value:text(controllerId.value,160),country})}:{}),
 })
}

/** A receipt exposes only pending evidence and opaque protected file IDs, never private document metadata. */
export function assertControllerIdentityEvidenceReceipt(input:unknown):asserts input is ControllerIdentityEvidenceReceipt{
 const receipt=record(input,['evidenceId','operationId','status','files'])
 uuid(receipt.evidenceId);uuid(receipt.operationId)
 if(receipt.status!=='pending')return invalid()
 const slots=new Set<ControllerIdentityEvidenceSlot>(),ids=new Set<string>()
 for(const item of files(receipt.files)){
  const file=record(item,['fileId','slot']),fileId=uuid(file.fileId),selectedSlot=slot(file.slot)
  if(slots.has(selectedSlot)||ids.has(fileId))return invalid()
  slots.add(selectedSlot);ids.add(fileId)
 }
}
