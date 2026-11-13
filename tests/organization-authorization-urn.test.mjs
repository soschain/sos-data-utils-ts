// Flow contract: organization and employee authorization identifiers bind jurisdiction, legal identity and raw UUID bytes without encoding a clear contact or granting authority.
import assert from 'node:assert/strict'
import test from 'node:test'
import {buildOrganizationAuthorizationUrnCds,buildOrganizationEmployeeAuthorizationUrnCds} from '../dist/organization-authorization-urn.js'
import {REPOSITORY_SAFE_EXAMPLES as safe} from '../dist/repository-privacy.js'

test('preserves the authority-issued legal value and appends the employee UUID independently',()=>{
  const organization=buildOrganizationAuthorizationUrnCds({jurisdiction:'CA-BC',identifierType:'BN',identifierValue:safe.tenantId})
  assert.equal(organization,`urn:cds-ca-bc:v1:organization:bn:${safe.tenantId}`)
  const member=buildOrganizationEmployeeAuthorizationUrnCds({organizationUrn:organization,employeeUuid:safe.resourceUuid,roleCode:'2250'})
  assert.match(member,new RegExp(`^${organization}:member:z[1-9A-HJ-NP-Za-km-z]+:2250$`))
  assert.equal(member.includes(safe.individualEmail),false)
  assert.throws(()=>buildOrganizationAuthorizationUrnCds({jurisdiction:'madrid',identifierType:'BN',identifierValue:safe.tenantId}))
  assert.throws(()=>buildOrganizationEmployeeAuthorizationUrnCds({organizationUrn:organization,employeeUuid:'invalid',roleCode:'2250'}))
  assert.throws(()=>buildOrganizationEmployeeAuthorizationUrnCds({organizationUrn:organization,employeeUuid:safe.resourceUuid,roleCode:'RESPRSN'}))
})
