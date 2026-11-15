// Flow contract: SOS permission metadata projects canonical FHIR subject domains without dropping Dentistry or claiming a complete workbook lookup.
import assert from 'node:assert/strict'
import test from 'node:test'
import {LoincSubjectMatterDomain} from 'fhir-data-utils-ts'
test('retains Dentistry and every canonical subject-matter domain in operational permission classification',async()=>{
  const sections=await import('../dist/healthcare-sections.js')
  const dentistry=LoincSubjectMatterDomain.find(entry=>entry.display==='Dentistry')
  assert.ok(dentistry)
  assert.equal(sections.getHealthcarePermissionSectionFamilyByCode(`LOINC|${dentistry.code}`),sections.HealthcareCanonicalSectionFamilies.SubjectMatterDomain)
  for(const entry of LoincSubjectMatterDomain){
    assert.equal(sections.getHealthcarePermissionSectionFamilyByCode(`${entry.system}|${entry.code}`),sections.HealthcareCanonicalSectionFamilies.SubjectMatterDomain)
    assert.equal(sections.getHealthcarePermissionSectionByCode(entry.code)?.titleEn,entry.display)
  }
})
