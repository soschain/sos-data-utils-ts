// Copyright 2026 Antifraud Services Inc. under the Apache License, Version 2.0.

/** HL7 ActReason break-the-glass privilege used by this read-only profile. */
export const SmartEmergencyPrivilege = 'BTG' as const;

/** Extension members carried inside an RFC 7662/9701 introspection result. */
export const SmartIntrospectionExtensionFields = Object.freeze({
  /** OpenID4VP presentation transport member; its value retains its native format. */
  VpToken: 'vp_token',
} as const);

/** VC Data Model 2.0 media types for JOSE-secured presentations. */
export const VerifiablePresentationMediaTypes = Object.freeze({
  Jwt: 'application/vp+jwt',
} as const);

export type FhirEmergencyAuthorizationDetail = Readonly<{
  type: string;
  actions: readonly ['read'];
  datatypes: readonly string[];
  identifier: string;
  privileges: readonly [typeof SmartEmergencyPrivilege];
}>;

export type BuildFhirEmergencyAuthorizationDetailsInput = Readonly<{
  /** Collision-resistant RFC 9396 type URI owned by the applicable domain profile. */
  authorizationDetailType: string;
  /** Stable subject identifier governed by the emergency decision. */
  subject: string;
  /** Granted read-only SMART scopes from which FHIR resource types are projected. */
  scopes: readonly string[];
}>;

function readScopeDatatype(scope: string): string | undefined {
  const head = String(scope || '').trim().split('?', 1)[0] || '';
  const slash = head.indexOf('/');
  const dot = head.lastIndexOf('.');
  if (slash < 0 || dot <= slash + 1) return undefined;
  const permission = head.slice(dot + 1).toLowerCase();
  if (permission !== 'r' && permission !== 'rs') return undefined;
  const datatype = head.slice(slash + 1, dot).trim();
  return datatype || undefined;
}

/**
 * Builds the RFC 9396 representation of one read-only FHIR emergency grant.
 *
 * Only RFC 9396 common member names are emitted. Incident, Consent and audit
 * identifiers remain server-side evidence correlated by the access-token
 * `jti`; they are deliberately not copied into private flat JWT claims.
 */
export function buildFhirEmergencyAuthorizationDetails(
  input: BuildFhirEmergencyAuthorizationDetailsInput,
): readonly [FhirEmergencyAuthorizationDetail] {
  const authorizationDetailType = String(input.authorizationDetailType || '').trim();
  try {
    if (!authorizationDetailType || !new URL(authorizationDetailType).protocol) throw new Error();
  } catch {
    throw new Error('authorization_detail_type_uri_required');
  }
  const subject = String(input.subject || '').trim();
  if (!subject) throw new Error('emergency_subject_required');
  const datatypes = Array.from(new Set(input.scopes.map(readScopeDatatype).filter(
    (value): value is string => Boolean(value),
  )));
  if (datatypes.length === 0 || datatypes.length !== input.scopes.length) {
    throw new Error('read_only_smart_scope_required');
  }
  return [{
    type: authorizationDetailType,
    actions: ['read'],
    datatypes,
    identifier: subject,
    privileges: [SmartEmergencyPrivilege],
  }];
}

export type VerifiablePresentationJwtPayloadResult = Readonly<{
  presentation: Readonly<Record<string, unknown>>;
  format: 'vc-data-model-2.0' | 'legacy-jwt-vp';
}>;

function isPresentation(value: unknown): value is Readonly<Record<string, unknown>> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const type = (value as Record<string, unknown>).type;
  const types = Array.isArray(type) ? type : [type];
  return types.some((entry) => String(entry || '') === 'VerifiablePresentation');
}

/**
 * Reads a verified JOSE payload without confusing transport and data model.
 *
 * VC Data Model 2.0 `application/vp+jwt` encodes the presentation directly as
 * the JWT Claims Set and forbids a wrapper claim named `vp`. The historical
 * JWT-VP wrapper remains readable only as an explicitly reported compatibility
 * format so callers can measure and eventually remove it.
 */
export function readVerifiablePresentationJwtPayload(
  payload: unknown,
): VerifiablePresentationJwtPayloadResult {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('invalid_verifiable_presentation_payload');
  }
  const record = payload as Record<string, unknown>;
  const legacyVp = record.vp;
  const hasDirectPresentation = isPresentation(record);
  const hasLegacyPresentation = isPresentation(legacyVp);
  if (hasDirectPresentation && 'vp' in record) {
    throw new Error('ambiguous_verifiable_presentation_payload');
  }
  if (hasDirectPresentation) {
    return { presentation: record, format: 'vc-data-model-2.0' };
  }
  if (hasLegacyPresentation) {
    return { presentation: legacyVp, format: 'legacy-jwt-vp' };
  }
  throw new Error('invalid_verifiable_presentation_payload');
}
