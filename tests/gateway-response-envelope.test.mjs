// Flow contract: preserve exact operational envelope wire values, one public identity, and distinct entry/search discriminators.
import assert from 'node:assert/strict'
import test from 'node:test'
import * as root from '../dist/index.js'
import * as leaf from '../dist/gateway-response-contract.js'

test('operational response envelopes preserve the existing three wire values', () => {
  assert.deepEqual(leaf.GatewayEnvelopeTypes, {
    BatchResponse: 'batch-response',
    MessagingResponse: 'messaging-response',
    TransactionResponse: 'transaction-response',
  })
  assert.equal(Object.isFrozen(leaf.GatewayEnvelopeTypes), true)
})

test('root and response-contract entry expose the same envelope catalog', () => {
  assert.ok(leaf.GatewayEnvelopeTypes, 'operational response envelope catalog must be exported')
  assert.equal(root.GatewayEnvelopeTypes, leaf.GatewayEnvelopeTypes)
})

test('response entries and search envelopes retain their distinct wire profiles', () => {
  assert.equal(leaf.GatewayResponseEntryTypes.MessagingResponse, 'MessagingResponse-v1.0')
  assert.equal(leaf.GatewaySearchBundleTypes.SearchResponse, 'search-response')
})
