// Flow contract: canonical ECON is an independent functional marker on a family/caregiver invitation; it never changes the membership role, controller authority or data-grant projection, survives accepted/retried lifecycle transitions, and unknown or malformed functional roles fail closed.
import assert from 'node:assert/strict'
import test from 'node:test'
import {createHash} from 'node:crypto'
import {HL7_RELATED_PERSON_FUNCTIONAL_ROLES} from 'fhir-data-utils-ts'
import {REPOSITORY_SAFE_EXAMPLES as examples} from '../dist/repository-privacy.js'
import {SoschainPersonalDemoSubjectIds} from '../dist/portal-demo-fixtures.js'
import {SoschainDemoMemberActions,SoschainDemoMemberRoles,createSoschainDemoMemberInvitation,transitionSoschainDemoMemberInvitation} from '../dist/demo-member-lifecycle.js'

const emergencyRole=HL7_RELATED_PERSON_FUNCTIONAL_ROLES.find(role=>role.code==='ECON')
assert.ok(emergencyRole)
const createdAt=examples.organizationScopedResources.slotStart
const at=minutes=>new Date(Date.parse(createdAt)+minutes*60_000).toISOString()
const base=Object.freeze({
  id:examples.resourceUuid,
  workspaceOwnerUid:examples.resourceUuid,
  subjectId:SoschainPersonalDemoSubjectIds.Partner,
  inviteeEmailHash:createHash('sha256').update(examples.firstContactEmail).digest('hex'),
  inviteeEmailHint:`${examples.firstContactGivenName.charAt(0)}***@${examples.domain}`,
  role:SoschainDemoMemberRoles.Caregiver,
  now:createdAt,
  expiresAt:at(24*60),
})
const memberUid=examples.demoOrganizationUuids.healthCare

for(const role of [SoschainDemoMemberRoles.FamilyMember,SoschainDemoMemberRoles.Caregiver]){
  test(`keeps ${role} and the independent canonical emergency-contact marker together`,()=>{
    const ordinary=createSoschainDemoMemberInvitation({...base,role})
    const functionalRoles=[emergencyRole.code]
    const combined=createSoschainDemoMemberInvitation({...base,role,functionalRoles})
    assert.equal(combined.role,ordinary.role)
    assert.equal(combined.access,ordinary.access)
    assert.equal(combined.controller,false)
    assert.equal(combined.status,'pending')
    assert.deepEqual(combined.functionalRoles,[emergencyRole.code])
    assert.equal(Object.isFrozen(combined.functionalRoles),true)
    functionalRoles.length=0
    assert.deepEqual(combined.functionalRoles,[emergencyRole.code])
    assert.equal(Object.keys(combined).some(key=>key.startsWith('Consent.')),false)
  })
}

test('preserves the functional marker through acceptance, exact acceptance retry, suspension, reactivation and revocation',()=>{
  const pending=createSoschainDemoMemberInvitation({...base,functionalRoles:[emergencyRole.code]})
  const acceptance={action:SoschainDemoMemberActions.Accept,actorUid:memberUid,actorEmailHash:base.inviteeEmailHash,now:at(1)}
  const active=transitionSoschainDemoMemberInvitation(pending,acceptance)
  assert.deepEqual(active.functionalRoles,[emergencyRole.code])
  assert.equal(active.role,base.role)
  assert.equal(active.controller,false)
  assert.equal(transitionSoschainDemoMemberInvitation(active,acceptance),active)
  const suspended=transitionSoschainDemoMemberInvitation(active,{action:SoschainDemoMemberActions.Suspend,actorUid:base.workspaceOwnerUid,now:at(2)})
  const reopened=transitionSoschainDemoMemberInvitation(suspended,{action:SoschainDemoMemberActions.Reactivate,actorUid:base.workspaceOwnerUid,now:at(3)})
  const revoked=transitionSoschainDemoMemberInvitation(reopened,{action:SoschainDemoMemberActions.Revoke,actorUid:base.workspaceOwnerUid,now:at(4)})
  for(const member of [suspended,reopened,revoked]){
    assert.deepEqual(member.functionalRoles,[emergencyRole.code])
    assert.equal(member.role,base.role)
    assert.equal(member.access,pending.access)
    assert.equal(member.controller,false)
  }
})

test('retains the existing emergency-contact-only invitation when no functional-role field is supplied',()=>{
  const legacy=createSoschainDemoMemberInvitation({...base,role:SoschainDemoMemberRoles.EmergencyContact})
  assert.equal(legacy.role,SoschainDemoMemberRoles.EmergencyContact)
  assert.equal(legacy.access,'emergency-contact')
  assert.equal(legacy.controller,false)
  const active=transitionSoschainDemoMemberInvitation(legacy,{action:SoschainDemoMemberActions.Accept,actorUid:memberUid,actorEmailHash:base.inviteeEmailHash,now:at(1)})
  assert.equal(active.access,'emergency-contact')
  assert.equal(active.controller,false)
})

for(const functionalRoles of [['invalid-functional-role'],[{}],emergencyRole.code,null]){
  test(`rejects malformed or unknown functional roles: ${JSON.stringify(functionalRoles)}`,()=>{
    assert.throws(()=>createSoschainDemoMemberInvitation({...base,functionalRoles}),/role/u)
  })
}
