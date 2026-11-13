import {HL7_CODING_SYSTEM_V3_ROLE_CODE,HL7_RELATED_PERSON_FUNCTIONAL_ROLES} from 'gdc-common-utils-ts/constants/hl7-roles'
export const SoschainDemoMemberRoles = Object.freeze({
  FamilyMember: 'family-member',
  Caregiver: 'caregiver',
  EmergencyContact: 'emergency-contact',
} as const)

export type SoschainDemoMemberRole = typeof SoschainDemoMemberRoles[keyof typeof SoschainDemoMemberRoles]
export type SoschainDemoMemberStatus = 'pending' | 'active' | 'suspended' | 'revoked'
export type SoschainDemoMemberAccess = 'member-no-health' | 'delegated-read' | 'emergency-contact'

export const SoschainDemoMemberActions = Object.freeze({
  Accept: 'accept',
  Suspend: 'suspend',
  Reactivate: 'reactivate',
  Revoke: 'revoke',
} as const)

export type SoschainDemoMemberAction = typeof SoschainDemoMemberActions[keyof typeof SoschainDemoMemberActions]

export type SoschainDemoMemberInvitation = Readonly<{
  id: string
  workspaceOwnerUid: string
  subjectId: string
  inviteeEmailHash?: string
  inviteeEmailHint?: string
  /** Hash of the normalized E.164 recipient; never a raw telephone number. */
  inviteePhoneNumberHash?: string
  /** Redacted recipient hint, consisting of three stars and the last four digits. */
  inviteePhoneNumberHint?: string
  role: SoschainDemoMemberRole
  access: SoschainDemoMemberAccess
  controller: false
  status: SoschainDemoMemberStatus
  memberUid?: string
  createdAt: string
  updatedAt: string
  expiresAt: string
}>

export type CreateSoschainDemoMemberInvitation = Readonly<{
  id: string
  workspaceOwnerUid: string
  subjectId: string
  inviteeEmailHash?: string
  inviteeEmailHint?: string
  inviteePhoneNumberHash?: string
  inviteePhoneNumberHint?: string
  role: SoschainDemoMemberRole
  now: string
  expiresAt: string
}>

export type TransitionSoschainDemoMemberInvitation = Readonly<{
  action: SoschainDemoMemberAction
  actorUid: string
  actorEmailHash?: string
  /** Supplied only from the authenticated actor's verified E.164 telephone. */
  actorPhoneNumberHash?: string
  now: string
}>

const roleAccess: Readonly<Record<SoschainDemoMemberRole, SoschainDemoMemberAccess>> = Object.freeze({
  [SoschainDemoMemberRoles.FamilyMember]: 'member-no-health',
  [SoschainDemoMemberRoles.Caregiver]: 'delegated-read',
  [SoschainDemoMemberRoles.EmergencyContact]: 'emergency-contact',
})

export function createSoschainDemoMemberInvitation(input: CreateSoschainDemoMemberInvitation): SoschainDemoMemberInvitation {
  const createdAt = instant(input.now, 'demo_member_now_invalid')
  const expiresAt = instant(input.expiresAt, 'demo_member_expiry_invalid')
  if (Date.parse(expiresAt) <= Date.parse(createdAt)) throw new Error('demo_member_expiry_invalid')
  const role = demoMemberRole(input.role)
  const recipient = memberRecipient(input)
  return Object.freeze({
    id: required(input.id, 'demo_member_id_required'),
    workspaceOwnerUid: required(input.workspaceOwnerUid, 'demo_member_owner_required'),
    subjectId: subjectIdentifier(input.subjectId),
    ...recipient,
    role,
    access: roleAccess[role],
    controller: false,
    status: 'pending',
    createdAt,
    updatedAt: createdAt,
    expiresAt,
  })
}

