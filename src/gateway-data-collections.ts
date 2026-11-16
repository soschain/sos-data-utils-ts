import {ResourceTypesFhirR4} from 'fhir-data-utils-ts'
import {HealthcarePermissionSummarySections} from './healthcare-sections.js'

/** SOS logical storage/index names, independent of a database or access grant. */
export const DataCollectionIds=Object.freeze({
  adverseEvents:'adverse-events',
  allergies:'allergies',
  carePlans:'care-plans',
  communications:'communications',
  composition:'composition',
  conditions:'conditions',
  consents:'consents',
  diagnosticReports:'diagnostic-reports',
  deviceUseStatements:'device-use-statements',
  documentReferences:'document-references',
  encounters:'encounters',
  flags:'flags',
  imagingStudies:'imaging-studies',
  immunizations:'immunizations',
  medications:'medications',
  observations:'observations',
  procedures:'procedures',
  relatedPersons:'related-persons',
} as const)
export type DataCollectionId=typeof DataCollectionIds[keyof typeof DataCollectionIds]

/** Operational fan-out by the canonical FHIR resource family; not a FHIR storage standard. */
export const FhirResourceTypeDataCollections=Object.freeze({
  [ResourceTypesFhirR4.AdverseEvent]:DataCollectionIds.adverseEvents,
  [ResourceTypesFhirR4.AllergyIntolerance]:DataCollectionIds.allergies,
  [ResourceTypesFhirR4.CarePlan]:DataCollectionIds.carePlans,
  [ResourceTypesFhirR4.Condition]:DataCollectionIds.conditions,
  [ResourceTypesFhirR4.Consent]:DataCollectionIds.consents,
  [ResourceTypesFhirR4.DiagnosticReport]:DataCollectionIds.diagnosticReports,
  [ResourceTypesFhirR4.DeviceUseStatement]:DataCollectionIds.deviceUseStatements,
  [ResourceTypesFhirR4.Encounter]:DataCollectionIds.encounters,
  [ResourceTypesFhirR4.Flag]:DataCollectionIds.flags,
  [ResourceTypesFhirR4.ImagingStudy]:DataCollectionIds.imagingStudies,
  [ResourceTypesFhirR4.Immunization]:DataCollectionIds.immunizations,
  [ResourceTypesFhirR4.MedicationStatement]:DataCollectionIds.medications,
  [ResourceTypesFhirR4.Observation]:DataCollectionIds.observations,
  [ResourceTypesFhirR4.Procedure]:DataCollectionIds.procedures,
  [ResourceTypesFhirR4.RelatedPerson]:DataCollectionIds.relatedPersons,
} as const)

const collections=(...ids:DataCollectionId[])=>Object.freeze(ids)
/** Operational permission-section fan-out. Native URI-qualified section tokens remain distinct. */
export const HealthcareSummarySectionDataCollections:Readonly<Record<string,readonly DataCollectionId[]>>=Object.freeze({
  [HealthcarePermissionSummarySections.HistoryOfMedicationUse.attributeValue]:collections(DataCollectionIds.medications),
  [HealthcarePermissionSummarySections.AllergiesAndIntolerances.attributeValue]:collections(DataCollectionIds.allergies),
  [HealthcarePermissionSummarySections.ProblemList.attributeValue]:collections(DataCollectionIds.conditions),
  [HealthcarePermissionSummarySections.Results.attributeValue]:collections(DataCollectionIds.observations,DataCollectionIds.diagnosticReports),
  [HealthcarePermissionSummarySections.Procedures.attributeValue]:collections(DataCollectionIds.procedures),
  [HealthcarePermissionSummarySections.Immunizations.attributeValue]:collections(DataCollectionIds.immunizations),
  [HealthcarePermissionSummarySections.FunctionalStatus.attributeValue]:collections(DataCollectionIds.conditions),
  [HealthcarePermissionSummarySections.PlanOfCare.attributeValue]:collections(DataCollectionIds.carePlans),
  [HealthcarePermissionSummarySections.SocialHistory.attributeValue]:collections(DataCollectionIds.observations),
  [HealthcarePermissionSummarySections.VitalSigns.attributeValue]:collections(DataCollectionIds.observations),
  [HealthcarePermissionSummarySections.AdvanceDirectives.attributeValue]:collections(DataCollectionIds.consents),
  [HealthcarePermissionSummarySections.HistoryOfPastIllness.attributeValue]:collections(DataCollectionIds.conditions),
  [HealthcarePermissionSummarySections.PregnancyHistory.attributeValue]:collections(DataCollectionIds.observations),
  [HealthcarePermissionSummarySections.GoalsAndPreferences.attributeValue]:collections(DataCollectionIds.consents),
  [HealthcarePermissionSummarySections.Alert.attributeValue]:collections(DataCollectionIds.flags),
  [HealthcarePermissionSummarySections.MedicalDevices.attributeValue]:collections(DataCollectionIds.deviceUseStatements),
})
