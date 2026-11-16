// Flow contract: construct only canonical commercial/employee request metadata from governed input, preserve claims and lifecycle separation, and never infer purchase, activation or employee authority.
import assert from 'node:assert/strict'
import test from 'node:test'
import { REPOSITORY_SAFE_EXAMPLES as e } from '../dist/repository-privacy.js'
import { ConfidentialDocumentIndex } from '../dist/confidential-storage.js'
import { buildLicensePurchaseEntry, buildLicenseSearchEntry, LicenseClaimContext, LicenseCategories, LicenseCommercialSearchOperation } from '../dist/license-commercial-contract.js'
import { EmployeeBatchEntryTypes, EmployeeBundleMethods, EmployeeResourceTypes, EmployeeBundleOperations } from '../dist/employee-batch-contract.js'

test('preserves established confidential provenance index names', () => {
 assert.deepEqual(ConfidentialDocumentIndex,{Sector:'sector',CreatorDid:'audit.creatorDid',SubmitterDid:'audit.submitterDid',SigningKeyId:'audit.signingKeyId'})
})
test('builds the existing claims-first purchase wire shape without mutating input',()=>{
 const input={quantity:2,userClass:'employee',type:'web',ownerOrganizationId:e.tenantId,serialNumbers:[e.resourceUuid,' '],price:0,priceCurrency:' eur ',additionalClaims:{preserved:e.resourceUuid}}
 const before=structuredClone(input)
 assert.deepEqual(buildLicensePurchaseEntry(input),{type:'License-purchase-request-v1.0',request:{method:'POST'},meta:{ownerOrganizationId:e.tenantId},resource:{meta:{claims:{'@context':'org.schema',preserved:e.resourceUuid,'org.schema.IndividualProduct.category':'professional','org.schema.IndividualProduct.additionalType':'web','org.schema.Offer.eligibleQuantity.value':2,'org.schema.Offer.serialNumber':e.resourceUuid,'org.schema.Offer.price':0,'org.schema.Offer.priceCurrency':'EUR','@type':'IndividualProduct:Purchase'}}}})
 assert.deepEqual(input,before)
})
test('keeps operational lifecycle and owner filters outside search claims',()=>{
 const entry=buildLicenseSearchEntry({userClass:'individual',status:'inactive',subjectId:e.resourceUuid,ownerOrganizationId:e.tenantId,email:e.firstContactEmail,role:' '+e.resourceUuid+' '})
 assert.deepEqual(entry.meta,{status:'inactive',subjectId:e.resourceUuid,ownerOrganizationId:e.tenantId})
 assert.equal(entry.resource.meta.claims['org.schema.IndividualProduct.category'],LicenseCategories.Individual)
 assert.equal(entry.resource.meta.claims['@context'],LicenseClaimContext.SchemaOrg)
 assert.equal(entry.resource.meta.claims['@type'],'IndividualProduct:Search')
 assert.equal(entry.resource.meta.claims['org.schema.Person.hasOccupation.identifier.value'],e.resourceUuid)
 assert.equal(LicenseCommercialSearchOperation.Offer,'Offer:Search')
})
test('retains employee operation and wire request names independently of authorization',()=>{
 assert.equal(EmployeeBatchEntryTypes.disable,'Employee-disable-request-v1.0')
 assert.equal(EmployeeBundleMethods.disable,'DELETE')
 assert.equal(EmployeeBundleMethods.purge,'POST')
 assert.equal(EmployeeResourceTypes.employee,'Employee')
 assert.equal(EmployeeBundleOperations.purge,'purge')
})
