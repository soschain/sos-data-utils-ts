// Flow contract: the public directory selects existing sector options in their established order and keeps commercial categories separate from FHIR scheduling codes.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { listOrganizationDirectoryOfferingKinds, listVeterinaryDirectoryServiceTypes, VeterinaryServiceTypes } from '../dist/place-service-directory.js'

test('keeps products available to animal care and preserves offering defaults by sector', () => {
  assert.deepEqual(listOrganizationDirectoryOfferingKinds('animal-care'), ['Service', 'Product'])
  assert.deepEqual(listOrganizationDirectoryOfferingKinds('animal-tech'), ['Service', 'Product'])
  assert.deepEqual(listOrganizationDirectoryOfferingKinds('animal-insurance'), ['Product'])
  assert.deepEqual(listOrganizationDirectoryOfferingKinds('animal-research'), ['Service'])
  assert.deepEqual(listOrganizationDirectoryOfferingKinds('health-care'), ['Service'])
  assert.deepEqual(listOrganizationDirectoryOfferingKinds('constructor'), ['Service'])
})

test('retains the veterinary service tokens selected by sector, including emergency', () => {
  const selections = {
    'animal-care': 'veterinary-consultation preventive-care vaccination diagnostic-imaging surgery emergency dentistry rehabilitation',
    'animal-lab': 'diagnostic-testing pathology microbiology toxicology genetic-testing',
    'animal-research': 'research-study-access research-data-access',
    'animal-breed': 'reproductive-service breeding-management',
    'animal-mobility': 'animal-transport travel-certification',
    'animal-shelter': 'animal-intake animal-welfare adoption',
    'animal-farm': 'herd-health farm-visit',
    'animal-commerce': 'animal-retail animal-transfer',
    'animal-management': 'colony-management animal-registration animal-welfare',
    'animal-tech': 'system-integration data-conversion',
    'public-safety': 'animal-identity-verification emergency-response',
  }
  for (const [sector, expected] of Object.entries(selections)) {
    assert.deepEqual(listVeterinaryDirectoryServiceTypes(sector), expected.split(' '))
  }
  assert.equal(VeterinaryServiceTypes.Emergency, 'emergency')
  assert.deepEqual(listVeterinaryDirectoryServiceTypes('health-care'), [])
  assert.deepEqual(listVeterinaryDirectoryServiceTypes('__proto__'), [])
})
