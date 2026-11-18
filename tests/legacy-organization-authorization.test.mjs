// Flow contract: read historical organization ledger identifiers without changing official-value bytes, normalize only the type/prefix, and reject empty or ambiguous caller formats. Existing CDS jurisdiction identities retain their separate contract.
import assert from 'node:assert/strict'
import test from 'node:test'
import {REPOSITORY_SAFE_EXAMPLES as e} from '../dist/repository-privacy.js'
import {buildOrganizationAuthorizationUrn,normalizeOrganizationAuthorizationUrn,buildOrganizationAuthorizationUrnCds} from '../dist/organization-authorization-urn.js'
// Golden grammar from released gdc-common-utils-ts@2.9.30; governed legal values remain referenced, not copied.
test('preserves legacy organization identifier bytes and normalization',()=>{
 const expected=`urn:org:bn:${e.organizationBusinessNumber}`
 assert.equal(buildOrganizationAuthorizationUrn({identifierType:' BN ',identifierValue:` ${e.organizationBusinessNumber} `}),expected)
 assert.equal(normalizeOrganizationAuthorizationUrn(`BN|${e.organizationBusinessNumber}`),expected)
 assert.equal(normalizeOrganizationAuthorizationUrn(` URN:ORG:BN:${e.organizationBusinessNumber} `),expected)
 const exactValue=`${e.tenantId}:CasePreserved`
 assert.equal(normalizeOrganizationAuthorizationUrn(`urn:org:TAX:${exactValue}`),`urn:org:tax:${exactValue}`)
 assert.equal(buildOrganizationAuthorizationUrnCds({jurisdiction:e.countryIso2,identifierType:'BN',identifierValue:e.organizationBusinessNumber}),`urn:cds-ca:v1:organization:bn:${e.organizationBusinessNumber}`)
})
test('denies empty values and unsupported legacy locators',()=>{
 for(const value of ['',e.organizationBusinessNumber,e.didWeb,'BN|','urn:org::'])assert.throws(()=>normalizeOrganizationAuthorizationUrn(value))
 assert.throws(()=>buildOrganizationAuthorizationUrn({identifierType:'BN',identifierValue:''}))
 assert.throws(()=>buildOrganizationAuthorizationUrn({identifierType:'',identifierValue:e.organizationBusinessNumber}))
})
