// Copyright 2026 Antifraud Services Inc. under the Apache License, Version 2.0.
// Credential policy reads data bindings; it never establishes a signature or current authority.
import {
  parseServiceCategories,
  parseServiceTypeClaims,
} from './service-claim-parsing.js';

export type ActivationRepresentativePolicyErrorCode =
  | 'MISSING_REPRESENTATIVE_SUBJECT_ID'
  | 'MISSING_REPRESENTATIVE_ROLE_RESPRSN'
  | 'MISSING_REPRESENTATIVE_CREDENTIAL_BINDING'
  | 'MISSING_CONTROLLER_ROLE_RESPRSN'
  | 'MISSING_CONTROLLER_CREDENTIAL_BINDING'
  | 'CONTROLLER_TAXID_MISMATCH'
  | 'REPRESENTATIVE_TAXID_MISMATCH';

export type ActivationServiceAuthorizationPolicyErrorCode =
  | 'MISSING_ORGANIZATION_SERVICE_CATEGORY'
  | 'MISSING_ORGANIZATION_SERVICE_TYPE'
  | 'UNAUTHORIZED_ORGANIZATION_SERVICE_CATEGORY'
  | 'UNAUTHORIZED_ORGANIZATION_SERVICE_TYPE';

export type ActivationRepresentativePolicyError = {
  code: ActivationRepresentativePolicyErrorCode;
  message: string;
};

export type ActivationServiceAuthorizationPolicyError = {
  code: ActivationServiceAuthorizationPolicyErrorCode;
  message: string;
};

/** Typed legal identifier used to bind one organization across credentials and lifecycle commands. */
export type LegalOrganizationIdentifier = Readonly<{
  type: string;
  value: string;
}>;

function asObject(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== 'object') return undefined;
  return value as Record<string, unknown>;
}

function getCredentialSubjectMakesOffer(credential: unknown): Record<string, unknown> | undefined {
  const subject = extractCredentialSubject(credential);
  return asObject(subject?.makesOffer);
}

/**
 * Extracts `credentialSubject` from a VC-like object.
 *
 * @param credential Candidate VC-like object.
 */
export function extractCredentialSubject(credential: unknown): Record<string, unknown> | undefined {
  const obj = asObject(credential);
  if (!obj) return undefined;
  const subject = obj.credentialSubject;
  if (Array.isArray(subject)) return asObject(subject[0]);
  return asObject(subject);
}

/**
 * Normalizes a tax identifier into uppercase trimmed form.
 *
 * @param value Raw tax identifier value.
 */
export function normalizeTaxIdentifier(value: unknown): string | undefined {
  const normalized = String(value || '').trim().toUpperCase();
  return normalized || undefined;
}

/**
 * Normalizes a typed organization identifier for equality checks without
 * changing the canonical value stored in credentials or tenant records.
 */
export function normalizeLegalOrganizationIdentifier(
  identifier: Readonly<{ type?: unknown; value?: unknown }> | undefined,
): LegalOrganizationIdentifier | undefined {
  const rawType = String(identifier?.type || '').trim().toUpperCase();
  const type = rawType === 'TAXID' || rawType === 'TAX_ID' ? 'TAX' : rawType;
  const value = String(identifier?.value || '').trim().toUpperCase();
  return type && value ? { type, value } : undefined;
}

function extractLegalOrganizationIdentifier(value: unknown): LegalOrganizationIdentifier | undefined {
  const source = asObject(value) || {};
  const identifier = asObject(source.identifier) || {};
  const taxId = source.taxID ?? source.taxId;
  return normalizeLegalOrganizationIdentifier(taxId !== undefined
    ? { type: 'taxID', value: taxId }
    : {
      type: identifier.additionalType ?? identifier.type ?? source.identifierType,
      value: identifier.value ?? source.identifierValue,
    });
}

/** Extracts the typed legal identifier from an organization credential subject. */
export function extractOrganizationLegalIdentifier(
  organizationCredential: unknown,
): LegalOrganizationIdentifier | undefined {
  return extractLegalOrganizationIdentifier(extractCredentialSubject(organizationCredential));
}

