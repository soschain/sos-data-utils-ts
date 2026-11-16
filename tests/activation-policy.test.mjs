// Flow contract: reuse shared test fixtures and canonical types; do not introduce duplicated literals.
import assert from 'node:assert/strict'
import test from 'node:test'
import {REPOSITORY_SAFE_EXAMPLES as examples} from '../dist/repository-privacy.js'
import {
  normalizeLegalOrganizationIdentifier,
  legalOrganizationIdentifiersMatch,
  extractRepresentativeCredentialBinding,
  extractOrganizationControllerRoleCodes,
  validateActivationServiceAuthorizationPolicy,
} from '../dist/activation-policy.js'
import {ServiceCapability} from '../dist/service-capabilities.js'

test('normalizes identifier type without losing punctuation in the legal value',()=>{
  const value=`${examples.organizationBusinessNumber}-x`
  assert.deepEqual(normalizeLegalOrganizationIdentifier({type:examples.organizationIdentifierType.toLowerCase(),value}),
    {type:examples.organizationIdentifierType,value:value.toUpperCase()})
  assert.equal(legalOrganizationIdentifiersMatch({type:examples.organizationIdentifierType,value},
    {type:examples.organizationIdentifierType,value:value.replace('-','')}),false)
})
test('extracts the credential key-material binding without granting authority',()=>{
  assert.equal(extractRepresentativeCredentialBinding({credentialSubject:{hasCredential:{material:examples.resourceUuid}}}),examples.resourceUuid)
  assert.equal(extractRepresentativeCredentialBinding({credentialSubject:{}}),undefined)
})
test('does not turn an occupation into controller authority',()=>{
  // These occupation/authority wire codes are the policy distinction under test.
  assert.deepEqual(extractOrganizationControllerRoleCodes({credentialSubject:{owner:{hasOccupation:{identifier:{system:'ISCO-08',value:'1120'}}}}}),[])
})
test('rejects a requested service category absent from the ICA credential',()=>{
  const errors=validateActivationServiceAuthorizationPolicy({
    organizationCredential:{credentialSubject:{category:examples.sector,serviceType:ServiceCapability.IndexProvider}},
    requiredCategory:`${examples.sector}-not-authorized`,
    requiredServiceTypes:[ServiceCapability.IndexProvider],
  })
  assert.ok(errors.some(error=>error.code==='UNAUTHORIZED_ORGANIZATION_SERVICE_CATEGORY'))
})
