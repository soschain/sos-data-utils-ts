// Flow contract: operational permission descriptors preserve GW tokens while native FHIR section projections remain unchanged; classified editor state grants no authority.
import assert from 'node:assert/strict'
import test from 'node:test'
import {FHIR_IPS_SECTION_CODES, FhirCodeSystems} from 'fhir-data-utils-ts'
import {FHIR_IPS_DOCUMENT_TYPE_CLAIM} from 'fhir-data-utils-ts/clinical-document-bundle'
import {PermissionTemplateOperationCodes, PermissionTemplateTargetKinds} from '../dist/permission-templates.js'
import {Format} from '../dist/bff-wire-contract.js'

test('exposes the complete operational core section catalog without enumerating document aliases',async()=>{
  const {HealthcareCoreSections:core}=await import('../dist/healthcare-sections.js')
  assert.ok(core,'The operational Core catalog is required')
  assert.equal(Object.keys(core).length,22)
  assert.equal(core.Immunizations.attributeValue,`LOINC|${FHIR_IPS_SECTION_CODES.Immunizations}`)
  assert.equal(core.Results.system,FhirCodeSystems.Loinc)
  assert.equal(core.Results.claim,core.Results.attributeValue)
  assert.equal(core.Results.i18nKey,`org.loinc.${core.Results.code}`)
  assert.ok(core.Results.titleEn)
  for(const name of ['DietAndNutrition','HistoryOfFamilyMemberDiseases','HistoryOfHospitalizationsAndOutpatientVisits','HistoryOfPresentIllness','ProblemListNarrativeReported','Instructions'])assert.ok(core[name],name)
  assert.ok(core.PatientSummaryDocument)
  assert.equal(Object.keys(core).includes('PatientSummaryDocument'),false)
  assert.equal(core.PlanOfTreatment,core.PlanOfCare)
  assert.equal(Object.keys(core).includes('PlanOfTreatment'),false)
})

test('keeps native Summary URI tokens separate from the 16 permission-summary operational tokens',async()=>{
  const {HealthcareSummarySections:native,HealthcarePermissionSummarySections:permission,HealthcareCoreSections:core}=await import('../dist/healthcare-sections.js')
  assert.ok(permission,'An explicit operational Summary projection is required')
  assert.equal(Object.keys(permission).length,16)
  assert.deepEqual(Object.keys(permission),Object.keys(native))
  for(const [name,descriptor] of Object.entries(permission)){
    assert.equal(descriptor.attributeValue,`LOINC|${native[name].code}`)
    assert.equal(native[name].attributeValue,`${FhirCodeSystems.Loinc}|${native[name].code}`)
    assert.equal(descriptor,core[name])
  }
})

test('reuses existing SOS scope, target and claims-context constants',async()=>{
  const contract=await import('../dist/consent-access-editor-contract.js')
  assert.equal(contract.ConsentEditorScopeCodes,PermissionTemplateOperationCodes)
  assert.equal(contract.ConsentEditorTargetKinds,PermissionTemplateTargetKinds)
  assert.equal(contract.BundleEntryClaimsContext,Format.FHIR_API)
  assert.equal(contract.CommunicationClaimsContext,Format.FHIR_API)
  assert.deepEqual(Object.values(contract.ConsentEditorScopeCodes),['s','r','c','u','d'])
})

test('classifies operational and native core tokens identically without inventing unknown families',async()=>{
  const sections=await import('../dist/healthcare-sections.js')
  assert.equal(typeof sections.getHealthcarePermissionSectionFamilyByCode,'function')
  const code=FHIR_IPS_SECTION_CODES.Immunizations
  assert.equal(sections.getHealthcarePermissionSectionFamilyByCode(`LOINC|${code}`),'core-section')
  assert.equal(sections.getHealthcarePermissionSectionFamilyByCode(`${FhirCodeSystems.Loinc}|${code}`),'core-section')
  assert.equal(sections.getHealthcarePermissionSectionFamilyByCode(FHIR_IPS_DOCUMENT_TYPE_CLAIM),'kind-of-document')
  assert.equal(sections.getHealthcarePermissionSectionFamilyByCode('unrecognized-section'),undefined)
})
