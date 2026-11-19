// Flow contract: shared typed fixtures retain independently recorded wire bytes and distinguish asserted local labels from missing English/language evidence; they grant no authority.
import assert from 'node:assert/strict';
import test from 'node:test';
import {CLINICAL_TERMINOLOGY_LABEL_FIXTURES as labels} from '../dist/clinical-terminology-test-fixtures.js';
import {LICENSE_STATUS_WIRE_GOLDEN} from '../dist/organization-role-license-examples.js';
import {LicenseStatuses} from '../dist/device-license-contract.js';
import {HOSTED_ORGANIZATION_DID_VECTORS,HOSTED_PROFESSIONAL_DID_VECTORS,HOSTED_MEMBER_DID_VECTORS,HOSTED_MEMBER_IDENTITY_GOLDENS} from '../dist/hosted-did-test-fixtures.js';
import {buildOrganizationDidWeb,buildProfessionalDidWeb,buildIndividualMemberDidWebFromPrivateIdentifiers,parseIndividualMemberDidWeb} from '../dist/hosted-did.js';

test('raw localized text has no invented language or English label',()=>{
 assert.equal(labels.rawSpanish.labels,undefined);
 assert.equal(labels.rawSpanish.expected.display,labels.coding.code);
 assert.equal(labels.rawSpanish.expected.text,labels.spanishText);
 assert.equal(labels.rawSpanish.expected.language,undefined);
});
test('English fallback is distinct from the requested Spanish locale',()=>{
 assert.equal(labels.englishFallback.labels.textLanguage,labels.languages.english);
 assert.equal(labels.englishFallback.expected.language,labels.languages.english);
 assert.notEqual(labels.englishFallback.expected.language,labels.languages.spanish);
});
test('bilingual fixtures keep asserted local text and English display separate',()=>{
 assert.equal(labels.bilingual.labels.textLanguage,labels.languages.spanish);
 assert.equal(labels.bilingual.labels.displayLanguage,labels.languages.english);
 assert.notEqual(labels.bilingual.expected.text,labels.bilingual.expected.display);
});
test('an explicitly non-English display retains code fallback and local text',()=>{
 assert.equal(labels.nonEnglishDisplay.labels.displayLanguage,labels.languages.spanish);
 assert.equal(labels.nonEnglishDisplay.expected.display,labels.coding.code);
 assert.equal(labels.nonEnglishDisplay.expected.text,labels.spanishText);
});
test('license lifecycle constants retain the independently recorded wire contract',()=>assert.deepEqual(LicenseStatuses,LICENSE_STATUS_WIRE_GOLDEN));
for(const vector of HOSTED_ORGANIZATION_DID_VECTORS)test('organization fixture: '+vector.name,()=>assert.equal(buildOrganizationDidWeb(vector.input),vector.expected));
for(const vector of HOSTED_PROFESSIONAL_DID_VECTORS)test('professional fixture: '+vector.name,()=>assert.equal(buildProfessionalDidWeb(vector.input),vector.expected));
for(const vector of HOSTED_MEMBER_DID_VECTORS)test('member fixture: '+vector.name,()=>{
 const did=buildIndividualMemberDidWebFromPrivateIdentifiers(vector.input);
 assert.deepEqual(Buffer.from(did),Buffer.from(vector.expected));
 assert.equal(parseIndividualMemberDidWeb(did).individualDidWeb,HOSTED_MEMBER_IDENTITY_GOLDENS.authorizedSubjectDid);
});
