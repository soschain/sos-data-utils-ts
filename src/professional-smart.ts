import { SchemaOrgPersonClaim as PersonClaim } from 'antifraud-data-utils-ts/schema-org-claims';
import {
  ProfessionalCredentialTypes,
  W3cCredentialTypes,
} from './identity-credential-contracts.js';
import { normalizeIdentityAliasCsv as normalizeSameAsHashCsv, normalizeIdentityAliases as normalizeSameAsHashList, normalizeIdentityTelephone as normalizeTelephoneHash } from './identity-aliases.js';
import { buildUnsignedVpJwt } from './jwt.js';
import { getVpCredentials } from './vp-token.js';

export type ProfessionalEmployeeCredentialInput = Readonly<{
  actorDid: string;
  role: string;
  email?: string;
  sameAs?: string | readonly string[];
  telephone?: string;
  credentialMaterial?: string;
  additionalCredentialSubject?: Record<string, unknown>;
  additionalCredential?: Record<string, unknown>;
}>;

export type ProfessionalSmartVpPayloadInput = Readonly<{
  clientId: string;
  actorDid: string;
  role: string;
  email?: string;
  sameAs?: string | readonly string[];
  telephone?: string;
  credentialMaterial?: string;
  verifiableCredential?: string | Record<string, unknown> | ReadonlyArray<string | Record<string, unknown>>;
  additionalVp?: Record<string, unknown>;
  additionalPayload?: Record<string, unknown>;
}>;

/** Identity fields read from an already-verified professional credential. */
export type ProfessionalCredentialSummary = Readonly<{
  actorDid: string;
  role: string;
  issuerDid?: string;
  sameAs: string[];
}>;

/**
 * Returns the normalized public continuity aliases for one professional
 * identity VC.
 *
 * The canonical source is:
 * - explicit `sameAs` values when present
 * - otherwise the public employee email
 *
 * When both are present they are merged and deduplicated after normalization.
 * Plain emails become ICA-compatible
 * `urn:multibase:<base58btc(multihash(SHA3-256))>` values. The multibase
 * payload is the same value used in the professional DID actor path; `sameAs`
 * adds only the `urn:multibase:` prefix.
 *
 * @param input Professional identity source values.
 */
export function getProfessionalIdentitySameAs(
  input: Readonly<Pick<ProfessionalEmployeeCredentialInput, 'sameAs' | 'email'>>,
): string[] {
  const sameAsCandidates: string[] = [];
  if (input.sameAs) {
    sameAsCandidates.push(...normalizeSameAsHashList(input.sameAs));
  }
  if (input.email) {
    sameAsCandidates.push(...normalizeSameAsHashList(input.email));
  }
  return [...new Set(sameAsCandidates)];
}

/**
 * Returns the normalized public telephone continuity value for one
 * professional identity VC.
 *
 * Telephone continuity is kept separate from `sameAs` so callers can reuse
 * ICA-compatible hashing without overloading the public alias slot.
 *
 * @param input Professional identity source values.
 */
export function getProfessionalIdentityTelephone(
  input: Readonly<Pick<ProfessionalEmployeeCredentialInput, 'telephone'>>,
): string | undefined {
  const normalized = normalizeTelephoneHash(String(input.telephone || ''));
  return normalized || undefined;
}

/**
 * Builds the canonical professional identity VC payload reused by SMART VP
 * token helpers and higher SDK facades.
 *
 * Current projection rules:
 * - `credentialSubject.sameAs` stores one CSV string to preserve compatibility
 *   with the current flat/shared claim style
 * - `credentialSubject.telephone` stores the hashed public phone continuity
 *   value when present
 * - `credentialSubject.hasCredential.material` carries the public signing/bind
 *   material when present
 *
 * @param input Professional identity source values.
 */
export function getProfessionalIdentityVC(
  input: ProfessionalEmployeeCredentialInput,
): Record<string, unknown> {
  const normalizedSameAs = getProfessionalIdentitySameAs(input);
  const normalizedTelephone = getProfessionalIdentityTelephone(input);
  const normalizedCredentialMaterial = String(input.credentialMaterial || '').trim();
  const canonicalCredentialSubject = {
    id: String(input.actorDid || '').trim(),
    hasOccupation: String(input.role || '').trim(),
    ...(normalizedSameAs.length
      ? { sameAs: normalizeSameAsHashCsv(normalizedSameAs) }
      : {}),
    ...(normalizedTelephone
      ? { [PersonClaim.Telephone]: normalizedTelephone }
      : {}),
    ...(normalizedCredentialMaterial
      ? { [PersonClaim.HasCredentialMaterial]: normalizedCredentialMaterial }
      : {}),
  };

  return {
    type: [
      W3cCredentialTypes.VerifiableCredential,
      ProfessionalCredentialTypes.EmployeeCredential,
    ],
    credentialSubject: {
      ...canonicalCredentialSubject,
      ...(input.additionalCredentialSubject || {}),
    },
    ...(input.additionalCredential || {}),
  };
}

