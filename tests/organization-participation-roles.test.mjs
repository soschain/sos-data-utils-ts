// Flow contract: independent immutable SOS application/PDF catalogs preserve exact external form names and participation-role wire values; no authority, transport, signing or adapter behavior is inferred.
import assert from 'node:assert/strict'
import test from 'node:test'
import {execFileSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'
const {OrganizationParticipationRoles:roles}=await import('../dist/organization-participation-roles.js').catch(error=>{if(error.code==='ERR_MODULE_NOT_FOUND')return {};throw error})
const expected={
  "IndividualIndexServiceProvider": "individual-index-service-provider",
  "IndividualIndexDataProvider": "individual-index-data-provider",
  "IndividualIndexDataConsumer": "individual-index-data-consumer",
  "IndividualPersonalBackupServiceProvider": "individual-personal-backup-service-provider",
  "DigitalTwinIndexServiceProvider": "digital-twin-index-service-provider",
  "DigitalTwinDataProvider": "digital-twin-data-provider",
  "DigitalTwinDataConsumer": "digital-twin-data-consumer"
}
test('preserves all7 exact participation roles independently of provider/read capability claims',()=>{execFileSync(process.execPath,[fileURLToPath(new URL('../node_modules/typescript/bin/tsc',import.meta.url)),'--noEmit','--strict','--skipLibCheck','--module','NodeNext','--moduleResolution','NodeNext','--target','ES2022',fileURLToPath(new URL('./fixtures/organization-participation-roles-consumer.ts',import.meta.url))],{stdio:'pipe'});assert.ok(roles&&typeof roles==='object','missing owned participation-role catalog');assert.deepEqual(roles,expected);assert.equal(new Set(Object.values(roles)).size,7);assert.notEqual(roles.IndividualIndexServiceProvider,roles.IndividualIndexDataProvider);assert.notEqual(roles.DigitalTwinIndexServiceProvider,roles.DigitalTwinDataProvider)})
test('catalog is immutable and backup role remains an explicit application opt-in',()=>{assert.ok(roles&&typeof roles==='object','missing owned participation-role catalog');assert.ok(Object.isFrozen(roles));assert.throws(()=>{roles.IndividualPersonalBackupServiceProvider='document-backup-provider'});assert.equal(Object.values(roles).includes('document-backup-provider'),false)})
