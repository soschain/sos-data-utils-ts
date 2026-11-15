import {FHIR_IPS_SECTION_CODES,FHIR_IPS_DOCUMENT_CODE,FhirCodeSystems,LoincSubjectMatterDomain} from 'fhir-data-utils-ts'

/** Attribute projection of the canonical FHIR/LOINC section catalog. */
const section=(code:string)=>Object.freeze({code,attributeValue:`${FhirCodeSystems.Loinc}|${code}`})
export const HealthcareSummarySections=Object.freeze({
  ProblemList:section(FHIR_IPS_SECTION_CODES.Problems),
  AllergiesAndIntolerances:section(FHIR_IPS_SECTION_CODES.Allergies),
  HistoryOfMedicationUse:section(FHIR_IPS_SECTION_CODES.Medications),
  Immunizations:section(FHIR_IPS_SECTION_CODES.Immunizations),
  Results:section(FHIR_IPS_SECTION_CODES.DiagnosticResults),
  Procedures:section(FHIR_IPS_SECTION_CODES.Procedures),
  MedicalDevices:section(FHIR_IPS_SECTION_CODES.MedicalDevices),
  VitalSigns:section(FHIR_IPS_SECTION_CODES.VitalSigns),
  SocialHistory:section(FHIR_IPS_SECTION_CODES.SocialHistory),
  Alert:section(FHIR_IPS_SECTION_CODES.Alerts),
  GoalsAndPreferences:section(FHIR_IPS_SECTION_CODES.Goals),
  AdvanceDirectives:section(FHIR_IPS_SECTION_CODES.AdvanceDirectives),
  FunctionalStatus:section(FHIR_IPS_SECTION_CODES.FunctionalStatus),
  HistoryOfPastIllness:section(FHIR_IPS_SECTION_CODES.PastIllness),
  PregnancyHistory:section(FHIR_IPS_SECTION_CODES.PregnancyHistory),
  PlanOfCare:section(FHIR_IPS_SECTION_CODES.PlanOfCare),
})

/** SOS permission selection metadata, distinct from native FHIR Coding tokens. */
export type HealthcareSectionDescriptor=Readonly<{
  system:string;code:string;attributeValue:string;claim:string;i18nKey:`org.loinc.${string}`;titleEn:string
}>
const permissionSection=(code:string,titleEn:string):HealthcareSectionDescriptor=>Object.freeze({
  system:FhirCodeSystems.Loinc,code,attributeValue:`LOINC|${code}`,claim:`LOINC|${code}`,i18nKey:`org.loinc.${code}`,titleEn,
})
const coreSections={
  ProblemList:permissionSection(FHIR_IPS_SECTION_CODES.Problems,'Problem list'),
  AllergiesAndIntolerances:permissionSection(FHIR_IPS_SECTION_CODES.Allergies,'Allergies and adverse reactions'),
  HistoryOfMedicationUse:permissionSection(FHIR_IPS_SECTION_CODES.Medications,'History of medication use'),
  Immunizations:permissionSection(FHIR_IPS_SECTION_CODES.Immunizations,'History of immunization'),
  Results:permissionSection(FHIR_IPS_SECTION_CODES.DiagnosticResults,'Relevant diagnostic tests/laboratory data'),
  Procedures:permissionSection(FHIR_IPS_SECTION_CODES.Procedures,'History of Procedures'),
  MedicalDevices:permissionSection(FHIR_IPS_SECTION_CODES.MedicalDevices,'History of medical device use'),
  VitalSigns:permissionSection(FHIR_IPS_SECTION_CODES.VitalSigns,'Vital signs'),
  SocialHistory:permissionSection(FHIR_IPS_SECTION_CODES.SocialHistory,'Social history'),
  Alert:permissionSection(FHIR_IPS_SECTION_CODES.Alerts,'Alert'),
  GoalsAndPreferences:permissionSection(FHIR_IPS_SECTION_CODES.Goals,'Goals / Preferences'),
  AdvanceDirectives:permissionSection(FHIR_IPS_SECTION_CODES.AdvanceDirectives,'Advance directives'),
  FunctionalStatus:permissionSection(FHIR_IPS_SECTION_CODES.FunctionalStatus,'Functional status'),
  HistoryOfPastIllness:permissionSection(FHIR_IPS_SECTION_CODES.PastIllness,'History of past illness'),
  PregnancyHistory:permissionSection(FHIR_IPS_SECTION_CODES.PregnancyHistory,'Pregnancy History'),
  PlanOfCare:permissionSection(FHIR_IPS_SECTION_CODES.PlanOfCare,'Plan of care'),
  // Additional SOS-supported permission selections, not additional IPS sections.
  DietAndNutrition:permissionSection('61144-2','Diet and nutrition'),
  HistoryOfFamilyMemberDiseases:permissionSection('10157-6','History of family member diseases'),
  HistoryOfHospitalizationsAndOutpatientVisits:permissionSection('46240-8','History of hospitalizations+History of outpatient visits'),
  HistoryOfPresentIllness:permissionSection('10164-2','History of present illness'),
  ProblemListNarrativeReported:permissionSection('57852-6','Problem list'),
  Instructions:permissionSection('69730-0','Instructions'),
}
const patientSummaryDocument=permissionSection(FHIR_IPS_DOCUMENT_CODE,'Patient summary document')
const permissionSubjectDomains:Readonly<Record<string,HealthcareSectionDescriptor>>=Object.freeze(Object.fromEntries(
  LoincSubjectMatterDomain.map(entry=>[entry.code,permissionSection(entry.code,entry.display)]),
))