/** Extracts the typed organization identifier from a representative `memberOf` binding. */
export function extractRepresentativeMemberOfLegalIdentifier(
  representativeCredential: unknown,
): LegalOrganizationIdentifier | undefined {
  const subject = extractCredentialSubject(representativeCredential) || {};
  return extractLegalOrganizationIdentifier(subject.memberOf);
}

/** Compares typed legal identifiers without discarding punctuation from their values. */
export function legalOrganizationIdentifiersMatch(
  left: Readonly<{ type?: unknown; value?: unknown }> | undefined,
  right: Readonly<{ type?: unknown; value?: unknown }> | undefined,
): boolean {
  const normalizedLeft = normalizeLegalOrganizationIdentifier(left);
  const normalizedRight = normalizeLegalOrganizationIdentifier(right);
  return Boolean(normalizedLeft && normalizedRight
    && normalizedLeft.type === normalizedRight.type
    && normalizedLeft.value === normalizedRight.value);
}

/**
 * Extracts an organization tax id from a VC-like organization credential.
 *
 * @param organizationCredential Candidate organization credential.
 */
export function extractOrganizationTaxId(organizationCredential: unknown): string | undefined {
  const subject = extractCredentialSubject(organizationCredential) || {};
  const identifier = asObject(subject.identifier);
  const value = String(subject.taxID ?? subject.taxId ?? identifier?.value ?? '').trim();
  return normalizeTaxIdentifier(value) || undefined;
}

/**
 * Extracts the `memberOf` tax id from a representative credential.
 *
 * @param representativeCredential Candidate representative credential.
 */
export function extractRepresentativeMemberOfTaxId(representativeCredential: unknown): string | undefined {
  const subject = extractCredentialSubject(representativeCredential) || {};
  const memberOf = asObject(subject.memberOf) || {};
  const identifier = asObject(memberOf.identifier);
  const value = String(memberOf.taxID ?? memberOf.taxId ?? identifier?.value ?? '').trim();
  return normalizeTaxIdentifier(value) || undefined;
}

/**
 * Extracts the representative role code from `credentialSubject.hasOccupation`.
 *
 * @param representativeCredential Candidate representative credential.
 */
export function extractRepresentativeRoleCode(representativeCredential: unknown): string | undefined {
  const subject = extractCredentialSubject(representativeCredential) || {};
  const occupation = subject.hasOccupation;
  if (typeof occupation === 'string') return occupation.trim() || undefined;
  if (occupation && typeof occupation === 'object') {
    const occ = occupation as Record<string, unknown>;
    const idRaw = occ.identifier;
    if (typeof idRaw === 'string' && idRaw.trim()) return idRaw.trim();
    if (idRaw && typeof idRaw === 'object') {
      const idObj = idRaw as Record<string, unknown>;
      const idValue = String(idObj.value || '').trim();
      if (idValue) return idValue;
    }
    const idValue = String(occ.value || '').trim();
    if (idValue) return idValue;
    const name = String(occ.name || '').trim();
    if (name) return name;
  }
  return undefined;
}

function readOccupationEntries(value: unknown): Record<string, unknown>[] {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values.map((entry) => {
    if (typeof entry === 'string') return { identifier: entry };
    return asObject(entry);
  }).filter((entry): entry is Record<string, unknown> => Boolean(entry));
}

function readCodedIdentifier(entry: Record<string, unknown>): { system?: string; value?: string } {
  const identifier = entry.identifier;
  if (typeof identifier === 'string') {
    const token = identifier.trim();
    const separator = token.lastIndexOf('|');
    return separator >= 0
      ? { system: token.slice(0, separator), value: token.slice(separator + 1) }
      : { value: token };
  }
  const coded = asObject(identifier) || {};
  return {
    system: String(coded.additionalType || coded.system || '').trim() || undefined,
    value: String(coded.value || '').trim() || undefined,
  };
}

/**
 * Reads controller-authorization codes from an ICA-issued controller VC.
 * Professional ISCO occupations are deliberately excluded.
 */
