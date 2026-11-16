import {HealthcareCoreSections as S} from './healthcare-sections.js';
/** Existing animal emergency profile; verification and consent remain runtime gates. */
export const AnimalEmergencyProfile=Object.freeze({ReasonCode:'animal-emergency',MaxLifetimeSeconds:15*60} as const);
/** Existing claims-first entry discriminators, independent of native FHIR resource types. */
export const GatewayResourceTypes=Object.freeze({Customer:'Customer',Order:'Order',License:'License'} as const);
/** Canonical LOINC permission tokens retained by the gateway access profile. */
export const HealthcareConsentActions=Object.freeze({PatientSummaryDocument:S.PatientSummaryDocument.attributeValue,
AllergiesAndIntolerances:S.AllergiesAndIntolerances.attributeValue,HistoryOfMedicationUse:S.HistoryOfMedicationUse.attributeValue,
ProblemList:S.ProblemList.attributeValue,Results:S.Results.attributeValue,Procedures:S.Procedures.attributeValue,Immunizations:S.Immunizations.attributeValue});

/** Existing asynchronous operation wire actions. */
export const GatewayJobActions=Object.freeze({_batch:'_batch',_create:'_create',_discovery:'_discovery',_search:'_search'} as const);
/** Host network discovery labels; a label grants no verification evidence. */
export const HostNetworkTypes=Object.freeze({Test:'test',TestNetwork:'test-network',Network:'network'} as const);
