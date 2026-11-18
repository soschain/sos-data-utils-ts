// Flow contract: committed manifest and lock agree on one exact registry FHIR release; an explicitly verified temporary local candidate does not rewrite that registry pin.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('pins one exact registry FHIR release consistently in manifest and lock', async () => {
  const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
  const lock = JSON.parse(await readFile(new URL('../package-lock.json', import.meta.url), 'utf8'))
  const installed = JSON.parse(
    await readFile(new URL('../node_modules/fhir-data-utils-ts/package.json', import.meta.url), 'utf8'),
  )

  assert.equal(installed.name, 'fhir-data-utils-ts')
  const version = manifest.dependencies['fhir-data-utils-ts']
  assert.match(version, /^\d+\.\d+\.\d+$/u)
  assert.equal(lock.packages[''].dependencies['fhir-data-utils-ts'], version)
  const pinned = lock.packages['node_modules/fhir-data-utils-ts']
  assert.equal(pinned.version, version)
  const registry = new URL(pinned.resolved)
  assert.equal(registry.protocol, 'https:')
  assert.equal(registry.hostname, 'registry.npmjs.org')
  assert.equal(registry.pathname, `/fhir-data-utils-ts/-/fhir-data-utils-ts-${version}.tgz`)
  for (const field of ['username', 'password', 'port', 'search', 'hash']) assert.equal(registry[field], '')
  assert.match(pinned.integrity, /^sha512-[A-Za-z0-9+/]{86}==$/u)
})
