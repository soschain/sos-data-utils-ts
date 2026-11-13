/** Shared operational route formats; native FHIR remains an explicit projection. */
export const Format=Object.freeze({SCHEMA:'org.schema',FHIR_API:'org.hl7.fhir.api',FHIR_R4:'org.hl7.fhir.r4'} as const)
export const HttpMediaTypes=Object.freeze({FhirJson:'application/fhir+json'} as const)