export function transitionSoschainDemoMemberInvitation(
  invitation: SoschainDemoMemberInvitation,
  input: TransitionSoschainDemoMemberInvitation,
): SoschainDemoMemberInvitation {
  const now = instant(input.now, 'demo_member_now_invalid')
  const actorUid = required(input.actorUid, 'demo_member_actor_required')
  if (invitation.status === 'revoked') throw new Error('demo_member_revocation_terminal')

  if (input.action === SoschainDemoMemberActions.Accept) {
    const actorHash = invitation.inviteePhoneNumberHash !== undefined
      ? recipientHash(input.actorPhoneNumberHash, 'demo_member_phone_hash_invalid')
      : emailHash(input.actorEmailHash || '')
    if (actorHash !== (invitation.inviteePhoneNumberHash ?? invitation.inviteeEmailHash)) throw new Error('demo_member_invitee_required')
    if (invitation.status === 'active' && invitation.memberUid === actorUid) return invitation
    if (invitation.status !== 'pending') throw new Error('demo_member_acceptance_not_pending')
    if (Date.parse(now) >= Date.parse(invitation.expiresAt)) throw new Error('demo_member_invitation_expired')
    return Object.freeze({ ...invitation, status: 'active', memberUid: actorUid, updatedAt: now })
  }

  if (actorUid !== invitation.workspaceOwnerUid) throw new Error('demo_member_owner_required')
  if (input.action === SoschainDemoMemberActions.Suspend) {
    if (invitation.status === 'suspended') return invitation
    if (invitation.status !== 'active') throw new Error('demo_member_suspension_requires_active')
    return Object.freeze({ ...invitation, status: 'suspended', updatedAt: now })
  }
  if (input.action === SoschainDemoMemberActions.Reactivate) {
    if (invitation.status === 'active') return invitation
    if (invitation.status !== 'suspended') throw new Error('demo_member_reactivation_requires_suspended')
    return Object.freeze({ ...invitation, status: 'active', updatedAt: now })
  }
  if (input.action === SoschainDemoMemberActions.Revoke) {
    return Object.freeze({ ...invitation, status: 'revoked', updatedAt: now })
  }
  throw new Error('demo_member_action_invalid')
}

function demoMemberRole(value: unknown): SoschainDemoMemberRole {
  if (Object.values(SoschainDemoMemberRoles).includes(value as SoschainDemoMemberRole)) return value as SoschainDemoMemberRole
  throw new Error('demo_member_role_invalid')
}

function subjectIdentifier(value:unknown):string {
  if(typeof value!=='string'||!/^[A-Za-z0-9][A-Za-z0-9:._/-]{0,1023}$/u.test(value))throw new Error('demo_member_subject_invalid')
  return value
}

function required(value: unknown, code: string): string {
  const normalized = String(value || '').trim()
  if (!normalized) throw new Error(code)
  return normalized
}

function emailHash(value: unknown): string {
  return recipientHash(value, 'demo_member_email_hash_invalid')
}

function recipientHash(value: unknown, code: string): string {
  const normalized = String(value || '').trim().toLowerCase()
  if (typeof value !== 'string' || !/^[a-f0-9]{64}$/u.test(normalized)) throw new Error(code)
  return normalized
}

function memberRecipient(input: CreateSoschainDemoMemberInvitation) {
  if ('recipientChannel' in input) throw new Error('demo_member_recipient_channel_invalid')
  const phone = input.inviteePhoneNumberHash !== undefined || input.inviteePhoneNumberHint !== undefined
  const email = input.inviteeEmailHash !== undefined || input.inviteeEmailHint !== undefined
  if (phone && email) throw new Error('demo_member_recipient_channel_invalid')
  if (!phone) return {
    inviteeEmailHash: emailHash(input.inviteeEmailHash),
    inviteeEmailHint: required(input.inviteeEmailHint, 'demo_member_email_hint_required'),
  }
  const inviteePhoneNumberHash = recipientHash(input.inviteePhoneNumberHash, 'demo_member_phone_hash_invalid')
  const inviteePhoneNumberHint = input.inviteePhoneNumberHint
  if (typeof inviteePhoneNumberHint !== 'string' || !/^\*{3}\d{4}$/u.test(inviteePhoneNumberHint)) throw new Error('demo_member_phone_hint_invalid')
  return {inviteePhoneNumberHash, inviteePhoneNumberHint}
}

function instant(value: unknown, code: string): string {
  const normalized = String(value || '').trim()
  const milliseconds = Date.parse(normalized)
  if (!normalized || !Number.isFinite(milliseconds)) throw new Error(code)
  return new Date(milliseconds).toISOString()
}

/** Role vocabulary only; membership and an explicit active Consent remain separate checks. */
export const DemoMemberConsentRoleClaims=Object.freeze({
  FamilyMember:`${HL7_CODING_SYSTEM_V3_ROLE_CODE}|FAMMEMB`,
  Caregiver:(()=>{const role=HL7_RELATED_PERSON_FUNCTIONAL_ROLES.find(item=>item.code==='CAREGIVER')!;return `${role.codingSystem}|${role.code}`})(),
})
