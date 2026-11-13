// Flow contract: a coded Consent permit requires trusted exact resource classification; absent classification never broadens a permit or discards a coded denial.
import assert from 'node:assert/strict'
import test from 'node:test'
import {ClaimConsent as C,HealthcareConsentPurposes,FHIR_ENCOUNTER_TRANSFER_TEST_DATA as encounter} from 'fhir-data-utils-ts'
import {buildConsentClaimsSimple,evaluateConsentCoverage} from '../dist/consent-coverage.js'
import {IndividualLogicalSections} from '../dist/individual-sections.js'
import {DemoMemberConsentRoleClaims} from '../dist/demo-member-lifecycle.js'
import {REPOSITORY_SAFE_EXAMPLES as safe} from '../dist/repository-privacy.js'

const emergency=`${encounter.class.system}|${encounter.class.code}`
const request={subject:safe.didWeb,actor:{actorKind:'related-person',email:safe.firstContactEmail},actorRole:DemoMemberConsentRoleClaims.Caregiver,purpose:HealthcareConsentPurposes.Treatment,sections:[IndividualLogicalSections.Encounters.attributeValue]}
const rule=(decision='permit',coded=true)=>({
  ...buildConsentClaimsSimple({subjectDid:request.subject,actor:safe.firstContactEmail,actorRole:request.actorRole,purpose:request.purpose,actions:request.sections,consentIdentifier:safe.resourceUuid,decision}).consentClaims,
  [C.status]:'active',[C.resourceType]:'Encounter,EncounterHistory',...(coded?{[C.provisionCode]:emergency}:{}),
})

test('a coded permit requires exact trusted classification and resource type',()=>{
  for(const context of [undefined,{resourceType:'Encounter',provisionCodes:[]},{resourceType:'Encounter',provisionCodes:[`${emergency}-other`]},{resourceType:'Appointment',provisionCodes:[emergency]}]){
    assert.equal(evaluateConsentCoverage([rule()],{...request,resourceContext:context}).allowed,false)
  }
  assert.equal(evaluateConsentCoverage([rule()],{...request,resourceContext:{resourceType:'Encounter',provisionCodes:[emergency]}}).allowed,true)
  assert.equal(evaluateConsentCoverage([rule('permit',false)],request).allowed,true)
})

test('missing or empty classification cannot discard an explicit coded denial',()=>{
  for(const context of [undefined,{resourceType:'Encounter',provisionCodes:[]}]){
    assert.equal(evaluateConsentCoverage([rule('permit',false),rule('deny')],{...request,resourceContext:context}).allowed,false)
  }
})
