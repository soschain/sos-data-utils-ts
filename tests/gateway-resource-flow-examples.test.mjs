// Flow contract: synthetic lifecycle, device, Consent and identity examples retain their exact wire structures; records and presentations remain descriptors, while independent builders own identifiers and claims.
import assert from 'node:assert/strict'
import test from 'node:test'
import {REPOSITORY_SAFE_EXAMPLES as SAFE} from '../dist/repository-privacy.js'
import * as shared from '../dist/gateway-flow-examples.js'
import {ClaimInterTenantAccessContract as Contract} from '../dist/inter-tenant-access-contract.js'
import {buildOrganizationAuthorizationUrnCds} from '../dist/organization-authorization-urn.js'
import {buildOrganizationRoleLicenseId} from '../dist/organization-role-license.js'
import {ClaimConsent,RelatedPersonClaim} from 'fhir-data-utils-ts/claims'
import {SchemaOrgOrganizationClaim as Org,SchemaOrgPersonClaim as Person} from 'antifraud-data-utils-ts/schema-org-claims'
const examples=await import('../dist/gateway-resource-flow-examples.js').catch(()=>({}))
test('retains disabled versus purged lifecycle metadata and request types',()=>{
 const disabled=examples.EXAMPLE_INDIVIDUAL_ORGANIZATION_DISABLE_PAYLOAD?.body.data[0]
 assert.equal(disabled?.type,'Family-disable-request-v1.0')
 assert.equal(disabled.request.method,'POST')
 assert.equal(examples.EXAMPLE_TENANT_DISABLE_MESSAGE.expectedSemantics.keepsAuditTrail,true)
 assert.equal(examples.EXAMPLE_RELATED_PERSON_DISABLE_BUNDLE_PAYLOAD.body.entry[0].resource.meta.status,'inactive')
 assert.equal(examples.EXAMPLE_RELATED_PERSON_PURGE_BUNDLE_PAYLOAD.body.entry[0].resource.meta.status,'purged')
 assert.equal(examples.EXAMPLE_RELATED_PERSON_PURGE_BUNDLE_PAYLOAD.body.entry[0].resource.meta.claims[RelatedPersonClaim.Patient],shared.EXAMPLE_SUBJECT_DID)
})
test('uses canonical identity and licence builders without assigning device or research authority',()=>{
 assert.equal(examples.EXAMPLE_EMPLOYEE_DOCTOR_ACTIVE?.email,examples.ExampleEmployeeEmails.SharedProfessional)
 assert.equal(examples.EXAMPLE_ORGANIZATION_ROLE_LICENSE.id,buildOrganizationRoleLicenseId(examples.EXAMPLE_ORGANIZATION_ROLE_LICENSE_IDENTITY))
 assert.equal(examples.EXAMPLE_DEVICE_LICENSE_AVAILABLE.status,'available')
 assert.notEqual(examples.EXAMPLE_PORTAL_INDIVIDUAL_DID,examples.EXAMPLE_ALTERNATE_PORTAL_INDIVIDUAL_DID)
 assert.equal(examples.EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_CREDENTIAL.credentialSubject.id,examples.EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_ID)
 assert.equal(examples.EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_CLAIMS[Contract.consumerOrganization],`${SAFE.didWeb}:research-api`)
 assert.equal(examples.EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_PROVIDER_ORGANIZATION_URN,buildOrganizationAuthorizationUrnCds({jurisdiction:shared.EXAMPLE_JURISDICTION,identifierType:'TAX',identifierValue:shared.EXAMPLE_TENANT_IDENTIFIER}))
})
test('keeps actors, Consent subject and native measurement semantics linked across examples',()=>{
 assert.equal(examples.EXAMPLE_CONSENT_ACCESS_RULES?.physicianByEmailContinuousCare[ClaimConsent.subject],shared.EXAMPLE_SUBJECT_DID)
 assert.equal(examples.EXAMPLE_FAMILY_ORGANIZATION_SEARCH_RESPONSE_BODY.body.data[0].resource.meta.claims[Org.OwnerTelephone],SAFE.firstContactPhoneE164)
 assert.equal(typeof examples.buildExampleEmployeeClaims,'function')
 assert.equal(typeof examples.buildVitalSignObservationEntry,'function')
})

