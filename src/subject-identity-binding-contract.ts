// Copyright 2026 Antifraud Services Inc. under the Apache License, Version 2.0.

/** Canonical JSON members of a subject identity binding credential. */
export const SubjectIdentityBindingClaims = Object.freeze({
  SubjectId: 'id',
  SameAs: 'sameAs',
  Sector: 'sector',
});

/** Normalized, security-relevant projection of a subject identity binding VC. */
export type SubjectIdentityBindingSummary = Readonly<{
  issuerDid: string;
  subjectDid: string;
  aliasDids: readonly string[];
  sectors: readonly string[];
  validFrom?: string;
  validUntil?: string;
}>;

/** Criteria used by a verifier after the enclosing VP has been verified. */
export type SubjectIdentityBindingMatchCriteria = Readonly<{
  trustedIssuerDids: readonly string[];
  requiredSubjectDids: readonly string[];
  sector?: string;
  now?: string | Date;
}>;