export function extractOrganizationControllerRoleCodes(controllerCredential: unknown): string[] {
  const subject = extractCredentialSubject(controllerCredential) || {};
  const owner = asObject(subject.owner) || {};
  const canonical = (Array.isArray(owner.additionalType) ? owner.additionalType : [owner.additionalType])
    .map((value) => String(value || '').trim())
    .filter(Boolean);
  if (canonical.length) return canonical;

  return readOccupationEntries(owner.hasOccupation)
    .filter((entry) => String(entry['@type'] || '').toLowerCase() === 'role'
      || readCodedIdentifier(entry).system?.toUpperCase() !== 'ISCO-08')
    .map((entry) => readCodedIdentifier(entry).value)
    .filter((value): value is string => Boolean(value));
}

/** Canonical name for reading controller authority from a service-controller VC. */
export const extractServiceControllerRoleCodes = extractOrganizationControllerRoleCodes;

/**
 * Reads professional ISCO occupations from an ICA-issued controller VC as
 * canonical `ISCO-08|code` tokens.
 */
export function extractOrganizationControllerOccupationCodes(controllerCredential: unknown): string[] {
  const subject = extractCredentialSubject(controllerCredential) || {};
  const owner = asObject(subject.owner) || {};
  const occupation = asObject(owner.hasOccupation);
  const occupationalCategory = occupation?.occupationalCategory;
  const canonical = (Array.isArray(occupationalCategory) ? occupationalCategory : [occupationalCategory])
    .map((value) => {
      if (typeof value === 'string') return value.trim();
      const category = asObject(value) || {};
      const codeValue = String(category.codeValue || '').trim();
      const codeSet = asObject(category.inCodeSet) || {};
      const system = String(codeSet.name || '').trim();
      return codeValue ? `${system || 'ISCO-08'}|${codeValue}` : '';
    })
    .filter(Boolean);
  if (canonical.length) return canonical;

  return readOccupationEntries(owner.hasOccupation)
    .map(readCodedIdentifier)
    .filter((identifier) => identifier.system?.toUpperCase() === 'ISCO-08' && identifier.value)
    .map((identifier) => `ISCO-08|${identifier.value}`);
}

/** Canonical name for reading ISCO occupations from a service-controller VC. */
export const extractServiceControllerOccupationCodes =
  extractOrganizationControllerOccupationCodes;

function extractOrganizationControllerBinding(controllerCredential: unknown): string | undefined {
  const subject = extractCredentialSubject(controllerCredential) || {};
  const owner = asObject(subject.owner) || {};
  return extractCredentialBindingValue(owner.hasCredential);
}

function extractOrganizationControllerProviderTaxId(controllerCredential: unknown): string | undefined {
  const subject = extractCredentialSubject(controllerCredential) || {};
  const provider = asObject(subject.provider) || {};
  const identifier = asObject(provider.identifier);
  return normalizeTaxIdentifier(provider.taxID)
    || normalizeTaxIdentifier(provider.taxId)
    || normalizeTaxIdentifier(identifier?.value);
}

/**
 * Checks whether a role code contains the required code, ignoring prefixes such as `SYSTEM|`.
 *
 * @param roleCode Candidate role code.
 * @param requiredCode Required normalized code, defaults to `RESPRSN`.
 */
export function hasRoleCode(roleCode: string | undefined, requiredCode = 'RESPRSN'): boolean {
  const normalizedRole = String(roleCode || '')
    .trim()
    .toUpperCase()
    .replace(/^.*\|/, '')
    .replace(/^[|:]+/, '');
  const normalizedRequired = String(requiredCode || '').trim().toUpperCase();
  return normalizedRole.includes(normalizedRequired);
}

/**
 * Extracts representative signing/binding continuity data from `credentialSubject.hasCredential`.
 *
 * Security note:
 * - this field proves continuity of the controller signing/binding key
 * - it is intentionally different from `credentialSubject.sameAs`, which
 *   proves continuity of the representative public identity alias (for example
 *   email-derived `urn:multibase:z...`)
 * - production-grade activation flows are strongest when both dimensions are
 *   present in the ICA-issued representative VC
 *
 * Compatibility rules:
 * - legacy VC payloads may still carry `hasCredential.material`
 * - newer payloads may carry the same semantic value in `hasCredential.value`
 *   or `hasCredential.identifier.value`
 *
 * @param representativeCredential Candidate representative credential.
 */
