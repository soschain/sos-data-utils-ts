// Flow contract: evaluate the reviewed activation credential bindings without converting a professional occupation into controller authority; legal representation, controller role, key material and organization service permissions remain separate dimensions.
import assert from 'node:assert/strict'
import test from 'node:test'
import { REPOSITORY_SAFE_EXAMPLES as e } from '../dist/repository-privacy.js'
import { HealthcareActorRoles } from '../dist/healthcare-roles.js'
import { ServiceCapability } from '../dist/service-capabilities.js'
import { validateActivationRepresentativePolicy, validateActivationServiceAuthorizationPolicy, extractOrganizationControllerRoleCodes, extractOrganizationControllerOccupationCodes, extractRepresentativeCredentialBinding } from '../dist/activation-policy.js'
import { parseServiceTypeClaims } from '../dist/service-claim-parsing.js'

const organization = { credentialSubject: { taxID: e.organizationBusinessNumber } }
const representative = { credentialSubject: { id: e.didWeb, memberOf: { taxID: e.organizationBusinessNumber }, hasOccupation: { occupationalCategory: HealthcareActorRoles.GeneralistMedicalPractitioner } } }
const controller = { credentialSubject: { provider: { taxID: e.organizationBusinessNumber }, owner: { additionalType: HealthcareActorRoles.Controller, hasOccupation: { occupationalCategory: HealthcareActorRoles.GeneralistMedicalPractitioner }, hasCredential: { material: e.resourceUuid } } } }
const codes = input => validateActivationRepresentativePolicy(input).map(error => error.code)

test('validates the modern representative and independent controller credential dimensions', () => {
  assert.deepEqual(codes({ organizationCredential: organization, representativeCredential: representative, controllerCredential: controller }), [])
  assert.deepEqual(extractOrganizationControllerRoleCodes(controller), [HealthcareActorRoles.Controller])
  assert.deepEqual(extractOrganizationControllerOccupationCodes(controller), [HealthcareActorRoles.GeneralistMedicalPractitioner])
})
test('validates a controller without requiring a second representative credential', () => {
  assert.deepEqual(codes({ organizationCredential: organization, controllerCredential: controller }), [])
})
test('does not infer controller authority from an occupation or a representative credential', () => {
  const missingAuthority = structuredClone(controller)
  delete missingAuthority.credentialSubject.owner.additionalType
  assert.ok(codes({ organizationCredential: organization, controllerCredential: missingAuthority }).includes('MISSING_CONTROLLER_ROLE_RESPRSN'))
  const errors = codes({ organizationCredential: organization, representativeCredential: representative })
  assert.ok(errors.includes('MISSING_REPRESENTATIVE_ROLE_RESPRSN'))
  assert.ok(errors.includes('MISSING_REPRESENTATIVE_CREDENTIAL_BINDING'))
})
test('requires controller key material and the matching organization identifier', () => {
  const changed = structuredClone(controller)
  changed.credentialSubject.provider.taxID += '-different'
  delete changed.credentialSubject.owner.hasCredential
  const errors = codes({ organizationCredential: organization, controllerCredential: changed })
  assert.ok(errors.includes('CONTROLLER_TAXID_MISMATCH'))
  assert.ok(errors.includes('MISSING_CONTROLLER_CREDENTIAL_BINDING'))
})
test('retains only the explicit legacy representative role plus key-binding combination', () => {
  const legacy = structuredClone(representative)
  legacy.credentialSubject.hasOccupation = { identifier: HealthcareActorRoles.Controller }
  legacy.credentialSubject.hasCredential = { identifier: { value: e.resourceUuid } }
  assert.deepEqual(codes({ organizationCredential: organization, representativeCredential: legacy }), [])
  assert.equal(extractRepresentativeCredentialBinding(legacy), e.resourceUuid)
  delete legacy.credentialSubject.id
  assert.ok(codes({ organizationCredential: organization, representativeCredential: legacy }).includes('MISSING_REPRESENTATIVE_SUBJECT_ID'))
})
test('rejects a representative bound to another organization independently of controller validity', () => {
  const changed = structuredClone(representative)
  changed.credentialSubject.memberOf.taxID += '-different'
  assert.ok(codes({ organizationCredential: organization, representativeCredential: changed, controllerCredential: controller }).includes('REPRESENTATIVE_TAXID_MISMATCH'))
})
test('permits the configured wildcard category only with an authorized service capability', () => {
  const credential = { credentialSubject: { makesOffer: { category: '*', serviceType: [ServiceCapability.IndexProvider] } } }
  assert.deepEqual(validateActivationServiceAuthorizationPolicy({ organizationCredential: credential, requiredCategory: e.sector, requiredServiceTypes: [ServiceCapability.IndexProvider] }), [])
  assert.ok(validateActivationServiceAuthorizationPolicy({ organizationCredential: credential, requiredCategory: e.sector, requiredServiceTypes: [ServiceCapability.DigitalTwinProvider] }).some(error => error.code === 'UNAUTHORIZED_ORGANIZATION_SERVICE_TYPE'))
})
test('does not reinterpret additional organization-role metadata as a service capability', () => {
  assert.deepEqual(parseServiceTypeClaims(ServiceCapability.IndexReader, HealthcareActorRoles.Controller), [ServiceCapability.IndexReader])
})
