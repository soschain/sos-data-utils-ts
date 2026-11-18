// Flow contract: independent transport and onboarding preserve the existing
// claims-first Person/controller split and produce a PDF reference, not authority.
import test from 'node:test'
import assert from 'node:assert/strict'
import {mergeIndividualOrganizationClaims,buildIndividualOnboardingPdfDocumentReferenceEntry} from 'sos-data-utils-ts/individual-onboarding'
import {safelyJoinUrl,knownDomainsReversed,HttpStatusText} from 'sos-data-utils-ts/gateway-transport-values'
import {REPOSITORY_SAFE_EXAMPLES as e} from 'sos-data-utils-ts/repository-privacy'
import {SchemaOrgOrganizationClaim as O,SchemaOrgPersonClaim as P} from 'antifraud-data-utils-ts/schema-org-claims'
import {DocumentReferenceClaim as D} from 'fhir-data-utils-ts'

test('onboarding separates subject, controller and canonical PDF claims',()=>{
 const result=mergeIndividualOrganizationClaims({formFields:{controllerGivenName:e.individualGivenName,controllerFamilyName:e.personFamilyName,controllerEmail:e.individualEmail,controllerIsSubject:true,subjectAlternateName:e.tenantId}})
 assert.deepEqual(result,{claims:{'@context':'org.schema',[O.AlternateName]:e.tenantId,[O.OwnerEmail]:e.individualEmail,[O.MemberGivenName]:e.individualGivenName,[O.MemberFamilyName]:e.personFamilyName,[O.MemberRole]:'ONESELF',[P.GivenName]:e.individualGivenName,[P.FamilyName]:e.personFamilyName},resolved:{organizationAlternateName:e.tenantId,controllerContact:{email:e.individualEmail},memberContact:{email:e.individualEmail},self:true}})
 const entry=buildIndividualOnboardingPdfDocumentReferenceEntry({subject:e.didWeb,contentData:e.resourceUuid,claims:result.claims})
 assert.equal(entry.resource.meta.claims[D.Subject],e.didWeb)
 assert.equal(entry.resource.meta.claims[D.ContentData],e.resourceUuid)
 assert.equal(entry.resource.meta.claims[D.ContentType],'application/pdf')
 assert.equal('status' in entry.resource,false)
})
test('transport joins exactly one existing edge slash and recognizes canonical namespaces',()=>{
 assert.equal(safelyJoinUrl(e.httpsBaseUrl+'/', '/identity'),e.httpsBaseUrl+'/identity')
 assert.deepEqual(knownDomainsReversed,['org.schema','org.hl7.fhir.api','org.hl7.fhir.r4','org.ilo.isco','net.openid'])
 assert.equal(HttpStatusText.Ok,'200 OK')
})