export function extractRepresentativeCredentialBinding(representativeCredential: unknown): string | undefined {
  const subject = extractCredentialSubject(representativeCredential) || {};
  const credentialData = subject.hasCredential;
  if (typeof credentialData === 'string') return credentialData.trim() || undefined;
  if (Array.isArray(credentialData)) {
    for (const item of credentialData) {
      const candidate = extractCredentialBindingValue(item);
      if (candidate) return candidate;
    }
  }
  if (credentialData && typeof credentialData === 'object') {
    const candidate = extractCredentialBindingValue(credentialData);
    if (candidate) return candidate;
  }
  return undefined;
}

function extractCredentialBindingValue(value: unknown): string | undefined {
  const obj = asObject(value) || {};
  const identifier = asObject(obj.identifier);
  const candidate = String(
    obj.material
    || obj.value
    || identifier?.value
    || '',
  ).trim();
  return candidate || undefined;
}

/**
 * Extracts the representative subject identifier from `credentialSubject.id`.
 *
 * ICA currently models the natural person with a stable person URN while the
 * controller/bootstrap continuity is carried in sibling claims:
 * - `sameAs` for public identity continuity
 * - `hasCredential` for key-binding continuity
 *
 * Activation policy must therefore accept the canonical person URN form and
 * must not require a representative `did:web`.
 *
 * @param representativeCredential Candidate representative credential.
 */
export function extractRepresentativeSubjectId(representativeCredential: unknown): string | undefined {
  const obj = asObject(representativeCredential);
  if (!obj) return undefined;
  const subject = extractCredentialSubject(obj);
  const subjectId = String(subject?.id || '').trim();
  return subjectId || undefined;
}

/**
 * Extracts a `did:web:` identifier from a VC-like credential.
 *
 * @param credential Candidate credential.
 */
export function extractDidWebFromCredential(credential: unknown): string | undefined {
  const obj = asObject(credential);
  if (!obj) return undefined;
  const subject = extractCredentialSubject(obj);
  const didCandidate = String(subject?.id || obj.id || '').trim();
  return didCandidate.startsWith('did:web:') ? didCandidate : undefined;
}

/**
 * Checks whether the representative role expresses the activation-controller
 * semantics accepted by GW.
 *
 * The controller/legal-representative authorization is the bare HL7 v3 code
 * `RESPRSN`. ISCO occupation `1120` is not a controller authorization role.
 *
 * @param roleCode Candidate role token extracted from the credential.
 * @param requiredCode Required GW compatibility code, defaults to `RESPRSN`.
 */
export function hasActivationRepresentativeRole(roleCode: string | undefined, requiredCode = 'RESPRSN'): boolean {
  return hasRoleCode(roleCode, requiredCode);
}

/**
 * Extracts the categories authorized by an ICA-issued organization credential.
 *
 * Canonical contract:
 * - `credentialSubject.makesOffer.category`
 *
 * Compatibility fallback:
 * - `credentialSubject.category`
 *
 * Host/operator credentials may authorize every business sector by publishing
 * `*` in the category list.
 */
export function extractAuthorizedServiceCategoriesFromCredential(
  organizationCredential: unknown,
): string[] {
  const subject = extractCredentialSubject(organizationCredential) || {};
  const makesOffer = getCredentialSubjectMakesOffer(organizationCredential) || {};
  return parseServiceCategories(makesOffer.category ?? subject.category);
}

/**
 * Extracts the service capability tokens authorized by an ICA-issued
 * organization credential.
 *
 * Canonical contract:
 * - `credentialSubject.makesOffer.serviceType`
 *
 * Compatibility fallbacks:
 * - `credentialSubject.serviceType`
 * - `credentialSubject.additionalType`
 * - `credentialSubject.makesOffer.additionalType`
 */
