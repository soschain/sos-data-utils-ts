import {FHIR_IPS_SECTION_CODES,FhirCodeSystems} from 'fhir-data-utils-ts'

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
