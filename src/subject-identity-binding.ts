// Copyright 2026 Antifraud Services Inc. under the Apache License, Version 2.0.

import {
  IndividualCredentialTypes,
  W3cCredentialContexts,
  W3cCredentialTypes,
} from './identity-credential-contracts.js';
import {
  SubjectIdentityBindingClaims,
  type SubjectIdentityBindingMatchCriteria,
  type SubjectIdentityBindingSummary,
} from './subject-identity-binding-contract.js';
import type { VerifiableCredentialV2 } from 'antifraud-data-utils-ts/credential-contracts';
import { getVpCredentials } from './vp-token.js';

function uniqueStrings(value: unknown): string[] {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return Array.from(new Set(
    values.map((item) => String(item || '').trim()).filter(Boolean),
  ));
}

function isDidWeb(value: string): boolean {
  return /^did:web:[^:\s]+(?::[^:\s]+)*$/.test(value);
}

function isPhysicalSupportDid(value: string): boolean {
  const segments = value.toLowerCase().split(':');
  return segments.includes('card');
}

function isIndividualIdentityDid(value: string): boolean {
  return isDidWeb(value) && !isPhysicalSupportDid(value);
}

function includesCredentialType(credential: any): boolean {
  const types = uniqueStrings(credential?.type);
  return types.includes(IndividualCredentialTypes.SubjectIdentityBindingCredential);
}

function normalizeNow(input?: string | Date): number {
  if (input instanceof Date) return input.getTime();
  if (input) return new Date(input).getTime();
  return Date.now();
}

/**
 * Builds the unsigned JSON form of a subject identity binding VC.
 *
 * This helper only builds the canonical payload. The issuer must sign it using
 * the normal VC/VP signing flow before a verifier treats it as evidence.
 */
export function buildSubjectIdentityBindingCredential(input: Readonly<{
  issuerDid: string;
  subjectDid: string;
  aliasDids: readonly string[];
  sectors: readonly string[];
  validFrom: string;
  validUntil?: string;
  id?: string;
}>): VerifiableCredentialV2 {
  const issuerDid = String(input.issuerDid || '').trim();
  const subjectDid = String(input.subjectDid || '').trim();
  const aliasDids = uniqueStrings(input.aliasDids).filter((did) => did !== subjectDid);
  const sectors = uniqueStrings(input.sectors);
  if (!isDidWeb(issuerDid)) throw new Error('issuerDid must be a did:web identifier.');
  if (!isIndividualIdentityDid(subjectDid)) {
    throw new Error('subjectDid must be a did:web individual identifier, not a physical support DID.');
  }
  if (aliasDids.length === 0 || aliasDids.some((did) => !isIndividualIdentityDid(did))) {
    throw new Error('aliasDids must contain at least one distinct did:web individual identifier and no physical support DID.');
  }
  if (sectors.length === 0) throw new Error('sectors must contain at least one sector.');
  if (!String(input.validFrom || '').trim() || Number.isNaN(Date.parse(input.validFrom))) {
    throw new Error('validFrom must be an ISO date-time.');
  }
  if (input.validUntil && Number.isNaN(Date.parse(input.validUntil))) {
    throw new Error('validUntil must be an ISO date-time.');
  }

  return {
    '@context': [W3cCredentialContexts.V2],
    ...(input.id ? { id: String(input.id).trim() } : {}),
    type: [
      W3cCredentialTypes.VerifiableCredential,
      IndividualCredentialTypes.SubjectIdentityBindingCredential,
    ],
    issuer: issuerDid,
    validFrom: String(input.validFrom).trim(),
    ...(input.validUntil ? { validUntil: String(input.validUntil).trim() } : {}),
    credentialSubject: {
      [SubjectIdentityBindingClaims.SubjectId]: subjectDid,
      [SubjectIdentityBindingClaims.SameAs]: aliasDids,
      [SubjectIdentityBindingClaims.Sector]: sectors,
    },
  };
}

/** Returns the normalized identity set asserted by one binding VC. */
export function summarizeSubjectIdentityBinding(
  credential: unknown,
): SubjectIdentityBindingSummary | undefined {
  if (!credential || typeof credential !== 'object' || !includesCredentialType(credential)) return undefined;
  const source = credential as any;
  const issuerDid = String(source.issuer?.id || source.issuer || '').trim();
  const subject = source.credentialSubject || {};
  const subjectDid = String(subject[SubjectIdentityBindingClaims.SubjectId] || '').trim();
  const aliasDids = uniqueStrings(subject[SubjectIdentityBindingClaims.SameAs])
    .filter((did) => did !== subjectDid);
  const sectors = uniqueStrings(subject[SubjectIdentityBindingClaims.Sector]);
  if (!isDidWeb(issuerDid) || !isIndividualIdentityDid(subjectDid) || aliasDids.length === 0) return undefined;
  if (aliasDids.some((did) => !isIndividualIdentityDid(did)) || sectors.length === 0) return undefined;
  return {
    issuerDid,
    subjectDid,
    aliasDids,
    sectors,
    validFrom: String(source.validFrom || '').trim() || undefined,
    validUntil: String(source.validUntil || '').trim() || undefined,
  };
}

/** Checks issuer trust, validity, sector and exact DID membership. */
export function matchesSubjectIdentityBinding(
  summary: SubjectIdentityBindingSummary | undefined,
  criteria: SubjectIdentityBindingMatchCriteria,
): boolean {
  if (!summary) return false;
  if (!criteria.trustedIssuerDids.includes(summary.issuerDid)) return false;
  const now = normalizeNow(criteria.now);
  if (Number.isNaN(now)) return false;
  if (summary.validFrom) {
    const start = Date.parse(summary.validFrom);
    if (Number.isNaN(start) || start > now) return false;
  }
  if (summary.validUntil) {
    const end = Date.parse(summary.validUntil);
    if (Number.isNaN(end) || end < now) return false;
  }
  if (criteria.sector && !summary.sectors.includes(criteria.sector)) return false;
  const identities = new Set([summary.subjectDid, ...summary.aliasDids]);
  const required = uniqueStrings(criteria.requiredSubjectDids);
  return required.length > 0 && required.every((did) => identities.has(did));
}

/**
 * Finds a matching binding credential in an already-verified VP token.
 *
 * This function decodes and matches claims; it does not verify signatures.
 * Callers must first verify the enclosing VP/VC proof chain.
 */
export function getMatchingSubjectIdentityBindingFromVpToken(
  vpToken: string,
  criteria: SubjectIdentityBindingMatchCriteria,
): SubjectIdentityBindingSummary | undefined {
  for (const credential of getVpCredentials(vpToken)) {
    const summary = summarizeSubjectIdentityBinding(credential);
    if (matchesSubjectIdentityBinding(summary, criteria)) return summary;
  }
  return undefined;
}

export * from './subject-identity-binding-contract.js';
