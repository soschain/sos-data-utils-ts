import {SchemaOrgOrganizationClaim as O,SchemaOrgPersonClaim as P} from 'antifraud-data-utils-ts/schema-org-claims';
import type {IndividualOrganizationKycPayload,IndividualOrganizationKycProfile} from './individual-onboarding-contract.js';
import {IndividualOnboardingSelfRole} from './individual-onboarding-contract.js';
type CompactKycGender=string;
function normalizeKycGenderToCompact(value:unknown):string|undefined{ const raw=typeof value==='string'?value.trim():''; if(!raw)return undefined;const v=raw.toLowerCase();return ['f','female','woman','mujer'].includes(v)?'F':['m','male','man','hombre'].includes(v)?'M':raw.toUpperCase();}
export type IndividualOrganizationKycClaimsOptions = Readonly<
  Required<Pick<IndividualOrganizationKycPayload, 'profile'>>
  & Pick<IndividualOrganizationKycPayload, 'individualBirthDate' | 'controllerEmail'>
  & {
    individualAlternateName: string;
  }
>;

/**
 * Result returned by the KYC-to-claims mapper.
 */
export type IndividualOrganizationKycClaimsResult = Readonly<{
  claims: Record<string, string>;
  resolved: Readonly<{
    organizationAlternateName: string;
    controllerGivenName?: string;
    controllerFamilyName?: string;
    controllerIdentifier?: string;
    controllerEmail?: string;
    controllerTelephone?: string;
    controllerBirthYear?: string;
    subjectBirthYear?: string;
  }>;
}>;

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeLowerText(value: unknown): string | undefined {
  const normalized = normalizeText(value).toLowerCase();
  return normalized || undefined;
}

function normalizeDisplayText(value: unknown): string | undefined {
  const normalized = normalizeText(value);
  return normalized || undefined;
}

function normalizeUpperText(value: unknown): string | undefined {
  const normalized = normalizeText(value).toUpperCase();
  return normalized || undefined;
}

function normalizeEmail(value: unknown): string | undefined {
  return normalizeLowerText(value);
}

function normalizeBirthYear(value: unknown): string | undefined {
  const raw = normalizeText(value);
  if (!raw) return undefined;
  const match = raw.match(/^(\d{4})/);
  return match?.[1];
}

/**
 * Normalizes heterogeneous KYC gender values to the compact values already used
 * by the current `org.schema.Person.gender` tests and onboarding claims.
 */
export function normalizeKycGender(value: unknown): CompactKycGender | undefined {
  return normalizeKycGenderToCompact(value);
}



/**
 * Converts the current web KYC profile plus the subject seed fields into the
 * canonical `org.schema` claims expected by individual onboarding flows.
 *
 * Current contract:
 * - the individual Organization uses `individualAlternateName`
 * - controller identity comes from the KYC profile
 * - the controller email may be supplied externally because the example KYC
 *   payload does not currently include an email field
 * - birth date is stored as year-only because that is the current lightweight
 *   requirement for the individual demos
 */
export function buildClaimsFromIndividualOrganizationKyc(
  options: IndividualOrganizationKycClaimsOptions,
): IndividualOrganizationKycClaimsResult {
  const profile = options.profile || {};
  const organizationAlternateName = normalizeDisplayText(options.individualAlternateName);
  if (!organizationAlternateName) {
    throw new Error('KYC individual onboarding requires individualAlternateName.');
  }

  const givenName = normalizeUpperText(profile.first_name);
  const familyName = normalizeUpperText(profile.last_name);
  const controllerName = [givenName, familyName].filter(Boolean).join(' ').trim() || undefined;
  const controllerIdentifier = normalizeText(profile.id_number) || undefined;
  const controllerEmail = normalizeEmail(options.controllerEmail);
  const controllerTelephone = normalizeText(profile.phone_number) || undefined;
  const controllerBirthYear = normalizeBirthYear(profile.birthdate);
  const subjectBirthYear = normalizeBirthYear(options.individualBirthDate);
  const gender = normalizeKycGender(profile.gender);

  const claims: Record<string, string> = {
    '@context': 'org.schema',
    [O.AlternateName]: organizationAlternateName,
  };

  if (controllerIdentifier) {
    claims[O.OwnerIdentifierValue] = controllerIdentifier;
    claims[P.IdentifierValue] = controllerIdentifier;
    claims[P.Identifier] = `urn:person:identifier:${controllerIdentifier}`;
  }
  claims[O.OwnerAlternateName] = organizationAlternateName;
  if (controllerEmail) {
    claims[O.OwnerEmail] = controllerEmail;
  }
  if (controllerTelephone) {
    claims[O.OwnerTelephone] = controllerTelephone;
  }
  if (givenName) claims[P.GivenName] = givenName;
  if (familyName) claims[P.FamilyName] = familyName;
  if (controllerName) claims[P.Name] = controllerName;
  claims[O.MemberRole] = IndividualOnboardingSelfRole;
  if (normalizeUpperText(profile.country)) claims[O.AddressCountry] = normalizeUpperText(profile.country) as string;
  if (normalizeText(profile.city)) claims[O.AddressLocality] = normalizeText(profile.city);
  if (normalizeText(profile.address)) claims[O.StreetAddress] = normalizeText(profile.address);
  if (normalizeText(profile.postal_code)) claims[O.PostalCode] = normalizeText(profile.postal_code);
  if (gender) claims[P.Gender] = gender;
  if (controllerBirthYear) claims[P.BirthDate] = controllerBirthYear;
  if (subjectBirthYear) claims[O.MemberBirthDate] = subjectBirthYear;

  return {
    claims,
    resolved: {
      organizationAlternateName,
      ...(givenName ? { controllerGivenName: givenName } : {}),
      ...(familyName ? { controllerFamilyName: familyName } : {}),
      ...(controllerIdentifier ? { controllerIdentifier } : {}),
      ...(controllerEmail ? { controllerEmail } : {}),
      ...(controllerTelephone ? { controllerTelephone } : {}),
      ...(controllerBirthYear ? { controllerBirthYear } : {}),
      ...(subjectBirthYear ? { subjectBirthYear } : {}),
    },
  };
}
