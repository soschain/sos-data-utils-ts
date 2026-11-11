// Flow contract: generated subject identifiers can carry explicit delegated-read invitations, but malformed identifiers, family membership and emergency-contact status never manufacture clinical authority.
import test from 'node:test'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {createSoschainDemoMemberInvitation,SoschainDemoMemberRoles as R} from '../dist/demo-member-lifecycle.js'
import {REPOSITORY_SAFE_EXAMPLES as e} from '../dist/repository-privacy.js'
import {FHIR_ENCOUNTER_TRANSFER_TEST_DATA as f} from 'fhir-data-utils-ts/data'
const input={id:e.resourceUuid,workspaceOwnerUid:e.resourceUuid,subjectId:f.subjectReference,
  inviteeEmailHash:createHash('sha256').update(e.firstContactEmail).digest('hex'),inviteeEmailHint:e.firstContactEmail,
  role:R.Caregiver,now:f.occurredAt,expiresAt:new Date(Date.parse(f.occurredAt)+60_000).toISOString()}
test('a canonical generated identifier is retained independently from a fixture name',()=>{
  const member=createSoschainDemoMemberInvitation(input)
  assert.equal(member.subjectId,f.subjectReference)
  assert.equal(member.access,'delegated-read')
  assert.equal(member.controller,false)
})
test('malformed or missing subject identifiers fail before an invitation is returned',()=>{
  for(const subjectId of ['',undefined,42,' ','<subject>'])assert.throws(()=>createSoschainDemoMemberInvitation({...input,subjectId}),/subject/)
})
test('family and emergency-contact membership preserve their non-clinical access profiles',()=>{
  assert.equal(createSoschainDemoMemberInvitation({...input,role:R.FamilyMember}).access,'member-no-health')
  assert.equal(createSoschainDemoMemberInvitation({...input,role:R.EmergencyContact}).access,'emergency-contact')
})
