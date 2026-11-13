import {ClaimConsent as C,ConsentDecisions,HealthcareConsentPurposes as P,FhirCodeSystems,FHIR_IPS_DOCUMENT_CODE,HL7_CODING_SYSTEM_V3_ROLE_CODE,type ConsentDecision} from 'fhir-data-utils-ts'
import {HealthcareActorRoles as Roles} from './healthcare-roles.js'
import {HealthcareSummarySections as Sections} from './healthcare-sections.js'
import type {BundleEntry} from './bundle-contract.js'
import {DataspaceSectors,type DataspaceSector} from './dataspace-sectors.js'

export const PermissionTemplateActorTypes=Object.freeze({Professional:'professional',RelatedPerson:'related-person'} as const)
export const PermissionTemplateTargetKinds=Object.freeze({Section:'section',ResourceType:'resource-type'} as const)
export const PermissionTemplateOperationCodes=Object.freeze({Search:'s',Read:'r',Create:'c',Update:'u',Delete:'d'} as const)
export type PermissionTemplateOperationCode=typeof PermissionTemplateOperationCodes[keyof typeof PermissionTemplateOperationCodes]
export type PermissionTemplateTarget=Readonly<{kind:'section'|'resource-type';code:string;sectionFamily?:string;scopes:readonly PermissionTemplateOperationCode[]}>
export type PermissionTemplateRoleRef=Readonly<{family:string;codingSystem:string;code:string;claim:string;display?:string}>
export type PermissionGrantRequestDraft=Readonly<{
  actorIdentifiers:readonly string[];purposes:readonly string[];roles:readonly string[]
  targets:readonly PermissionTemplateTarget[];metadataOnly?:boolean;smartScopes?:readonly string[]
}>
export type PermissionGrantDecision=PermissionGrantRequestDraft&Readonly<{decision:ConsentDecision}>
export type RolePermissionTemplate=Readonly<{
  id:string;actorType:'professional'|'related-person';sector:DataspaceSector;role:PermissionTemplateRoleRef
  decision:ConsentDecision;purposes:readonly string[];targets:readonly PermissionTemplateTarget[];metadataOnly?:boolean;smartScopes?:readonly string[]
}>
export type ImportPermissionTemplateOverrides=Partial<PermissionGrantDecision>
export type ExportConsentClaimsOptions=Readonly<{identifier?:string;subject?:string}>
export type ResolvePermissionTemplateInput=Readonly<{sector:DataspaceSector;roleClaim?:string;role?:Readonly<{codingSystem:string;code:string}>}>
const ips=`${FhirCodeSystems.Loinc}|${FHIR_IPS_DOCUMENT_CODE}`
const csv=(value:unknown):string[]=>[...new Set((Array.isArray(value)?value:String(value??'').split(',')).map(String).map(value=>value.trim()).filter(Boolean))]
const target=(kind:'section'|'resource-type',code:string,scope:PermissionTemplateOperationCode='r'):PermissionTemplateTarget=>Object.freeze({kind,code,scopes:[scope],...(kind==='section'&&code===ips?{sectionFamily:'kind-of-document'}:{})})
const section=(code:string)=>target('section',code)
const resource=(code:string)=>target('resource-type',code)