/** Operational LOINC tokens accepted by the SOS access-permission profile. */
export const HealthcareCoreSections=Object.freeze(Object.defineProperties(coreSections,{
  PatientSummaryDocument:{value:patientSummaryDocument,enumerable:false},
  PlanOfTreatment:{value:coreSections.PlanOfCare,enumerable:false},
}) as typeof coreSections & Readonly<{PatientSummaryDocument:HealthcareSectionDescriptor;PlanOfTreatment:HealthcareSectionDescriptor}>)

/** The 16 IPS permission choices; existing native Summary URI projections remain unchanged. */
export const HealthcarePermissionSummarySections=Object.freeze(Object.fromEntries(
  (Object.keys(HealthcareSummarySections) as (keyof typeof HealthcareSummarySections)[]).map(name=>[name,HealthcareCoreSections[name]]),
) as {[Name in keyof typeof HealthcareSummarySections]:HealthcareSectionDescriptor})

export const HealthcareCanonicalSectionFamilies=Object.freeze({
  CoreSection:'core-section',KindOfDocument:'kind-of-document',TypeOfService:'type-of-service',SubjectMatterDomain:'subject-matter-domain',
} as const)
export type HealthcareCanonicalSectionFamily=typeof HealthcareCanonicalSectionFamilies[keyof typeof HealthcareCanonicalSectionFamilies]

/** Bounded permission profile: Core, IPS document and canonical FHIR subject domains; no workbook parity. */
export function getHealthcarePermissionSectionByCode(value:string):HealthcareSectionDescriptor|undefined{
  const code=String(value??'').trim().split('|').at(-1)
  return code===FHIR_IPS_DOCUMENT_CODE?patientSummaryDocument:Object.values(HealthcareCoreSections).find(section=>section.code===code)??(code!==undefined&&Object.hasOwn(permissionSubjectDomains,code)?permissionSubjectDomains[code]:undefined)
}

/** Metadata lookup only; a recognized selection never authorizes access. */
export function getHealthcarePermissionSectionFamilyByCode(value:string):HealthcareCanonicalSectionFamily|undefined{
  const section=getHealthcarePermissionSectionByCode(value)
  if(section){
    if(section.code===FHIR_IPS_DOCUMENT_CODE)return HealthcareCanonicalSectionFamilies.KindOfDocument
    return Object.hasOwn(permissionSubjectDomains,section.code)?HealthcareCanonicalSectionFamilies.SubjectMatterDomain:HealthcareCanonicalSectionFamilies.CoreSection
  }
  return undefined
}
