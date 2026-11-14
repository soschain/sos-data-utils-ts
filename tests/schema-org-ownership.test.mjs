// Flow contract: SOS preserves its exact public claim selection while Antifraud owns the neutral Schema.org vocabulary.
import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import * as claims from '../dist/schema-org-claims.js'

test('preserves existing serialized claim objects, field ordering and finite selection surfaces', () => {
  // Recorded from the public SOS contract before moving neutral vocabulary ownership.
  const baseline = {
    SchemaOrgOrganizationClaim: '1858a7c11a67bfccc1acb9349eb7bb6096df7908e3f1dcb0d0612ae226df621e',
    SchemaOrgPersonClaim: '1e96d9c265b57586d64a127c013629225f2b728ef48f668cf43e43fb5cc1330b',
    SchemaOrgActionClaim: '50dfa5554ec7d6c2d7a58172597f86bf133209dbd4e47d267f6701ed4061b1b9',
  }
  for (const [name, sha256] of Object.entries(baseline)) {
    assert.equal(createHash('sha256').update(JSON.stringify(claims[name])).digest('hex'), sha256, name)
    assert.equal(Object.isFrozen(claims[name]), true)
  }
})

test('imports neutral claim identities from Antifraud rather than duplicating its wire catalog', () => {
  const source = readFileSync(new URL('../src/schema-org-claims.ts', import.meta.url), 'utf8')
  assert.match(source, /from ['"]antifraud-data-utils-ts\/schema-org-claims['"]/u)
  assert.doesNotMatch(source, /['"]org\.schema\./u)
})
