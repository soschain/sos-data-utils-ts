// Flow contract: encounter visibility uses the canonical general Encounter section and explicit family/caregiver role claims; emergency contact membership never becomes health authority.
import test from 'node:test'
import assert from 'node:assert/strict'
import * as journey from '../dist/portal-encounter-journey.js'
import * as members from '../dist/demo-member-lifecycle.js'
import {IndividualLogicalSections} from '../dist/individual-sections.js'
import {HL7_CODING_SYSTEM_V3_ROLE_CODE,HL7_RELATED_PERSON_FUNCTIONAL_ROLES} from 'fhir-data-utils-ts'
test('publishes canonical general encounter scope and distinct member role tokens',()=>{
 assert.equal(journey.PortalEncounterPermissionSection,IndividualLogicalSections.Encounters.attributeValue)
 assert.equal(members.DemoMemberConsentRoleClaims.FamilyMember,`${HL7_CODING_SYSTEM_V3_ROLE_CODE}|FAMMEMB`)
 const caregiver=HL7_RELATED_PERSON_FUNCTIONAL_ROLES.find(role=>role.code==='CAREGIVER')
 assert.equal(members.DemoMemberConsentRoleClaims.Caregiver,`${caregiver.codingSystem}|${caregiver.code}`)
 assert.equal(members.DemoMemberConsentRoleClaims.EmergencyContact,undefined)
})
