// Flow contract: reuse shared test fixtures and canonical types; do not introduce duplicated literals.

import assert from 'node:assert/strict'
import test from 'node:test'

import { ClaimConsent } from 'fhir-data-utils-ts'
import {
  ANIMAL_INSURANCE_CONSENT_TEST_DATA,
  ANIMAL_INSURANCE_CONSENT_TEST_INPUT,
  AnimalInsuranceConsentErrors,
  AnimalInsuranceConsentVocabulary,
  buildAnimalInsuranceEligibilityConsent,
  projectAnimalInsuranceConsentToFhirR4,
  projectAnimalInsuranceConsentToFhirR5,
  validateAnimalInsuranceConsentOdrlParity,
} from 'sos-data-utils-ts/animal-insurance-consent'

const T = ANIMAL_INSURANCE_CONSENT_TEST_DATA

const input = ANIMAL_INSURANCE_CONSENT_TEST_INPUT

test('builds one claims-first Consent whose authorization semantics mirror its ODRL attachment', () => {
  const consent = buildAnimalInsuranceEligibilityConsent(input)
  const claims = consent.meta.claims
  const policy = validateAnimalInsuranceConsentOdrlParity(consent)

  assert.deepEqual(Object.keys(consent).sort(), ['id', 'meta', 'resourceType'])
  assert.equal(claims[ClaimConsent.subject], T.subjectReference)
  assert.equal(claims[ClaimConsent.grantor], T.controllerReference)
  assert.equal(claims[ClaimConsent.grantee], T.insurerReference)
  assert.equal(claims[ClaimConsent.provisionCode], T.clinicalCodeList)
  assert.equal(claims[ClaimConsent.dataPeriodStart], T.dataPeriodStart)
  assert.equal(claims[ClaimConsent.dataPeriodEnd], T.dataPeriodEnd)
  assert.equal(claims[ClaimConsent.attachmentContentType], AnimalInsuranceConsentVocabulary.MediaType)
  assert.equal(policy.assigner, T.controllerReference)
  assert.equal(policy.assignee, T.insurerReference)
  assert.equal(policy.permission[0].target, AnimalInsuranceConsentVocabulary.EligibilitySummaryTarget)
  assert.equal(policy.permission.length, input.facts.length)
})

test('exports the validated claims and ODRL source to native FHIR R4 or R5 only on request', () => {
  const consent = buildAnimalInsuranceEligibilityConsent(input)
  const r4 = projectAnimalInsuranceConsentToFhirR4(consent)
  const r5 = projectAnimalInsuranceConsentToFhirR5(consent)

  assert.equal(r4.resourceType, T.fhirConsentResourceType)
  assert.equal(r4.sourceAttachment.contentType, AnimalInsuranceConsentVocabulary.MediaType)
  assert.equal(r4.provision.dataPeriod.start, T.dataPeriodStart)
  assert.equal(r5.resourceType, T.fhirConsentResourceType)
  assert.equal(r5.sourceAttachment[0].contentType, AnimalInsuranceConsentVocabulary.MediaType)
  assert.equal(r5.decision, T.decision)
  assert.equal(r5.controller[0].reference, T.enforcerReference)
})

test('fails closed when ODRL and canonical Consent claims diverge', () => {
  const consent = buildAnimalInsuranceEligibilityConsent(input)
  const divergent = {
    ...consent,
    meta: { claims: { ...consent.meta.claims, [ClaimConsent.grantee]: T.divergentInsurerReference } },
  }

  const divergenceError = new RegExp(AnimalInsuranceConsentErrors.OdrlClaimsDiverge)
  assert.throws(() => validateAnimalInsuranceConsentOdrlParity(divergent), divergenceError)
  assert.throws(() => projectAnimalInsuranceConsentToFhirR5(divergent), divergenceError)
})

test('rejects research-purpose insurance access and keeps fact aggregation semantics ODRL-only', () => {
  assert.throws(
    () => buildAnimalInsuranceEligibilityConsent({ ...input, purpose: T.forbiddenPurpose }),
    new RegExp(AnimalInsuranceConsentErrors.ResearchForbidden),
  )

  const consent = buildAnimalInsuranceEligibilityConsent(input)
  const r5 = projectAnimalInsuranceConsentToFhirR5(consent)
  assert.equal(JSON.stringify(r5).includes(T.factKind), false)
})
