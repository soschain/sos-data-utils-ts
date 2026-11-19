// Flow contract: preserve licence issue wire and role-family routing without granting consent, employment or member authority.
import assert from 'node:assert/strict'
import test from 'node:test'
import {execFileSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'
import * as contract from '../dist/license-commercial-contract.js'
import {DeviceUserClasses,DeviceAppTypes} from '../dist/device-license-contract.js'
import {HealthcareActorRoles} from '../dist/healthcare-roles.js'
import {REPOSITORY_SAFE_EXAMPLES as e} from '../dist/repository-privacy.js'
import {SchemaOrgPersonClaim as Person,SchemaOrgIndividualProductClaim as Product} from 'antifraud-data-utils-ts/schema-org-claims'
import {HL7_CODING_SYSTEM_V3_ROLE_CODE} from 'fhir-data-utils-ts'

const memberRole=`${HL7_CODING_SYSTEM_V3_ROLE_CODE}|${HealthcareActorRoles.Controller}`
const input=()=>({ownerOrganizationId:e.tenantId,subjectDid:e.didWeb,subjectId:e.resourceUuid,relatedPersonId:e.resourceUuid,invitationId:e.resourceUuid,role:memberRole,userClass:DeviceUserClasses.Individual,type:DeviceAppTypes.Web})

test('exports the owned issue and role-family contract',()=>{
 for(const name of ['buildLicenseIssueClaims','buildLicenseIssueEntry','classifyLicenseRole'])assert.equal(typeof contract[name],'function',name)
 assert.deepEqual(contract.LicenseRoleKinds,{IndividualMember:'individual-member',Professional:'professional',Unsupported:'unsupported'})
 assert.ok(Object.isFrozen(contract.LicenseRoleKinds))
})

test('constructs exact issue wire for email, phone and both with separate subject metadata',()=>{
 for(const contact of [{email:e.firstContactEmail},{telephone:e.phoneE164},{email:e.firstContactEmail,telephone:e.phoneE164}]){
  const value={...input(),...contact},before=structuredClone(value)
  assert.deepEqual(contract.buildLicenseIssueEntry(value),{
   type:'License-issue-request-v1.0',request:{method:'POST'},
   meta:{ownerOrganizationId:e.tenantId,subjectDid:e.didWeb,subjectId:e.resourceUuid,relatedPersonId:e.resourceUuid,invitationId:e.resourceUuid},
   resource:{meta:{claims:{'@context':'org.schema',...(contact.email?{[Person.Email]:contact.email}:{}),...(contact.telephone?{[Person.Telephone]:contact.telephone}:{}),[Person.OccupationIdentifierValue]:memberRole,[Product.Category]:'individual',[Product.AdditionalType]:'web','@type':'IndividualProduct:Issue'}}},
  })
  assert.deepEqual(value,before)
 }
})

test('explicit issue fields override conflicting additional claims without treating claims as metadata',()=>{
 const additionalClaims={[Person.Email]:e.individualEmail,[Person.Telephone]:e.phoneE164,[Person.OccupationIdentifierValue]:'unsupported',[Product.Category]:'professional',[Product.AdditionalType]:'mobile','@type':'other',preserved:e.resourceUuid,ownerOrganizationId:e.resourceUuid}
 const value={...input(),email:` ${e.firstContactEmail} `,telephone:` ${e.phoneE164} `,additionalClaims},before=structuredClone(value)
 const entry=contract.buildLicenseIssueEntry(value),claims=entry.resource.meta.claims
 assert.equal(claims[Person.Email],e.firstContactEmail);assert.equal(claims[Person.Telephone],e.phoneE164)
 assert.equal(claims[Person.OccupationIdentifierValue],memberRole);assert.equal(claims[Product.Category],'individual');assert.equal(claims[Product.AdditionalType],'web');assert.equal(claims['@type'],'IndividualProduct:Issue')
 assert.equal(claims.preserved,e.resourceUuid);assert.equal(entry.meta.ownerOrganizationId,e.tenantId);assert.equal(claims.ownerOrganizationId,e.resourceUuid)
 assert.deepEqual(value,before)
})

test('retains professional defaults and omits absent lifecycle metadata',()=>{
 const entry=contract.buildLicenseIssueEntry({email:e.firstContactEmail,role:HealthcareActorRoles.GeneralistMedicalPractitioner})
 assert.deepEqual(entry.meta,{})
 assert.equal(entry.resource.meta.claims[Product.Category],'professional');assert.equal(entry.resource.meta.claims[Product.AdditionalType],'mobile')
})

test('rejects missing recipient, invalid international phone and incompatible member role',()=>{
 assert.throws(()=>contract.buildLicenseIssueEntry(input()),/email or telephone/)
 assert.throws(()=>contract.buildLicenseIssueEntry({...input(),telephone:'invalid'}),/international/)
 assert.throws(()=>contract.buildLicenseIssueEntry({...input(),email:e.firstContactEmail,role:HealthcareActorRoles.GeneralistMedicalPractitioner}),/professional roles do not consume/)
 assert.throws(()=>contract.buildLicenseIssueEntry({...input(),email:e.firstContactEmail,role:'unknown|value'}),/FHIR v3-RoleCode/)
})

test('classifies namespace aliases without implying membership in a role catalog',()=>{
 for(const system of ['isco','isco-08','org.ilo.isco','org.ilo.isco-08',`${e.httpsBaseUrl}/isco-08`])assert.equal(contract.classifyLicenseRole(` ${system.toUpperCase()}|not-a-catalog-code `),'professional')
 for(const system of ['v3-rolecode','org.hl7.v3.rolecode',HL7_CODING_SYSTEM_V3_ROLE_CODE])assert.equal(contract.classifyLicenseRole(`${system}|not-a-catalog-code`),'individual-member')
 for(const value of ['',undefined,null,'RESPRSN','unknown|2211'])assert.equal(contract.classifyLicenseRole(value),'unsupported')
})

test('root and subpath typed consumers preserve issue metadata and reject invalid contract fields',()=>{
 assert.equal(typeof contract.buildLicenseIssueEntry,'function')
 execFileSync(process.execPath,[fileURLToPath(new URL('../node_modules/typescript/bin/tsc',import.meta.url)),'--noEmit','--strict','--exactOptionalPropertyTypes','--skipLibCheck','--target','ES2022','--module','NodeNext','--moduleResolution','NodeNext',fileURLToPath(new URL('./fixtures/license-issue-contract-consumer.ts',import.meta.url))],{stdio:'pipe'})
})
