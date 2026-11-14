// Flow contract: authoritative Consent narrows read-only SMART scopes to one subject and explicitly allowed sections; aliases confer no extra authority.
import test from 'node:test'
import assert from 'node:assert/strict'
import { Isco08CodingSystem, Isco08Hl7CodingSystem } from 'antifraud-data-utils-ts'
import { ClaimConsent, ConsentStatuses, FHIR_IPS_DOCUMENT_CODE } from 'fhir-data-utils-ts'
import { REPOSITORY_SAFE_EXAMPLES as SAFE } from '../dist/repository-privacy.js'
import { HealthcareSummarySections as Sections } from '../dist/healthcare-sections.js'
import { HealthcareActorRoles } from '../dist/healthcare-roles.js'
import * as smart from '../dist/index.js'

const subject = SAFE.subjectCardProviders.humanIndexDid
const allergy = Sections.AllergiesAndIntolerances.attributeValue
const problems = Sections.ProblemList.attributeValue
const role = HealthcareActorRoles.Dentist
const rule = (overrides={}) => ({
  [ClaimConsent.subject]:subject,
  [ClaimConsent.status]:ConsentStatuses.Active,
  [ClaimConsent.decision]:'permit',
  [ClaimConsent.actorIdentifier]:SAFE.firstContactEmail,
  [ClaimConsent.actorRole]:role,
  [ClaimConsent.purpose]:'TREAT',
  [ClaimConsent.action]:allergy,
  ...overrides,
})
const scope = (section=allergy, owner=subject, verb='rs') => `organization/Composition.${verb}?${new URLSearchParams({subject:owner,section})}`
const input = (overrides={}) => ({requestedScopes:scope(),actor:{actorKind:'professional',email:SAFE.firstContactEmail},actorRole:role,purpose:'TREAT',now:'2026-11-13T00:00:00Z',...overrides})

test('projects only the requested and consented sections with audit decisions',()=>{
  assert.equal(typeof smart.deriveGrantedSmartScopes,'function')
  const result=smart.deriveGrantedSmartScopes([rule()],input({requestedScopes:scope(`${allergy},${problems}`)}))
  assert.equal(result.decision,'partial')
  assert.deepEqual(result.grantedSections,[allergy])
  assert.deepEqual(result.deniedSections,[problems])
  assert.deepEqual(result.grantedScopes,[scope()])
  assert.equal(result.evaluations.length,2)
  assert.equal(result.evaluations[0].winningRules.length,1)
})
test('WHO SMART ISCO URI and persisted aliases match in either direction without broadening codes',()=>{
  for(const [stored,requested] of [[`${Isco08CodingSystem}|2261`,role],[role,`${Isco08CodingSystem}|2261`],['org.ilo.isco|2261',role],['org.ilo.isco-08|2261',role]]) {
    assert.equal(smart.deriveGrantedSmartScopes([rule({[ClaimConsent.actorRole]:stored})],input({actorRole:requested})).decision,'granted')
  }
  assert.equal(smart.deriveGrantedSmartScopes([rule()],input({actorRole:'ISCO-08|2250'})).decision,'denied')
  for(const [stored,requested] of [[`${Isco08Hl7CodingSystem}|2261`,role],[role,`${Isco08Hl7CodingSystem}|2261`]]) {
    assert.equal(smart.deriveGrantedSmartScopes([rule({[ClaimConsent.actorRole]:stored})],input({actorRole:requested})).decision,'granted')
  }
  assert.equal(smart.deriveGrantedSmartScopes([rule()],input({actorRole:`${Isco08Hl7CodingSystem}|2250`})).decision,'denied')
})
test('rejects missing or mixed subjects and ambiguous repeated query filters',()=>{
  assert.throws(()=>smart.deriveGrantedSmartScopes([rule()],input({requestedScopes:[]})))
  assert.throws(()=>smart.deriveGrantedSmartScopes([rule()],input({requestedScopes:'organization/Composition.rs?section=*'})))
  assert.throws(()=>smart.deriveGrantedSmartScopes([rule()],input({requestedScopes:[scope(),scope(allergy,SAFE.subjectCardProviders.animalIndexDid)]})))
  for(const extra of ['subject','section']) {
    assert.equal(smart.deriveGrantedSmartScopes([rule()],input({requestedScopes:`${scope()}&${extra}=*`})).decision,'denied')
  }
})
test('write scopes, patient scopes, unknown resource types and filters never receive grants',()=>{
  for(const requestedScopes of [scope(allergy,subject,'cruds'),scope().replace('organization/','patient/'),scope().replace('Composition.','Observation.'),`${scope()}&unknown=true`]) {
    assert.equal(smart.deriveGrantedSmartScopes([rule()],input({requestedScopes})).decision,'denied')
  }
})
test('wildcards expand explicitly and active deny, expiry, subject and actor checks remain effective',()=>{
  const wild=input({requestedScopes:scope('*'),availableSections:[allergy,problems]})
  assert.deepEqual(smart.deriveGrantedSmartScopes([rule()],wild).grantedSections,[allergy])
  for(const override of [
    {[ClaimConsent.decision]:'deny'},
    {[ClaimConsent.periodEnd]:'2026-11-13T00:00:00Z'},
    {[ClaimConsent.status]:'draft'},
    {[ClaimConsent.subject]:SAFE.subjectCardProviders.animalIndexDid},
    {[ClaimConsent.actorIdentifier]:SAFE.individualEmail},
  ]) assert.equal(smart.deriveGrantedSmartScopes([rule(override)],input()).decision,'denied')
})
test('scope builder pins the subject, encodes its query and preserves the compatibility alias',()=>{
  assert.equal(smart.buildScopeSmartCompositionAccess({subjectDid:subject,sections:[allergy]}),scope())
  assert.equal(smart.buildSmartCompositionReadScope({subjectDid:subject,sections:[allergy]}),scope())
  assert.throws(()=>smart.buildScopeSmartCompositionAccess({subjectDid:''}))
  assert.equal(smart.buildScopeSmartCompositionAccess({subjectDid:subject}),scope(`LOINC|${FHIR_IPS_DOCUMENT_CODE}`))
  assert.deepEqual(smart.deriveGrantedSmartScopes([rule()],input({requestedScopes:scope('*')})).grantedScopes,[scope(`LOINC|${Sections.AllergiesAndIntolerances.code}`)])
})
