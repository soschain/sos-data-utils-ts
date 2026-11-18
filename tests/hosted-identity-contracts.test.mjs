// Flow contract: preserve hosted identity hashes and Subject lookup bytes, parse actors without granting authority, and retain tenant-scoped DID/postal binding contracts using governed synthetic values. Parsing, public aliases and opaque lookup IDs never confer data access.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import test from 'node:test'
import {REPOSITORY_SAFE_EXAMPLES as e} from '../dist/repository-privacy.js'
import * as did from '../dist/hosted-did.js'
import * as subject from '../dist/subject-identity.js'
import {parseActorFromSub} from '../dist/actor-identity.js'
import {SecureIdTypesIndividual} from '../dist/identity-identifiers.js'
import {OrganizationDidBindingEntryTypes,buildOrganizationDidBindingBundle,validateOrganizationDidBindingInput} from '../dist/organization-did-binding.js'
import {POSTAL_ACTIVATION_CODE_BINDING_ALGORITHM,PostalActivationLicenseStatuses} from '../dist/postal-activation-binding.js'
// Golden wire vectors captured from released gdc-common-utils-ts@2.9.30, using only the governed examples above. No private identity material or operational configuration is included.
const golden=Object.freeze([
'zG9MJU4Yjo8Y1E2bzGNuKiw3N9pvm7E3nCLYetSYdL6G5awoCgGSCzWw7PiFhZ8fMNYTh',
'zG9DF9cS6UYmmFsSzrodCW1SP73rjZjynnaM2G7ayupti61BwJJpcNJkW5fuymkp1NaQa',
'zG9G85QohVw3g4zJHMDeQbjziiBudC8RNSYg1XQtKew6Sxu1PjYpCNnY1AH8Z3KbHQJjU'])
const input={subjectKind:'person',cardId:e.didWeb,codingSystem:'NN',jurisdiction:' ca ',codeValue:e.resourceUuid}
test('preserves UUID binary, contact normalization and multihash bytes',()=>{
 assert.equal(did.buildSecureIdValueIndividual({secureIdTypeIndividual:SecureIdTypesIndividual.Uuid,privateIdValueIndividual:e.resourceUuid}),golden[0])
 assert.equal(did.buildSecureIdValueMember({secureIdTypeMember:SecureIdTypesIndividual.Email,privateIdValueMember:' mailto:'+e.firstContactEmail.toUpperCase()+' '}),golden[1])
 assert.equal(did.buildSecureIdValueMember({secureIdTypeMember:SecureIdTypesIndividual.Phone,privateIdValueMember:'tel:'+e.phoneE164}),golden[2])
 assert.throws(()=>did.buildSecureIdValueIndividual({secureIdTypeIndividual:SecureIdTypesIndividual.Uuid,privateIdValueIndividual:e.tenantId}))
})
test('preserves private Subject entry bytes, strict public provider payload and identifier tamper denials',()=>{
 const entry=subject.buildSubjectIdentityBundleEntry(input)
 assert.equal(createHash('sha256').update(JSON.stringify(entry)).digest('hex'),'458e50ccbb1b1134d52a4866d51fd600f2185a13d310d65aa21f58a985fb6a24')
 assert.equal(subject.readSubjectIdentityBundleEntry(entry).cardId,e.didWeb)
 assert.equal(subject.buildSubjectIdentifierToken(input),`NN|CA|${e.resourceUuid}`)
 assert.deepEqual(subject.buildSubjectIdentifierLedgerPayload(e.didWeb),{indexProviderDid:e.didWeb})
 assert.equal(subject.readSubjectIdentifierLedgerPayload({indexProviderDid:e.didWeb}),e.didWeb)
 assert.throws(()=>subject.readSubjectIdentifierLedgerPayload({indexProviderDid:e.didWeb,cardId:e.didWeb}))
 assert.throws(()=>subject.buildSubjectIdentifierToken({...input,codeValue:`${e.resourceUuid}|CA`}))
 const changed=structuredClone(entry);changed.resource.meta.claims['org.schema.Person.identifier']=e.resourceUuid
 assert.throws(()=>subject.readSubjectIdentityBundleEntry(changed))
 assert.throws(()=>subject.buildSubjectIdentityBundleEntry({...input,jurisdiction:''}))
})
test('builds hosted provider, organization and member DIDs without serializing private identifiers',()=>{
 const organization=did.buildOrganizationDidWeb({hostDidWeb:e.didWeb,tenantId:e.tenantId,jurisdiction:'CA',sector:'health-care'})
 assert.equal(organization,`${e.didWeb}:${e.tenantId}:cds-CA:v1:health-care`)
 const individual=did.buildIndividualDidWeb({providerDidWeb:e.didWeb,secureIdTypeIndividual:SecureIdTypesIndividual.Uuid,secureIdValueIndividual:golden[0]})
 const member=did.buildIndividualMemberDidWeb({individualDidWeb:individual,memberId:golden[1],roleType:'v3-RoleCode',roleValue:'ONESELF'})
 assert.deepEqual(did.parseIndividualMemberDidWeb(member),{individualDidWeb:individual,memberId:golden[1],roleValue:'ONESELF'})
 assert.equal(member.includes(e.firstContactEmail),false)
 assert.equal(did.generateServiceId({section:'INDEX',format:'FHIR',resourceType:'Person',action:'Read'}),'#index:fhir:person:Read')
 assert.equal(did.buildHostedProviderDidWeb({hostDomain:e.domain,sector:'health-care',providerTaxId:e.tenantId}),`did:web:${e.domain}:health-care:organization:taxid:${e.tenantId}`)
})
test('parses actor terminal role semantics and keeps parse output separate from authorization',()=>{
 const sub=`${e.didWeb}:employee:${golden[1]}:ISCO-08%7C2211:${e.resourceUuid}`
 assert.deepEqual(parseActorFromSub(sub),{sub,organization:e.didWeb,identifier:golden[1],role:'ISCO-08|2211',memberKind:'organization'})
 const member=`${e.didWeb}:individual-member:${golden[1]}:v3-RoleCode|ONESELF`
 assert.equal(parseActorFromSub(member).memberKind,'individual')
 assert.deepEqual(parseActorFromSub(''),{sub:''})
 assert.equal(parseActorFromSub(e.firstContactEmail.toUpperCase()).identifier,e.firstContactEmail)
 assert.equal(Object.hasOwn(parseActorFromSub(sub),'authorized'),false)
})
test('keeps organization alias replacement tenant-scoped and postal code state browser-safe',()=>{
 const binding=buildOrganizationDidBindingBundle({organization:{url:[e.httpsBaseUrl]},controller:{sameAs:e.didWeb}})
 assert.equal(binding.data[0].type,OrganizationDidBindingEntryTypes.Request)
 assert.deepEqual(binding.data[0].resource.organization.url,[e.httpsBaseUrl])
 assert.equal(validateOrganizationDidBindingInput({organization:{url:e.httpsBaseUrl,taxID:e.tenantId}}).ok,false)
 assert.equal(validateOrganizationDidBindingInput({organization:{url:[]}}).ok,false)
 assert.equal(POSTAL_ACTIVATION_CODE_BINDING_ALGORITHM,'scrypt-v1')
 assert.equal(PostalActivationLicenseStatuses.Revoked,'revoked')
})
