// Flow contract: preserve exact organization licence, legal-sector and public-alias ledger IDs while denying ambiguous identity locators, invalid or duplicate sector policies and revoked assignments. Opaque lookup keys never replace current authorization.
import assert from 'node:assert/strict'
import test from 'node:test'
import {REPOSITORY_SAFE_EXAMPLES as e} from '../dist/repository-privacy.js'
import * as role from '../dist/organization-role-license.js'
import * as legal from '../dist/legal-sector-organization-urn.js'
import {buildPublicAliasLedgerAssetId} from '../dist/public-alias-ledger.js'
import {DataspaceSectors as S} from '../dist/dataspace-sectors.js'
const identity={jurisdiction:e.countryIso2,organizationOfficialId:e.organizationBusinessNumber,stableContactIdentifier:'urn:multibase:zG9DF9cS6UYmmFsSzrodCW1SP73rjZjynnaM2G7ayupti61BwJJpcNJkW5fuymkp1NaQa',licensedRole:'ISCO-08|2211'}
// Static vectors captured from released gdc-common-utils-ts@2.9.30 with governed synthetic input.
test('preserves public alias and licence preimage/hash bytes',()=>{
 assert.equal(buildPublicAliasLedgerAssetId(e.firstContactEmail),identity.stableContactIdentifier)
 assert.equal(buildPublicAliasLedgerAssetId(` ${identity.stableContactIdentifier} `),identity.stableContactIdentifier)
 assert.equal(role.buildOrganizationRoleLicensePreimage(identity),`urn:cds-ca:${e.organizationBusinessNumber}:${identity.stableContactIdentifier}:ISCO-08|2211`)
 assert.equal(role.buildOrganizationRoleLicenseId(identity),'urn:multibase:zG9K9Xb1m2Gt171LojkXiVLkbckyDSuC3cURPdG3DWPh6Ghib4vfA8wNRubRVn6g4TSct')
 assert.throws(()=>role.buildOrganizationRoleLicenseId({...identity,organizationOfficialId:`urn:org:${e.organizationBusinessNumber}`}))
 assert.throws(()=>role.buildOrganizationRoleLicenseId({...identity,stableContactIdentifier:e.firstContactEmail}))
 assert.throws(()=>buildPublicAliasLedgerAssetId(''))
})
test('preserves strict canonical legal-sector grammar and SHA3-256 lookup',()=>{
 const urn=legal.buildLegalSectorOrganizationUrn({sector:S.HealthCare,country:e.countryIso2,identifierType:'BN',identifierValue:e.organizationBusinessNumber})
 assert.equal(urn,`urn:legal:health-care:ca::::organization:bn:${e.organizationBusinessNumber}`)
 assert.equal(legal.buildLegalSectorOrganizationAssetId(urn),'urn:multibase:zW1jPhVQvshgsD4fyjthBa3rWQHdR9Ay8EibpxrUALgnoVJ')
 assert.throws(()=>legal.buildLegalSectorOrganizationAssetId(urn.replace(':ca:',':CA:')))
 assert.throws(()=>legal.buildLegalSectorOrganizationAssetId(e.didWeb))
 assert.throws(()=>legal.buildLegalSectorOrganizationUrn({sector:S.HealthCare,country:'invalid',identifierType:'BN',identifierValue:e.organizationBusinessNumber}))
})
test('enforces exact sectors, positive limits and active assignment',()=>{
 const policies=role.normalizeOrganizationRoleLicensePolicies([{sector:S.HealthCare.toUpperCase(),active:true,maxDevices:2},{sector:S.OneHealthResearch,active:false}])
 assert.deepEqual(policies,[{sector:S.HealthCare,active:true,maxDevices:2},{sector:S.OneHealthResearch,active:false}])
 assert.equal(role.organizationRoleLicenseAllowsSector({status:'active',data:policies},S.HealthCare),true)
 assert.equal(role.organizationRoleLicenseAllowsSector({status:'revoked',data:policies},S.HealthCare),false)
 assert.equal(role.organizationRoleLicenseAllowsSector({status:'active',data:policies},S.OneHealthResearch),false)
 assert.equal(role.organizationRoleLicenseAllowsSector({status:'active',data:policies},S.HealthLab),false)
 assert.equal(role.resolveOrganizationRoleLicenseMaxDevices(policies[1],3),3)
 for(const bad of [[],[{sector:S.HealthCare,active:true},{sector:S.HealthCare.toUpperCase(),active:false}],[{sector:S.HealthCare,active:true,maxDevices:0}],[{sector:'*',active:true}]]) assert.throws(()=>role.normalizeOrganizationRoleLicensePolicies(bad))
 assert.throws(()=>role.resolveOrganizationRoleLicenseMaxDevices(policies[1],0))
})