/**
 * Reads the actor and role asserted by one professional credential. Signature
 * and employer/issuer trust verification belongs to the enclosing VP verifier.
 */
export function summarizeProfessionalIdentityCredential(
  credential: unknown,
): ProfessionalCredentialSummary | undefined {
  const source = credential as any;
  const types = Array.isArray(source?.type) ? source.type.map(String) : [String(source?.type || '')];
  if (!types.includes(ProfessionalCredentialTypes.EmployeeCredential)) return undefined;
  const subject = source?.credentialSubject || {};
  const actorDid = String(subject.id || '').trim();
  const role = String(subject.hasOccupation || '').trim();
  if (!actorDid || !role) return undefined;
  const issuerDid = String(source?.issuer?.id || source?.issuer || '').trim();
  return {
    actorDid,
    role,
    ...(issuerDid ? { issuerDid } : {}),
    sameAs: normalizeSameAsHashList(subject.sameAs),
  };
}

/** Finds the exact actor and role in an already-verified professional VP. */
export function getMatchingProfessionalCredentialFromVpToken(
  vpToken: string,
  criteria: Readonly<{ actorDid: string; role: string }>,
): ProfessionalCredentialSummary | undefined {
  const actorDid = String(criteria.actorDid || '').trim();
  const role = String(criteria.role || '').trim().toLowerCase();
  return getVpCredentials(vpToken)
    .map(summarizeProfessionalIdentityCredential)
    .find((summary): summary is ProfessionalCredentialSummary => Boolean(
      summary
      && summary.actorDid === actorDid
      && summary.role.toLowerCase() === role,
    ));
}

/**
 * Backwards-compatible alias kept for existing SMART demo callers.
 *
 * @param input Professional identity source values.
 */
export function buildProfessionalEmployeeCredential(
  input: ProfessionalEmployeeCredentialInput,
): Record<string, unknown> {
  return getProfessionalIdentityVC(input);
}

/**
 * Builds one SMART/OpenID4VP payload for the current professional identity
 * contract.
 *
 * When no credential is supplied explicitly, the payload embeds the canonical
 * professional identity VC built from the current actor identity input.
 *
 * @param input SMART/OpenID4VP actor payload input.
 */
export function buildProfessionalSmartVpPayload(
  input: ProfessionalSmartVpPayloadInput,
): Record<string, unknown> {
  const credentials = Array.isArray(input.verifiableCredential)
    ? [...input.verifiableCredential]
      : input.verifiableCredential
        ? [input.verifiableCredential]
      : [getProfessionalIdentityVC({
        actorDid: input.actorDid,
        role: input.role,
        email: input.email,
        sameAs: input.sameAs,
        telephone: input.telephone,
        credentialMaterial: input.credentialMaterial,
      })];

  return {
    ...(input.additionalPayload || {}),
    vp: {
      holder: String(input.clientId || '').trim(),
      verifiableCredential: credentials,
      ...(input.additionalVp || {}),
    },
  };
}

/**
 * Alias that makes the VC/VP naming more explicit for consumers that want one
 * identity-oriented surface rather than the historical SMART-specific helper
 * names.
 *
 * @param input SMART/OpenID4VP actor payload input.
 */
export function buildProfessionalIdentityVpPayload(
  input: ProfessionalSmartVpPayloadInput,
): Record<string, unknown> {
  return buildProfessionalSmartVpPayload(input);
}

/**
 * Builds one unsigned compact VP JWT for the canonical professional identity
 * payload.
 *
 * @param input SMART/OpenID4VP actor payload input.
 * @param options Optional unsigned JWT timing controls.
 */
export function buildUnsignedProfessionalSmartVpJwt(
  input: ProfessionalSmartVpPayloadInput,
  options: Readonly<{ nowSeconds?: number; ttlSeconds?: number; nonce?: string }> = {},
): string {
  return buildUnsignedVpJwt(buildProfessionalSmartVpPayload(input), options);
}

/**
 * Alias that makes the unsigned identity VP helper explicit for shared SDK
 * facades.
 *
 * @param input SMART/OpenID4VP actor payload input.
 * @param options Optional unsigned JWT timing controls.
 */
export function buildUnsignedProfessionalIdentityVpJwt(
  input: ProfessionalSmartVpPayloadInput,
  options: Readonly<{ nowSeconds?: number; ttlSeconds?: number; nonce?: string }> = {},
): string {
  return buildUnsignedProfessionalSmartVpJwt(input, options);
}
