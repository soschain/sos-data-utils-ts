// Flow contract: owned operational collection IDs and FHIR/IPS fan-out maps preserve every historical wire entry without defining a FHIR standard or granting storage/subject authority; public consumers share frozen values and reject unsupported mutations.
import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const fixture=()=>JSON.parse(readFileSync(new URL('./fixtures/gateway-data-collections-wire.json',import.meta.url),'utf8'));
const owner=()=>import('../dist/gateway-data-collections.js');

test('all eighteen logical collection IDs retain exact wire values and one frozen public identity',async()=>{
 const leaf=await owner(),root=await import('../dist/index.js');
 assert.deepEqual(leaf.DataCollectionIds,fixture().tables.DataCollectionIds);
 assert.equal(Object.keys(leaf.DataCollectionIds).length,18);
 assert.equal(Object.isFrozen(leaf.DataCollectionIds),true);
 assert.equal(root.DataCollectionIds,leaf.DataCollectionIds);
 assert.throws(()=>{leaf.DataCollectionIds.medications='synthetic-other-collection'},TypeError);
});

test('all fifteen canonical FHIR resource-family mappings retain the operational storage taxonomy',async()=>{
 const leaf=await owner(),fhir=await import('fhir-data-utils-ts');
 assert.deepEqual(leaf.FhirResourceTypeDataCollections,fixture().tables.FhirResourceTypeDataCollections);
 assert.equal(Object.keys(leaf.FhirResourceTypeDataCollections).length,15);
 assert.equal(Object.isFrozen(leaf.FhirResourceTypeDataCollections),true);
 for(const resourceType of Object.keys(leaf.FhirResourceTypeDataCollections))assert.ok(Object.values(fhir.ResourceTypesFhirR4).includes(resourceType));
 assert.equal(leaf.FhirResourceTypeDataCollections[fhir.ResourceTypesFhirR4.MedicationStatement],leaf.DataCollectionIds.medications);
 assert.equal(leaf.FhirResourceTypeDataCollections[fhir.ResourceTypesFhirR4.Communication],undefined);
 assert.equal(leaf.FhirResourceTypeDataCollections['synthetic-unregistered-resource'],undefined);
 assert.equal((await import('../dist/index.js')).FhirResourceTypeDataCollections,leaf.FhirResourceTypeDataCollections);
});

test('all sixteen permission-summary fan-out mappings remain deeply frozen and distinct from URI section tokens',async()=>{
 const leaf=await owner(),sections=await import('../dist/healthcare-sections.js');
 assert.deepEqual(leaf.HealthcareSummarySectionDataCollections,fixture().tables.HealthcareSummarySectionDataCollections);
 assert.equal(Object.keys(leaf.HealthcareSummarySectionDataCollections).length,16);
 assert.equal(Object.isFrozen(leaf.HealthcareSummarySectionDataCollections),true);
 for(const values of Object.values(leaf.HealthcareSummarySectionDataCollections)){assert.equal(Object.isFrozen(values),true);for(const value of values)assert.ok(Object.values(leaf.DataCollectionIds).includes(value))}
 const results=sections.HealthcarePermissionSummarySections.Results.attributeValue;
 assert.deepEqual(leaf.HealthcareSummarySectionDataCollections[results],[leaf.DataCollectionIds.observations,leaf.DataCollectionIds.diagnosticReports]);
 assert.throws(()=>leaf.HealthcareSummarySectionDataCollections[results].push('synthetic-other-collection'),TypeError);
 assert.equal(leaf.HealthcareSummarySectionDataCollections[sections.HealthcareSummarySections.Results.attributeValue],undefined);
 assert.equal(leaf.HealthcareSummarySectionDataCollections['LOINC|synthetic-unknown'],undefined);
 assert.equal((await import('../dist/index.js')).HealthcareSummarySectionDataCollections,leaf.HealthcareSummarySectionDataCollections);
});

test('public typed collection consumers retain literal IDs and readonly fan-out results',()=>{
 const result=spawnSync(process.execPath,[fileURLToPath(new URL('../node_modules/typescript/bin/tsc',import.meta.url)),
 '--noEmit','--strict','--skipLibCheck','--module','NodeNext','--moduleResolution','NodeNext','--target','ES2022',
 fileURLToPath(new URL('./fixtures/gateway-data-collections-consumer.ts',import.meta.url))],{encoding:'utf8'});
 assert.equal(result.error,undefined);
 assert.equal(result.status,0,result.stdout+result.stderr);
});
