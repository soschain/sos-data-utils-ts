// Flow contract: only owned permission descriptors classify a section; inherited object names are never codes.
import assert from 'node:assert/strict'
import test from 'node:test'
test('rejects prototype and inherited property names as permission sections',async()=>{
  const sections=await import('../dist/healthcare-sections.js')
  for(const code of ['__proto__','constructor','toString']){
    assert.equal(sections.getHealthcarePermissionSectionByCode(code),undefined,code)
    assert.equal(sections.getHealthcarePermissionSectionFamilyByCode(code),undefined,code)
  }
})
