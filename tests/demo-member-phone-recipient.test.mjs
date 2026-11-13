// Flow contract: telephone invitations persist only a recipient hash and redacted hint, bind acceptance to the exact authenticated phone hash and UID, and preserve owner-only lifecycle controls. Legacy email records remain accepted by the unchanged legacy tests; no email identity is synthesized for a phone recipient.
import assert from 'node:assert/strict'
import test from 'node:test'
import {createHash} from 'node:crypto'
import {REPOSITORY_SAFE_EXAMPLES as examples} from '../dist/repository-privacy.js'
import {SoschainPersonalDemoSubjectIds} from '../dist/portal-demo-fixtures.js'
import {SoschainDemoMemberActions as A,SoschainDemoMemberRoles as R,createSoschainDemoMemberInvitation,transitionSoschainDemoMemberInvitation} from '../dist/demo-member-lifecycle.js'

const hash=value=>createHash('sha256').update(value).digest('hex')
const now=examples.organizationScopedResources.slotStart
const at=minutes=>new Date(Date.parse(now)+minutes*60_000).toISOString()
const phoneHash=hash(examples.firstContactPhoneE164)
const phoneHint=`***${examples.firstContactPhoneE164.slice(-4)}`
const base=Object.freeze({id:examples.resourceUuid,workspaceOwnerUid:examples.tenantId,subjectId:SoschainPersonalDemoSubjectIds.Partner,inviteePhoneNumberHash:phoneHash,inviteePhoneNumberHint:phoneHint,role:R.FamilyMember,now,expiresAt:at(24*60)})
const memberUid=examples.demoOrganizationUuids.healthCare
const accept={action:A.Accept,actorUid:memberUid,actorPhoneNumberHash:phoneHash,now:at(1)}

for(const role of [R.FamilyMember,R.Caregiver,R.EmergencyContact]){
  test(`creates a hash-only phone invitation for ${role} without inventing an email or authority`,()=>{
    const invitation=createSoschainDemoMemberInvitation({...base,role})
    assert.equal(invitation.inviteePhoneNumberHash,phoneHash)
    assert.equal(invitation.inviteePhoneNumberHint,phoneHint)
    assert.equal(invitation.role,role)
    assert.equal(invitation.status,'pending')
    assert.equal(invitation.controller,false)
    assert.equal(Object.isFrozen(invitation),true)
    assert.equal(JSON.stringify(invitation).includes(examples.firstContactPhoneE164),false)
    assert.equal(Object.hasOwn(invitation,'inviteeEmailHash'),false)
    assert.equal(Object.hasOwn(invitation,'inviteeEmailHint'),false)
  })
}

test('accepts only the matching phone hash and retains exact UID binding on retry',()=>{
  const pending=createSoschainDemoMemberInvitation(base)
  for(const change of [
    {...accept,actorPhoneNumberHash:hash(examples.secondContactPhoneE164)},
    {...accept,actorPhoneNumberHash:undefined},
    {...accept,actorPhoneNumberHash:'invalid-hash'},
    {...accept,actorPhoneNumberHash:undefined,actorEmailHash:phoneHash},
  ]) assert.throws(()=>transitionSoschainDemoMemberInvitation(pending,change))
  const active=transitionSoschainDemoMemberInvitation(pending,accept)
  assert.equal(active.memberUid,memberUid)
  assert.equal(active.status,'active')
  assert.equal(active.controller,false)
  assert.equal(transitionSoschainDemoMemberInvitation(active,{...accept,now:at(2)}),active)
  assert.throws(()=>transitionSoschainDemoMemberInvitation(active,{...accept,actorUid:examples.demoOrganizationUuids.animalCare,now:at(2)}))
  assert.throws(()=>transitionSoschainDemoMemberInvitation(active,{...accept,actorPhoneNumberHash:hash(examples.secondContactPhoneE164),now:at(2)}))
})

test('keeps phone recipient identity through owner lifecycle and rejects member revocation',()=>{
  const active=transitionSoschainDemoMemberInvitation(createSoschainDemoMemberInvitation(base),accept)
  assert.throws(()=>transitionSoschainDemoMemberInvitation(active,{action:A.Revoke,actorUid:memberUid,now:at(2)}),/owner/u)
  const suspended=transitionSoschainDemoMemberInvitation(active,{action:A.Suspend,actorUid:base.workspaceOwnerUid,now:at(2)})
  const reactivated=transitionSoschainDemoMemberInvitation(suspended,{action:A.Reactivate,actorUid:base.workspaceOwnerUid,now:at(3)})
  const revoked=transitionSoschainDemoMemberInvitation(reactivated,{action:A.Revoke,actorUid:base.workspaceOwnerUid,now:at(4)})
  for(const record of [suspended,reactivated,revoked]){
    assert.equal(record.inviteePhoneNumberHash,phoneHash)
    assert.equal(record.inviteePhoneNumberHint,phoneHint)
    assert.equal(record.memberUid,memberUid)
    assert.equal(record.controller,false)
  }
  assert.throws(()=>transitionSoschainDemoMemberInvitation(revoked,accept),/terminal/u)
})

test('rejects missing, ambiguous and malformed recipient channels',()=>{
  for(const candidate of [
    {...base,inviteePhoneNumberHash:undefined},
    {...base,inviteePhoneNumberHash:'invalid-hash'},
    {...base,inviteePhoneNumberHash:123},
    {...base,inviteePhoneNumberHint:''},
    {...base,inviteePhoneNumberHint:examples.firstContactPhoneE164},
    {...base,inviteeEmailHash:phoneHash,inviteeEmailHint:phoneHint},
    {...base,recipientChannel:'unknown'},
  ]) assert.throws(()=>createSoschainDemoMemberInvitation(candidate))
})

test('rejects phone acceptance after invitation expiry',()=>{
  const pending=createSoschainDemoMemberInvitation(base)
  assert.throws(()=>transitionSoschainDemoMemberInvitation(pending,{...accept,now:base.expiresAt}),/expired/u)
})