export function extractAuthorizedServiceTypesFromCredential(
  organizationCredential: unknown,
): string[] {
  const subject = extractCredentialSubject(organizationCredential) || {};
  const makesOffer = getCredentialSubjectMakesOffer(organizationCredential) || {};
  return parseServiceTypeClaims(
    makesOffer.serviceType ?? subject.serviceType,
    makesOffer.additionalType ?? subject.additionalType,
  );
}

/**
 * Validates that the ICA-issued organization credential authorizes the sector
 * and service capability that GW is about to activate/publish.
 *
 * Contract:
 * - `requiredCategory` must be present in
 *   `credentialSubject.makesOffer.category`
 * - `*` authorizes any requested category
 * - every `requiredServiceType` must be present in the credential capability set
 * - a missing authorization dimension is treated as a hard error because GW
 *   must not activate or publish an unsupported operator/provider profile
 */
export function validateActivationServiceAuthorizationPolicy(input: {
  organizationCredential?: unknown;
  requiredCategory?: string;
  requiredServiceTypes?: ReadonlyArray<string | undefined | null>;
}): ActivationServiceAuthorizationPolicyError[] {
  const errors: ActivationServiceAuthorizationPolicyError[] = [];
  const authorizedCategories = extractAuthorizedServiceCategoriesFromCredential(input.organizationCredential);
  const authorizedServiceTypes = extractAuthorizedServiceTypesFromCredential(input.organizationCredential);
  const requiredCategory = String(input.requiredCategory || '').trim();
  const requiredServiceTypes = Array.from(new Set(
    (input.requiredServiceTypes || [])
      .map((value) => String(value || '').trim())
      .filter(Boolean),
  ));

  if (requiredCategory) {
    if (!authorizedCategories.length) {
      errors.push({
        code: 'MISSING_ORGANIZATION_SERVICE_CATEGORY',
        message: 'ICA-issued organization credential is missing credentialSubject.makesOffer.category authorization.',
      });
    } else if (!authorizedCategories.includes(requiredCategory) && !authorizedCategories.includes('*')) {
      errors.push({
        code: 'UNAUTHORIZED_ORGANIZATION_SERVICE_CATEGORY',
        message: `ICA-issued organization credential does not authorize service category '${requiredCategory}'.`,
      });
    }
  }

  if (requiredServiceTypes.length) {
    if (!authorizedServiceTypes.length) {
      errors.push({
        code: 'MISSING_ORGANIZATION_SERVICE_TYPE',
        message: 'ICA-issued organization credential is missing credentialSubject.makesOffer.serviceType authorization.',
      });
    } else {
      const unauthorized = requiredServiceTypes.filter((serviceType) => !authorizedServiceTypes.includes(serviceType));
      if (unauthorized.length > 0) {
        errors.push({
          code: 'UNAUTHORIZED_ORGANIZATION_SERVICE_TYPE',
          message: `ICA-issued organization credential does not authorize serviceType '${unauthorized[0]}'.`,
        });
      }
    }
  }

  return errors;
}

/**
 * Builds a deterministic member DID under an owner DID namespace.
 *
 * @param ownerDidWeb Owner DID.
 * @param memberId Member identifier fragment.
 * @param roleCode Role code fragment.
 */
export function buildMemberDidWeb(ownerDidWeb: string, memberId: string, roleCode: string): string {
  return `${String(ownerDidWeb).trim()}:member:${String(memberId).trim()}:${String(roleCode).trim()}`;
}

/**
 * Checks whether a member DID is scoped under an owner DID namespace.
 *
 * @param memberDidWeb Candidate member DID.
 * @param ownerDidWeb Owner DID namespace.
 */
export function isMemberDidWebUnderOwner(memberDidWeb: string, ownerDidWeb: string): boolean {
  const did = String(memberDidWeb || '').trim();
  const owner = String(ownerDidWeb || '').trim();
  if (!did.startsWith('did:web:') || !owner.startsWith('did:web:')) return false;
  return did.startsWith(`${owner}:member:`);
}

