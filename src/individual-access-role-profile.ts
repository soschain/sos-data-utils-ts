import {
  HL7_PERSONAL_RELATIONSHIP_ROLES,
  HL7_ROLE_CODE_VERSION,
  type Hl7RoleEntry,
} from 'fhir-data-utils-ts';

/** SOS individual-member picker profile, not the complete HL7 vocabulary. */
export const IndividualMemberRelationshipCodes = Object.freeze([
  'FAMMEMB', 'WIFE', 'HUSB', 'DOMPART', 'SIS', 'BRO', 'SON', 'DAU',
  'PRN', 'GRPRN', 'GRNDCHILD', 'GGRPRN', 'FRND', 'NBOR', 'ROOM',
] as const);

export type IndividualMemberRelationshipCode = typeof IndividualMemberRelationshipCodes[number];

/** Version of the canonical descriptors supplied by the declared FHIR dependency. */
export const IndividualAccessRoleVocabularyVersion = HL7_ROLE_CODE_VERSION;

/** Returns a canonical profile code; unrelated values never become relationship evidence. */
export function normalizeIndividualMemberRelationshipCode(value: unknown): IndividualMemberRelationshipCode | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().toUpperCase();
  return IndividualMemberRelationshipCodes.find(code => code === normalized);
}

/** Checks normalized membership only; it does not narrow or rewrite the original value. */
export function isIndividualMemberRelationshipCode(value: unknown): boolean {
  return normalizeIndividualMemberRelationshipCode(value) !== undefined;
}

/** Ordered canonical descriptors for this SOS picker. Selecting a role grants no access. */
export const IndividualMemberRelationshipRoles: readonly Hl7RoleEntry[] = Object.freeze(
  IndividualMemberRelationshipCodes.map(code => {
    const descriptor = HL7_PERSONAL_RELATIONSHIP_ROLES.find(role => role.code === code);
    if (!descriptor) throw new Error(`Missing canonical individual-member relationship descriptor: ${code}`);
    return descriptor;
  }),
);

/** Application access-role subset; authorization still requires the owning runtime checks. */
export const PersonalAccessRoleCodes = Object.freeze(['ONESELF', 'RESPRSN'] as const);
export type PersonalAccessRoleCode = typeof PersonalAccessRoleCodes[number];