test('creates independent persistence-shape records without treating a synthetic envelope as encryption evidence',()=>{
 assert.equal(typeof examples.buildExampleConfidentialStorageDoc,'function')
 const first=examples.buildExampleConfidentialStorageDoc(),second=examples.buildExampleConfidentialStorageDoc()
 assert.notEqual(first,second);assert.notEqual(first.jwe,second.jwe)
 first.jwe.ciphertext='changed-envelope';assert.notEqual(second.jwe.ciphertext,first.jwe.ciphertext)
 assert.equal(examples.buildExampleConfidentialStorageDoc({id:'another-record',sequence:2}).sequence,2)
 assert.equal(examples.LifecycleRequestType.TenantDisable,'Organization-disable-request-v1.0')
})
test('uses the same governed participants for projection and typed search examples',()=>{
 assert.equal(typeof examples.buildExampleCommunicationParticipantProjection,'function')
 const projection=examples.buildExampleCommunicationParticipantProjection(),query=examples.buildExampleCommunicationParticipantSearchInput()
 assert.equal(projection.subject,shared.EXAMPLE_SUBJECT_DID)
 assert.equal(query.subject,projection.subject)
 assert.ok(projection.recipients.includes(query.targetActorId[0]))
 assert.equal(examples.buildExampleCommunicationParticipantProjection({id:'another-projection'}).id,'another-projection')
})

test('provides a neutral governed reminder context without adding an execution policy',()=>{
 assert.equal(typeof examples.buildVoiceReminderDemoContext,'function')
 const context=examples.buildVoiceReminderDemoContext()
 assert.equal(context.tenantId,shared.EXAMPLE_TENANT_IDENTIFIER)
 assert.equal(context.subjectId,shared.EXAMPLE_SUBJECT_DID)
 assert.equal(context.hostRegistryNetwork,'test')
 assert.equal(context.permissionBundle,undefined)
 assert.equal(examples.buildVoiceReminderDemoContext({subjectAlias:'Synthetic alternate label'}).subjectAlias,'Synthetic alternate label')
 assert.notEqual(examples.buildVoiceReminderDemoContext(),context)
})

test('keeps Family registration business identity, DID reference and contact projections separate',()=>{
 assert.equal(typeof examples.buildExampleFamilyRegistrationClaims,'function')
 const claims=examples.buildExampleFamilyRegistrationClaims()
 assert.equal(claims[Org.IdentifierReference],shared.EXAMPLE_SUBJECT_DID)
 assert.equal(claims[Org.IdentifierValue],shared.EXAMPLE_INDIVIDUAL_MULTIBASE_ID)
 assert.equal(claims[Org.OwnerTelephone],examples.EXAMPLE_FAMILY_REGISTRATION_OWNER_TELEPHONE)
 const content=examples.buildExampleFamilyRegistrationContent({status:'pending',claims:{[Org.AlternateName]:'Synthetic alternative'}})
 assert.equal(content.status,'pending');assert.equal(content.claims[Org.AlternateName],'Synthetic alternative');assert.deepEqual(content.contained,[])
})
test('preserves licence purchase serials and active/purged employee response records',()=>{
 assert.ok(examples.EXAMPLE_LICENSE_PURCHASE_INPUT)
 assert.equal(examples.EXAMPLE_LICENSE_PURCHASE_INPUT.quantity,examples.EXAMPLE_LICENSE_PURCHASE_INPUT.serialNumbers.length)
 assert.equal(examples.EXAMPLE_LICENSE_AVAILABLE_RECORD.status,'available')
 const response=examples.EXAMPLE_EMPLOYEE_SEARCH_RESPONSE_BODY
 assert.equal(response.total,3);assert.equal(response.data.length,3)
 assert.equal(response.data.filter(entry=>entry.resource.status==='purged').length,1)
 assert.equal(new Set(response.data.map(entry=>entry.resource.claims[Person.Identifier])).size,3)
})