/**
 * Validates controller authorization for organization activation.
 *
 * Canonical three-credential flow:
 * - `LegalRepresentativeCredential` proves legal representation and carries
 *   the representative's professional ISCO occupation
 * - `ServiceControllerCredential` independently carries `RESPRSN` in
 *   `owner.additionalType` and `owner.hasCredential.material` for the
 *   controller actor key
 *
 * Legacy two-credential compatibility is deliberately narrow. When no
 * no service-controller credential exists, the representative credential is
 * accepted as the controller proof only if that old credential itself carries
 * both `RESPRSN` and `hasCredential` binding material. A modern representative
 * credential containing only an ISCO occupation such as `ISCO-08|1120` is not
 * promoted to controller and fails this policy.
 *
 * @param input.organizationCredential Candidate organization credential.
 * @param input.representativeCredential Legal-representative credential.
 * @param input.controllerCredential Canonical controller-authority credential.
 * @param input.requiredRoleCode Required controller role, defaults to `RESPRSN`.
 */
export function validateActivationRepresentativePolicy(input: {
  organizationCredential?: unknown;
  representativeCredential?: unknown;
  controllerCredential?: unknown;
  requiredRoleCode?: string;
}): ActivationRepresentativePolicyError[] {
  const errors: ActivationRepresentativePolicyError[] = [];
  const representativeSubjectId = input.representativeCredential
    ? extractRepresentativeSubjectId(input.representativeCredential)
    : undefined;

  if (input.representativeCredential && !representativeSubjectId) {
    errors.push({
      code: 'MISSING_REPRESENTATIVE_SUBJECT_ID',
      message: 'ICA-issued representative credential is missing credentialSubject.id.',
    });
  }

  const orgTax = extractOrganizationTaxId(input.organizationCredential);
  if (input.representativeCredential) {
    const repTax = extractRepresentativeMemberOfTaxId(input.representativeCredential);
    if (orgTax && repTax && orgTax !== repTax) {
      errors.push({
        code: 'REPRESENTATIVE_TAXID_MISMATCH',
        message: 'ICA-issued representative credential memberOf.taxID must match organization credential taxID.',
      });
    }
  }

  if (input.controllerCredential) {
    const controllerTax = extractOrganizationControllerProviderTaxId(input.controllerCredential);
    if (orgTax && controllerTax && orgTax !== controllerTax) {
      errors.push({
        code: 'CONTROLLER_TAXID_MISMATCH',
        message: 'ICA-issued controller credential provider.taxID must match organization credential taxID.',
      });
    }
    const controllerRoles = extractOrganizationControllerRoleCodes(input.controllerCredential);
    if (!controllerRoles.some((role) => hasActivationRepresentativeRole(role, input.requiredRoleCode || 'RESPRSN'))) {
      errors.push({
        code: 'MISSING_CONTROLLER_ROLE_RESPRSN',
        message: 'ICA-issued service controller credential must include RESPRSN in credentialSubject.owner.additionalType.',
      });
    }
    if (!extractOrganizationControllerBinding(input.controllerCredential)) {
      errors.push({
        code: 'MISSING_CONTROLLER_CREDENTIAL_BINDING',
        message: 'ICA-issued service controller credential is missing credentialSubject.owner.hasCredential binding data.',
      });
    }
    return errors;
  }

  if (!input.representativeCredential) return errors;

  const roleCode = extractRepresentativeRoleCode(input.representativeCredential);
  if (!hasActivationRepresentativeRole(roleCode, input.requiredRoleCode || 'RESPRSN')) {
    errors.push({
      code: 'MISSING_REPRESENTATIVE_ROLE_RESPRSN',
      message: 'ICA-issued representative credential must include controller role RESPRSN in credentialSubject.hasOccupation.',
    });
  }

  const binding = extractRepresentativeCredentialBinding(input.representativeCredential);
  if (!binding) {
    errors.push({
      code: 'MISSING_REPRESENTATIVE_CREDENTIAL_BINDING',
      message: 'ICA-issued representative credential is missing credentialSubject.hasCredential binding data (material, value, or identifier.value).',
    });
  }
  return errors;
}
