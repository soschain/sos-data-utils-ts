// Flow contract: independent immutable SOS application/PDF catalogs preserve exact external form names and participation-role wire values; no authority, transport, signing or adapter behavior is inferred.
import assert from 'node:assert/strict'
import test from 'node:test'
import {execFileSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'
const {TEST_NETWORK_ORGANIZATION_REGISTRATION_PDF_FIELDS:fields}=await import('../dist/test-network-organization-registration-form.js').catch(error=>{if(error.code==='ERR_MODULE_NOT_FOUND')return {};throw error})
const expected=[
  "Identification number",
  "I confirm that I am duly authorized by the organization to submit this application",
  "The legal representative and the technical controller of the service are the same person",
  "hostServiceCountry",
  "hostServiceLegalName",
  "hostServiceTaxId",
  "hostServiceUrl",
  "organizationLegalName",
  "organizationName",
  "organizationAddressCountry",
  "organizationAddressRegion",
  "organizationOfficialLicense",
  "organizationAddressPostalCode",
  "organizationAddressLine",
  "organizationAddressCity",
  "organizationContactUrl",
  "organizationContactEmail",
  "organizationContactPhone",
  "representativeContactEmail",
  "representativeFullName",
  "representativeIdentifierValue",
  "representativeIdentifierCountry",
  "representativeIdentifierRegion",
  "controllerContactPhone",
  "controllerFullName",
  "controllerContactEmail",
  "controllerIdentifierValue",
  "controllerIdentifierCountry",
  "controllerIdentifierRegion",
  "representativeContactPhone",
  "organizationServiceCategory",
  "representativeIdentifierType",
  "controllerIdentifierType",
  "representativeSelfDeclaration",
  "representativeIsController",
  "docVersion",
  "signDate",
  "organizationIndexProvider",
  "organizationResearchProvider",
  "organizationIdentifierType",
  "controllerKeyCommitment"
]
test('preserves all41 AcroForm field names in exact deterministic order',()=>{execFileSync(process.execPath,[fileURLToPath(new URL('../node_modules/typescript/bin/tsc',import.meta.url)),'--noEmit','--strict','--skipLibCheck','--module','NodeNext','--moduleResolution','NodeNext','--target','ES2022',fileURLToPath(new URL('./fixtures/registration-pdf-contract-consumer.ts',import.meta.url))],{stdio:'pipe'});assert.ok(Array.isArray(fields),'missing owned PDF field catalog');assert.deepEqual(fields,expected);assert.equal(fields.length,41);assert.equal(new Set(fields).size,41)})
test('field catalog is immutable and does not conflate representative/controller metadata',()=>{assert.ok(Array.isArray(fields),'missing owned PDF field catalog');assert.ok(Object.isFrozen(fields));assert.throws(()=>fields.push('unapproved'));assert.ok(fields.includes('representativeIdentifierValue'));assert.ok(fields.includes('controllerIdentifierValue'));assert.ok(fields.includes('docVersion'));assert.ok(fields.includes('controllerKeyCommitment'));assert.ok(!fields.includes('organizationPersonalBackupProvider'))})
