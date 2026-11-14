// Flow contract: normalize persisted/legacy capability advertisements without granting authority; retain extensions and deterministic CSV ordering.
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ServiceCapability, ServiceCapabilityKind, ServiceCapabilityToken,
  DeprecatedServiceCapabilityToken, normalizeServiceCapability,
  parseServiceCapabilityTokens, serializeServiceCapabilityTokens,
  mergeServiceCapabilityClaims, isKnownServiceCapability,
  getServiceCapabilityKind, hasServiceCapabilityKind, isProviderServiceCapability,
} from '../dist/service-capabilities.js'
import { ContinuityServiceCapability } from '../dist/continuity-service-capabilities.js'

test('canonicalizes all persisted legacy capabilities without changing canonical wire values', () => {
  for (const key of Object.keys(ServiceCapability)) {
    const canonical = ServiceCapability[key]
    const legacy = DeprecatedServiceCapabilityToken[key]
    for (const value of [canonical, legacy, `  ${canonical.toUpperCase()}  `, legacy.toUpperCase()]) {
      assert.equal(normalizeServiceCapability(value), canonical)
      assert.equal(isKnownServiceCapability(value), true)
    }
  }
  assert.equal(ServiceCapabilityToken.IndexingReadSearch, ServiceCapability.IndexReader)
  assert.equal(ServiceCapabilityToken.LegacyIndexProvider, DeprecatedServiceCapabilityToken.IndexProvider)
  for (const value of [undefined, null, '', '  ']) {
    assert.equal(normalizeServiceCapability(value), undefined)
    assert.equal(isKnownServiceCapability(value), false)
  }
})

test('deduplicates canonicalized tokens while preserving extension capabilities and their order', () => {
  const extension = ContinuityServiceCapability.DocumentBackupProvider
  const csv = ` ${DeprecatedServiceCapabilityToken.IndexProvider},${extension},${ServiceCapability.IndexProvider},,${ServiceCapability.DigitalTwinReader}`
  const expected = [ServiceCapability.IndexProvider, extension, ServiceCapability.DigitalTwinReader]
  assert.deepEqual(parseServiceCapabilityTokens(csv), expected)
  assert.equal(mergeServiceCapabilityClaims(csv, extension), expected.join(','))
  assert.equal(serializeServiceCapabilityTokens([null, ...expected, undefined, expected[0]]), expected.join(','))
  assert.equal(isKnownServiceCapability(extension), false)
  assert.deepEqual(parseServiceCapabilityTokens(undefined), [])
  assert.equal(serializeServiceCapabilityTokens([undefined, null, '']), undefined)
  assert.equal(mergeServiceCapabilityClaims(null, ''), undefined)
})

test('classifies families independently from provider recognition and authorization', () => {
  assert.equal(getServiceCapabilityKind(DeprecatedServiceCapabilityToken.IndexReader), ServiceCapabilityKind.Indexing)
  assert.equal(hasServiceCapabilityKind(ServiceCapability.IndexReader, ServiceCapabilityKind.Indexing.toUpperCase()), true)
  assert.equal(hasServiceCapabilityKind(ServiceCapability.IndexReader, ServiceCapabilityKind.DigitalTwin), false)
  assert.equal(hasServiceCapabilityKind(ServiceCapability.IndexReader, ''), false)
  const unknownOperation = `${ServiceCapabilityKind.Indexing}.unknown`
  assert.equal(hasServiceCapabilityKind(unknownOperation, ServiceCapabilityKind.Indexing), true)
  assert.equal(isKnownServiceCapability(unknownOperation), false)
  assert.equal(isProviderServiceCapability(unknownOperation), false)
  for (const value of [ServiceCapability.IndexReader, ServiceCapability.DigitalTwinReader, '__proto__', 'constructor', undefined, null]) {
    assert.equal(isProviderServiceCapability(value), false)
  }
  for (const value of [ServiceCapability.OrganizationRegistryProvider, ServiceCapability.IndexProvider, DeprecatedServiceCapabilityToken.DigitalTwinProvider]) {
    assert.equal(isProviderServiceCapability(value), true)
  }
})

test('preserves unrecognized extension tokens without prototype lookup or input mutation', () => {
  const input = ['__proto__', 'constructor', 'toString', ' CustomExtension ']
  assert.deepEqual(parseServiceCapabilityTokens(input.join(',')), ['__proto__', 'constructor', 'toString', 'CustomExtension'])
  for (const value of input) assert.equal(isKnownServiceCapability(value), false)
  assert.equal(serializeServiceCapabilityTokens(input), '__proto__,constructor,toString,CustomExtension')
  assert.deepEqual(input, ['__proto__', 'constructor', 'toString', ' CustomExtension '])
})