function template(sector:DataspaceSector,claim:string,purposes:readonly string[],targets:readonly PermissionTemplateTarget[],metadataOnly=false):RolePermissionTemplate{
  const isco=claim.startsWith('ISCO-08|')
  const code=claim.split('|').at(-1)!
  const related=code==='MTH'
  const role=Object.freeze({code,claim,family:isco?'professionalOccupationIsco08':related?'personalRelationshipHl7':'legalRepresentativeHl7',codingSystem:isco?'org.ilo.isco':HL7_CODING_SYSTEM_V3_ROLE_CODE})
  return Object.freeze({id:`${sector}_${isco?'isco-08':'v3-RoleCode'}_${code}`,sector,role,decision:ConsentDecisions.Permit,actorType:related?'related-person':'professional',purposes:Object.freeze([...purposes]),targets:Object.freeze([...targets]),...(metadataOnly?{metadataOnly:true}:{})})
}
/** Editable starting points only; no template constitutes an active Consent. */
export const ConsentPermissionTemplates:Readonly<Record<string,RolePermissionTemplate>>=Object.freeze(Object.fromEntries([
  template(DataspaceSectors.HealthCare,Roles.Controller,[P.PatientAdministration],[target('section',ips,'s'),target('resource-type','DocumentReference','s')],true),
  template(DataspaceSectors.HealthCare,Roles.GeneralistMedicalPractitioner,[P.Treatment,P.EmergencyTreatment],[section(Sections.Results.attributeValue),section(Sections.HistoryOfMedicationUse.attributeValue),section(ips),resource('DocumentReference'),resource('MedicationStatement'),resource('Observation')]),
  template(DataspaceSectors.HealthCare,Roles.NursingProfessional,[P.Treatment],[section(Sections.HistoryOfMedicationUse.attributeValue),resource('DocumentReference'),resource('MedicationStatement')]),
  template(DataspaceSectors.AnimalCare,Roles.Veterinarian,[P.Treatment],[section(ips),resource('DocumentReference'),resource('Observation')]),
  template(DataspaceSectors.HealthCare,'v3-RoleCode|MTH',[P.Treatment],[section(ips),resource('DocumentReference')]),
].map(value=>[value.id,value])))

export const getConsentPermissionTemplates=():Readonly<Record<string,RolePermissionTemplate>>=>ConsentPermissionTemplates
export function resolvePermissionTemplate(input:ResolvePermissionTemplateInput):RolePermissionTemplate|undefined{
  const claim=input.roleClaim?.replace(/^(?:org\.ilo\.isco(?:-08)?)\|/u,'ISCO-08|')
  return Object.values(ConsentPermissionTemplates).find(value=>value.sector===input.sector&&(claim?value.role.claim===claim:input.role&&value.role.code===input.role.code&&value.role.codingSystem===input.role.codingSystem))
}
export function importPermissionTemplate(template:RolePermissionTemplate,overrides:ImportPermissionTemplateOverrides={}):PermissionGrantDecision{
  return Object.freeze({actorIdentifiers:overrides.actorIdentifiers??[],decision:overrides.decision??template.decision,purposes:overrides.purposes??template.purposes,roles:overrides.roles??[template.role.claim],targets:overrides.targets??template.targets,metadataOnly:overrides.metadataOnly??template.metadataOnly,smartScopes:overrides.smartScopes??template.smartScopes??[]})
}
export function importConsentClaims(claims:Record<string,unknown>):PermissionGrantDecision{
  return Object.freeze({actorIdentifiers:csv(claims[C.actorIdentifier]),decision:claims[C.decision]==='deny'?'deny':'permit',purposes:csv(claims[C.purpose]),roles:csv(claims[C.actorRole]),targets:[...csv(claims[C.action]).map(section),...csv(claims[C.category]).map(section),...csv(claims[C.resourceType]).map(resource)],metadataOnly:false,smartScopes:[]})
}
export const importConsentEntry=(entry:BundleEntry):PermissionGrantDecision=>importConsentClaims(entry.resource?.meta?.claims??{})
export function exportConsentClaims(decision:PermissionGrantDecision,options:ExportConsentClaimsOptions={}):Record<string,unknown>{
  const actions:string[]=[],categories:string[]=[],types:string[]=[]
  for(const target of decision.targets){
    const unsupported=target.scopes.filter(scope=>scope!=='r')
    if(unsupported.length)throw new Error(`Current consent claims only preserve read-oriented targets. Unsupported scopes: ${unsupported.join(',')}`)
    if(target.kind==='resource-type')types.push(target.code)
    else if(target.sectionFamily==='kind-of-document')categories.push(target.code)
    else actions.push(target.code)
  }
  const claims:Record<string,unknown>={'@context':'org.hl7.fhir.api',[C.decision]:decision.decision}
  if(options.identifier)claims[C.identifier]=options.identifier
  if(options.subject)claims[C.subject]=options.subject
  for(const [key,values] of [[C.actorIdentifier,decision.actorIdentifiers],[C.purpose,decision.purposes],[C.actorRole,decision.roles],[C.action,actions],[C.category,categories],[C.resourceType,types]] as const){
    if(values.length)claims[key]=csv(values).join(',')
  }
  return claims
}
