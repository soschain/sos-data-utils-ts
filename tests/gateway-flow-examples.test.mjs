// Flow contract: reusable gateway fixtures derive hosted identities from canonical contracts, share governed synthetic origins and phones, and retain native FHIR ingestion shape without conferring access authority.
import assert from 'node:assert/strict'
import test from 'node:test'
import {REPOSITORY_SAFE_EXAMPLES as SAFE,inspectRepositoryPrivacy} from '../dist/repository-privacy.js'
import {buildIndividualDidWeb,buildHostedProviderDidWeb} from '../dist/hosted-did.js'
import {CommunicationClaim} from 'fhir-data-utils-ts/claims'
const examples=await import('../dist/gateway-flow-examples.js').catch(()=>({}))
test('publishes the governed shared fixture and hosted route contracts',()=>{
 assert.equal(examples.EXAMPLE_TENANT_IDENTIFIER,SAFE.tenantId)
 assert.equal(examples.EXAMPLE_HOST_PUBLIC_HOSTNAME,SAFE.domain)
 assert.equal(examples.EXAMPLE_GATEWAY_PUBLIC_ORIGIN,SAFE.httpsBaseUrl)
 assert.deepEqual(examples.EXAMPLE_TENANT_ROUTE_CONTEXT,{tenantId:SAFE.tenantId,jurisdiction:SAFE.secondaryCountryIso2,sector:'health-care'})
 assert.equal(examples.buildExampleHostedTenantBaseUrl({alternateName:SAFE.tenantId,jurisdiction:SAFE.secondaryCountryIso2,version:'v1',sector:'health-care'}),`${SAFE.httpsBaseUrl}/${SAFE.tenantId}/cds-es/v1/health-care`)
})
test('derives hosted and subject identity with independent canonical builders',()=>{
 assert.equal(examples.EXAMPLE_HOSTED_PROVIDER_DID,buildHostedProviderDidWeb({hostDomain:SAFE.domain,sector:'health-care',providerTaxId:examples.EXAMPLE_PROVIDER_TAX_ID}))
 assert.equal(examples.EXAMPLE_SUBJECT_DID,buildIndividualDidWeb({providerDidWeb:examples.EXAMPLE_HOSTED_PROVIDER_DID,individualId:examples.EXAMPLE_INDIVIDUAL_MULTIBASE_ID}))
 assert.notEqual(examples.EXAMPLE_CONTROLLER_DID,examples.EXAMPLE_PROVIDER_ORGANIZATION_DID)
 assert.notEqual(examples.EXAMPLE_EMAIL_CONTROLLER_ORG,examples.EXAMPLE_EMAIL_PROFESSIONAL)
})
test('preserves ingestion attachment and claims ownership without substituting a flat resource',()=>{
 assert.equal(typeof examples.buildExampleCommunicationIngestionPayload,'function')
 const payload=examples.buildExampleCommunicationIngestionPayload({subjectDid:examples.EXAMPLE_SUBJECT_DID,ipsBundleBase64:examples.EXAMPLE_CONSENT_ATTACHMENT_DATA_BASE64})
 const resource=payload.body.data[0].resource
 assert.equal(resource.resourceType,'Communication')
 assert.equal(resource.meta.claims[CommunicationClaim.Subject],examples.EXAMPLE_SUBJECT_DID)
 assert.equal(resource.payload[0].contentAttachment.contentType,'application/fhir+json')
})
test('keeps all fixture URLs and telephone values within governed synthetic examples',()=>{
 assert.ok(Object.keys(examples).length>=111)
 const violations=inspectRepositoryPrivacy({path:'gateway-flow-examples',text:JSON.stringify(examples),strictExamples:true,allowedDomains:['loinc.org','snomed.info','terminology.hl7.org','hl7.org']})
 assert.deepEqual(violations,[])
})
