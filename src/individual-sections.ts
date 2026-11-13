export type IndividualSectionDescriptor=Readonly<{code:string;attributeValue:string;titleEn:string}>
/** Historical persisted wire identifier retained independently; no package implementation is required. */
export const IndividualSectionSystems=Object.freeze({Logical:'urn:gdc:individual-section'} as const)
const section=(code:string,titleEn:string):IndividualSectionDescriptor=>Object.freeze({code,titleEn,attributeValue:`${IndividualSectionSystems.Logical}|${code}`})
export const IndividualLogicalSections=Object.freeze({
  Composition:section('composition','Individual composition index'),
  Communications:section('communications','Communications'),Consents:section('consents','Consents'),
  Appointments:section('appointments','Appointments'),Encounters:section('encounters','Encounters'),
  Documents:section('documents','Documents'),Observations:section('observations','Observations'),
  DiagnosticReports:section('diagnostic-reports','Diagnostic reports'),
  RelatedPersons:section('related-persons','Related persons'),Coverage:section('coverage','Coverage'),
})
