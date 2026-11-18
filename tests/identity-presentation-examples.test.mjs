// Flow contract: independent consumers obtain fresh deterministic identity presentation examples only from governed synthetic values; fixture assembly never asserts signature verification or controller/professional authority.
import assert from 'node:assert/strict'
import test from 'node:test'
import { REPOSITORY_SAFE_EXAMPLES as e } from '../dist/repository-privacy.js'
import { createIdentityPresentationExample } from '../dist/identity-presentation-examples.js'

test('returns deterministic fresh examples without sharing mutable credential state', () => {
  const first = createIdentityPresentationExample()
  const second = createIdentityPresentationExample()
  assert.deepEqual(first, second)
  assert.equal(first.professionalInput.clientId, e.resourceUuid)
  assert.equal(first.subjectDid.startsWith(`${e.didWeb}:`), true)
  assert.equal(first.professionalVpToken.split('.')[2], '')
  first.professionalCredential.credentialSubject.id = 'changed'
  assert.notDeepEqual(first.professionalCredential, second.professionalCredential)
})

test('separates canonical employee and personal-member routing identities', () => {
  const example = createIdentityPresentationExample()
  assert.equal(example.professionalInput.actorDid.includes(':employee:'), true)
  assert.equal(example.memberInput.actorDid.includes(':individual:multibase:'), true)
  assert.equal(example.memberInput.actorDid.includes(':member:'), true)
  assert.notEqual(example.memberInput.actorDid, example.professionalInput.actorDid)
  assert.notEqual(example.memberInput.clientId, example.professionalInput.clientId)
})
