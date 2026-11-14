// Flow contract: neutral record identity is owned by Antifraud while SOS retains its public confidential-storage import path.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('imports neutral record identity rather than maintaining a second identifier contract', () => {
  const source = readFileSync(new URL('../src/confidential-storage.ts', import.meta.url), 'utf8')
  assert.match(source, /from ['"]antifraud-data-utils-ts\/vault-repository['"]/u)
  assert.doesNotMatch(source, /export interface RecordBase\s*\{\s*id:/u)
})
