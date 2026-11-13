// Copyright 2026 Antifraud Services Inc. under the Apache License, Version 2.0.

import type {
  ActiveConsentView,
  ConsentActorDescriptor,
  ConsentActorKind,
  ConsentCoverageRequest,
  ConsentMatchKind,
  ConsentRuleMatch,
  EffectiveAccessEvaluation,
  MissingPermissionSet,
  NormalizedConsentTarget,
  ResolvedConsentActor,
} from './consent-access.js';
import { ClaimConsent, ConsentStatuses, type ConsentRule } from 'fhir-data-utils-ts';

/**
 * Legacy structured actor selector kept for backwards compatibility while the
 * SDK converges on the canonical flat consent actor identifier contract.
 */
export type ConsentActorTargetInput = {
  /** Canonical actor identifier fallback when the caller already has it. */
  identifier?: string;
  /** Preferred URL/domain alias for organization actor resolution. */
  url?: string;
  /** Legacy alias maintained for backwards compatibility. */
  didWeb?: string;
  /** Legacy alias maintained for backwards compatibility. */
  organizationUrl?: string;
  /** Legacy alias maintained for backwards compatibility. */
  organizationTaxId?: string;
  /** Legacy alias maintained for backwards compatibility. */
  email?: string;
  /** Legacy alias maintained for backwards compatibility. */
  phone?: string;
};

/**
 * A canonical consent actor input accepted by the shared SDK helpers.
 *
 * Supported token forms:
 * - `did:...`
 * - `a verified email`
 * Use verified normalized actor contacts supplied by the calling host.
 * - `ES`
 * - comma-separated lists such as `did:web:a,a verified email,ES`
 *
 * Arrays are normalized into the same comma-separated canonical string form.
 * Legacy structured objects remain accepted for backwards compatibility.
 */
export type ConsentActorInput = string | string[] | ConsentActorTargetInput;

export type SubjectIdentifierInput = {
  // Domain model note: in business flows this can represent the member DID
  // of a personal organization (subject/person/patient), even if the wire
  // claim key remains `Consent.subject` for FHIR compatibility.
  subjectDid?: string;
  subjectPhone?: string;
  subjectGivenName?: string;
};

export type BuildConsentClaimsSimpleInput = SubjectIdentifierInput & {
  /**
   * Canonical consent actor selector.
   *
 * Prefer passing a canonical string or string list instead of the legacy
 * structured object. The normalized value becomes the flat
 * `Consent.actor-identifier` claim expected by CORE GW.
   */
  actor: ConsentActorInput;
  actorRole: string;
  purpose: string;
  actions: string[];
  consentIdentifier?: string;
  consentDate?: string;
  /**
   * Upper bound for the grant, serialized as `Consent.period-end`. Access is
   * inactive at and after this instant.
   *
   * Use an ISO 8601 date or date-time. A date-time with an explicit timezone
   * is recommended when the caller offers access until a specific hour.
   */
  periodEnd?: string;
  decision?: 'permit' | 'deny';
  /** Stable identifier/thread of the permission request that caused this decision. */
  eventBasedOn?: string;
  /** Canonical Communication reference for the permission request being answered. */
  sourceReference?: string;
  attachmentContentType?: string;
  attachmentBase64?: string;
};

export type BuildConsentClaimsSimpleOptions = {
  errorPrefix?: string;
  consentIdentifierFactory?: () => string;
};

export type ConsentClaimsSimpleResult = {
  actorIdentifier: string;
  subjectIdentifier: string;
  consentClaims: Record<string, unknown>;
};

export type ConsentClaimsWithCidResult = ConsentClaimsSimpleResult & {
  claimsCid: string;
};

export type ParsedConsentActorTokenKind =
  | 'did'
  | 'email'
  | 'phone'
  | 'country';

export type ParsedConsentActorToken = {
  kind: ParsedConsentActorTokenKind;
  value: string;
};

/**
 * Normalizes a phone string into a compact token form.
 *
 * @param value Raw phone-like input.
 */
export function normalizePhone(value: string): string {
  return String(value || '').replace(/[^\d+]/g, '');
}

/**
 * Normalizes arbitrary identifier text into a lowercase token-safe fragment.
 *
 * @param value Raw identifier text.
 */
export function normalizeIdentifierToken(value: string): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function withPrefix(prefix: string | undefined, message: string): string {
  return prefix ? `${prefix} ${message}` : message;
}

/**
 * Returns whether a Consent period boundary is an ISO 8601 calendar date or
 * an absolute date-time carrying `Z` or an explicit numeric timezone.
 *
 * Date-only values remain supported for compatibility. Applications offering
 * access until a specific hour should always send an absolute date-time.
 */
export function isValidConsentPeriodBoundary(value: string): boolean {
  const normalized = String(value || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?(?:Z|[+-]\d{2}:\d{2}))?$/.test(normalized)) {
    return false;
  }
  const [year, month, day] = normalized.slice(0, 10).split('-').map(Number);
  const calendarDate = new Date(Date.UTC(year, month - 1, day));
  if (calendarDate.getUTCFullYear() !== year
    || calendarDate.getUTCMonth() !== month - 1
    || calendarDate.getUTCDate() !== day) {
    return false;
  }
  return !Number.isNaN(Date.parse(normalized));
}

/**
 * Parses a single canonical consent actor token into its resolved kind/value.
 *
 * @param rawToken Raw actor token such as `did:...`, `a verified email`,
 * Use verified normalized actor contacts supplied by the calling host.
 * `urn:iso:3166-2:CA-BC`.
 * @returns The normalized parsed token or `undefined` when the token cannot be resolved.
 */
export function parseConsentActorToken(rawToken: string): ParsedConsentActorToken | undefined {
  const token = String(rawToken || '').trim();
  if (!token) return undefined;

  if (token.startsWith('did:')) {
    return { kind: 'did', value: token };
  }

  const email = token.toLowerCase();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { kind: 'email', value: email };
  }

  if (/^tel:/i.test(token)) {
    const normalizedPhone = normalizePhone(token.slice(4));
    if (normalizedPhone) return { kind: 'phone', value: `tel:${normalizedPhone}` };
  }

  if (/^[A-Z]{2}$/.test(token)) {
    return { kind: 'country', value: token };
  }

  const isoCountry = token.match(/^urn:iso:3166:([a-z]{2})$/i);
  if (isoCountry) {
    return { kind: 'country', value: `urn:iso:3166:${isoCountry[1].toUpperCase()}` };
  }

  const isoSubdivision = token.match(/^urn:iso:3166-2:([a-z]{2}-[a-z0-9]{1,3})$/i);
  if (isoSubdivision) {
    return { kind: 'country', value: `urn:iso:3166-2:${isoSubdivision[1].toUpperCase()}` };
  }

  return undefined;
}

/**
 * Normalizes a consent actor input into a list of canonical actor tokens.
 *
 * The output preserves input order while removing empty and duplicate tokens.
 * Legacy structured actor inputs are still supported as a compatibility layer.
 *
 * @param actor Consent actor input in canonical or legacy form.
 * @param options.errorPrefix Optional error prefix.
 * @throws When no valid actor token can be resolved from the input.
 */
export function normalizeConsentActors(
  actor: ConsentActorInput,
  options: { errorPrefix?: string } = {},
): string[] {
  const rawTokens: string[] = [];

  if (typeof actor === 'string') {
    rawTokens.push(...actor.split(','));
  } else if (Array.isArray(actor)) {
    for (const item of actor) rawTokens.push(...String(item || '').split(','));
  } else if (actor && typeof actor === 'object') {
    const legacy = actor as ConsentActorTargetInput;
    const identifier = String(legacy.identifier || '').trim();
    if (identifier) rawTokens.push(identifier);

    const didWeb = String(legacy.didWeb || '').trim();
    if (didWeb) rawTokens.push(didWeb);

    const orgUrl = String(legacy.url || legacy.organizationUrl || '').trim();
    if (orgUrl) {
      try {
        const parsed = orgUrl.includes('://') ? new URL(orgUrl) : new URL(`https://${orgUrl}`);
        if (parsed.hostname) rawTokens.push(`did:web:${parsed.hostname.toLowerCase()}`);
      } catch {
        // Ignore malformed URL and continue with other fallbacks.
      }
    }

    const email = String(legacy.email || '').trim();
    if (email) rawTokens.push(email);

    const phone = normalizePhone(String(legacy.phone || ''));
    if (phone) rawTokens.push(`tel:${phone}`);
  }

  const normalized: string[] = [];
  const seen = new Set<string>();
  for (const rawToken of rawTokens) {
    const parsed = parseConsentActorToken(rawToken);
    if (!parsed) continue;
    if (!seen.has(parsed.value)) {
      seen.add(parsed.value);
      normalized.push(parsed.value);
    }
  }

  if (normalized.length === 0) {
    throw new Error(withPrefix(options.errorPrefix, 'Consent.actor-identifier input is required and must contain at least one resolvable token (did, email, tel, or country code).'));
  }

  return normalized;
}

/**
 * Resolves the canonical consent actor string used in consent claims.
 *
 * The resulting value is always a comma-separated canonical string, even when
 * the caller provides an array or a legacy structured object.
 *
 * @param actor Consent actor input in canonical or legacy form.
 * @param options.errorPrefix Optional error prefix.
 */
export function resolveActorIdentifier(
  actor: ConsentActorInput,
  options: { errorPrefix?: string } = {},
): string {
  return normalizeConsentActors(actor, options).join(',');
}

/**
 * Resolves the canonical subject identifier used in consent claims.
 *
 * @param input Subject identification inputs.
 * @param options.errorPrefix Optional error prefix.
 */
export function resolveSubjectIdentifier(
  input: SubjectIdentifierInput,
  options: { errorPrefix?: string } = {},
): string {
  const did = String(input?.subjectDid || '').trim();
  if (did) return did;

  const phone = normalizePhone(String(input?.subjectPhone || ''));
  const given = normalizeIdentifierToken(String(input?.subjectGivenName || ''));
  if (phone && given) return `urn:person:phone:${phone}:given:${given}`;

  throw new Error(withPrefix(options.errorPrefix, 'grantProfessionalAccessSimple requires subjectDid or (subjectPhone + subjectGivenName).'));
}

/**
 * Builds an active consent-approval claims object from simple business
 * inputs. Draft permission requests use the separate draft Bundle builder.
 *
 * @param input Consent actor/subject/business data.
 * @param options.errorPrefix Optional error prefix.
 * @param options.consentIdentifierFactory Optional fallback identifier factory.
 */
export function buildConsentClaimsSimple(
  input: BuildConsentClaimsSimpleInput,
  options: BuildConsentClaimsSimpleOptions = {},
): ConsentClaimsSimpleResult {
  const actorIdentifier = resolveActorIdentifier(input.actor, { errorPrefix: options.errorPrefix });
  const subjectIdentifier = resolveSubjectIdentifier(input, { errorPrefix: options.errorPrefix });

  const consentDate = String(input.consentDate || '').trim() || new Date().toISOString().slice(0, 10);
  const periodEnd = String(input.periodEnd || '').trim();
  if (periodEnd && !isValidConsentPeriodBoundary(periodEnd)) {
    throw new Error(withPrefix(options.errorPrefix, 'periodEnd must be a valid ISO 8601 date or date-time.'));
  }
  const consentIdentifier = String(input.consentIdentifier || '').trim() || String(options.consentIdentifierFactory?.() || '').trim();
  if (!consentIdentifier) {
    throw new Error(withPrefix(options.errorPrefix, 'consentIdentifier is required when no consentIdentifierFactory is provided.'));
  }

  return {
    actorIdentifier,
    subjectIdentifier,
    consentClaims: {
      '@context': 'org.hl7.fhir.api',
      [ClaimConsent.status]: ConsentStatuses.Active,
      [ClaimConsent.decision]: input.decision || 'permit',
      [ClaimConsent.subject]: subjectIdentifier,
      [ClaimConsent.identifier]: consentIdentifier,
      [ClaimConsent.date]: consentDate,
      ...(periodEnd ? { [ClaimConsent.periodEnd]: periodEnd } : {}),
      [ClaimConsent.purpose]: input.purpose,
      [ClaimConsent.action]: (input.actions || []).join(','),
      [ClaimConsent.actorIdentifier]: actorIdentifier,
      [ClaimConsent.actorRole]: input.actorRole,
      ...(String(input.eventBasedOn || '').trim()
        ? { [ClaimConsent.eventBasedOn]: String(input.eventBasedOn).trim() }
        : {}),
      ...(String(input.sourceReference || '').trim()
        ? { [ClaimConsent.sourceReference]: String(input.sourceReference).trim() }
        : {}),
      [ClaimConsent.attachmentContentType]: input.attachmentContentType || 'application/odrl+json',
      [ClaimConsent.attachmentData]: input.attachmentBase64 || 'e30=',
    },
  };
}

/**
 * Builds active consent-approval claims and assigns a deterministic CID into
 * the claims id. Permission requests use the separate draft Bundle builder;
 * callers must not use this helper to represent an unapproved request.
 *
 * @param input Consent actor/subject/business data.
 * @param options.errorPrefix Optional error prefix.
 * @param options.consentIdentifierFactory Optional fallback identifier factory.
 */

function normalizeJurisdiction(value: string): string {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  if (/^[A-Z]{2}$/i.test(trimmed)) return trimmed.toUpperCase();
  const isoStd = trimmed.match(/^urn:iso:std:iso:3166\|([a-z]{2})$/i);
  if (isoStd) return isoStd[1].toUpperCase();
  const isoSubdivision = trimmed.match(/^urn:iso:3166-2:([a-z]{2}-[a-z0-9]{1,3})$/i);
  if (isoSubdivision) return isoSubdivision[1].toUpperCase();
  const iso = trimmed.match(/^urn:iso:3166(?:-2)?:([a-z]{2})(?:[-:].*)?$/i);
  if (iso) return iso[1].toUpperCase();
  return trimmed.toUpperCase();
}

function normalizeDidWebFromUrl(value: string): string | undefined {
  const raw = String(value || '').trim();
  if (!raw) return undefined;
  if (raw.startsWith('did:web:')) return raw.toLowerCase();
  try {
    const parsed = raw.includes('://') ? new URL(raw) : new URL(`https://${raw}`);
    return parsed.hostname ? `did:web:${parsed.hostname.toLowerCase()}` : undefined;
  } catch {
    return undefined;
  }
}

function normalizeConsentRoleValue(value: string): string {
  const trimmed = String(value || '').trim();
  if (!trimmed || trimmed === '*') return trimmed;
  const [system, code] = trimmed.includes('|') ? trimmed.split('|', 2) : ['', trimmed];
  const normalizedSystem = system.trim().toLowerCase();
  const canonicalSystem = [
    'isco-08',
    'org.ilo.isco',
    'org.ilo.isco-08',
  ].includes(normalizedSystem)
    ? 'org.ilo.isco-08'
    : normalizedSystem;
  return system
    ? `${canonicalSystem}|${code.trim().toLowerCase()}`
    : trimmed.toLowerCase();
}

function parseNormalizedConsentRole(value: string): {
  system: string;
  code: string;
  baseCode: string;
  qualifier: string;
} {
  const normalized = normalizeConsentRoleValue(value);
  const [system, codePart] = normalized.includes('|') ? normalized.split('|', 2) : ['', normalized];
  const [baseCode, ...qualifierParts] = String(codePart || '').split(':');
  return {
    system,
    code: String(codePart || ''),
    baseCode: String(baseCode || ''),
    qualifier: qualifierParts.join(':'),
  };
}

function splitCsv(value: unknown): string[] {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Reads one concrete Consent search-parameter claim from either the internal
 * rule shape (`Consent.action`) or a contextualized FHIR claim
 * (`org.hl7.fhir.api.Consent.action`). Persisted rule sets from both forms are
 * therefore evaluated identically.
 */
function readConsentRuleClaim(
  rule: ConsentRule | Record<string, unknown>,
  claim: ClaimConsent,
): unknown {
  const source = rule as unknown as Record<string, unknown>;
  if (source[claim] !== undefined) return source[claim];
  const context = String(source['@context'] || '').trim().replace(/\.$/, '');
  if (context && source[`${context}.${claim}`] !== undefined) {
    return source[`${context}.${claim}`];
  }
  return source[`org.hl7.fhir.api.${claim}`];
}

function normalizeSectionToken(value: string): string {
  const trimmed = String(value || '').trim();
  if (!trimmed) return trimmed;
  const loincPrefixed = trimmed.match(/^loinc:([^|:\s]+)$/i);
  if (loincPrefixed) return `loinc|${loincPrefixed[1]}`;
  if (!trimmed.includes('|')) return trimmed;
  const [system, code] = trimmed.split('|', 2);
  const normalizedSystem = system
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/loinc\.org$/i, 'loinc')
    .replace(/^urn:oid:2\.16\.840\.1\.113883\.6\.1$/i, 'loinc');
  return `${normalizedSystem}|${code.trim()}`;
}

function uniqueTargets(targets: NormalizedConsentTarget[]): NormalizedConsentTarget[] {
  const seen = new Set<string>();
  const result: NormalizedConsentTarget[] = [];
  for (const target of targets) {
    const key = `${target.kind}:${target.canonicalValue}:${target.isDirectTarget ? 'd' : ''}${target.isOrganizationTarget ? 'o' : ''}${target.isJurisdictionTarget ? 'j' : ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(target);
  }
  return result;
}

/**
 * Normalizes a consent target token into a reusable matching descriptor.
 *
 * The helper keeps the current GW contract:
 * - the first precedence tier is intended for concrete professional email matches
 * - direct runtime selectors may still include email / `did:web` / phone
 * - organization targets are normalized to `did:web:<host>`
 * - jurisdictions resolve to ISO-like uppercase codes
 * - phone targets stay marked as extension-specific
 *
 * @param input Raw target input from a rule or runtime request.
 * @param options.actorKind Optional actor family hint.
 * @param options.preferOrganizationDid When true, base `did:web:<host>` values are treated as organization targets.
 */
export function normalizeConsentTarget(
  input: string,
  options: {
    actorKind?: ConsentActorKind;
    preferOrganizationDid?: boolean;
  } = {},
): NormalizedConsentTarget {
  const raw = String(input || '').trim();
  const parsed = parseConsentActorToken(raw);
  if (parsed?.kind === 'email') {
    return {
      raw,
      kind: 'email',
      canonicalValue: parsed.value,
      isDirectTarget: true,
      isOrganizationTarget: false,
      isJurisdictionTarget: false,
      isPhoneExtension: false,
    };
  }
  if (parsed?.kind === 'phone') {
    return {
      raw,
      kind: 'phone',
      canonicalValue: parsed.value,
      isDirectTarget: true,
      isOrganizationTarget: false,
      isJurisdictionTarget: false,
      isPhoneExtension: true,
    };
  }
  if (parsed?.kind === 'country') {
    return {
      raw,
      kind: 'jurisdiction',
      canonicalValue: normalizeJurisdiction(parsed.value),
      isDirectTarget: false,
      isOrganizationTarget: false,
      isJurisdictionTarget: true,
      isPhoneExtension: false,
    };
  }

  const organizationDid = normalizeDidWebFromUrl(raw);
  const isEmployeeLikeDid = /^did:web:[^:\s]+:(employee|family|relatedperson|related-person):/i.test(raw);
  if (raw.startsWith('did:')) {
    const preferOrganizationDid = Boolean(options.preferOrganizationDid && !isEmployeeLikeDid);
    return {
      raw,
      kind: preferOrganizationDid ? 'organization' : 'did',
      canonicalValue: raw.toLowerCase(),
      isDirectTarget: !preferOrganizationDid,
      isOrganizationTarget: preferOrganizationDid,
      isJurisdictionTarget: false,
      isPhoneExtension: false,
    };
  }
  if (organizationDid) {
    return {
      raw,
      kind: 'organization',
      canonicalValue: organizationDid,
      isDirectTarget: false,
      isOrganizationTarget: true,
      isJurisdictionTarget: false,
      isPhoneExtension: false,
    };
  }

  const jurisdiction = normalizeJurisdiction(raw);
  if (/^[A-Z]{2}$/.test(jurisdiction)) {
    return {
      raw,
      kind: 'jurisdiction',
      canonicalValue: jurisdiction,
      isDirectTarget: false,
      isOrganizationTarget: false,
      isJurisdictionTarget: true,
      isPhoneExtension: false,
    };
  }

  return {
    raw,
    kind: 'unknown',
    canonicalValue: raw,
    isDirectTarget: false,
    isOrganizationTarget: false,
    isJurisdictionTarget: false,
    isPhoneExtension: false,
  };
}

/**
 * Resolves all actor match targets used by consent evaluation.
 *
 * Organization matching prefers explicit `organizationDid` / `organizationUrl`.
 * When those are absent but an email exists, the email domain is exposed as a
 * fallback organization target through `did:web:<domain>`.
 *
 * @param actor Runtime actor descriptor.
 */
export function resolveConsentActor(actor: ConsentActorDescriptor): ResolvedConsentActor {
  const actorKind = actor.actorKind || 'professional';
  const directTargets: NormalizedConsentTarget[] = [];
  const organizationTargets: NormalizedConsentTarget[] = [];
  const jurisdictionTargets: NormalizedConsentTarget[] = [];
  const phoneTargets: NormalizedConsentTarget[] = [];

  const email = String(actor.email || '').trim();
  if (email) {
    const direct = normalizeConsentTarget(email, { actorKind });
    directTargets.push(direct);
    const domain = email.includes('@') ? email.split('@')[1] : '';
    const fallbackOrganizationDid = normalizeDidWebFromUrl(domain);
    if (fallbackOrganizationDid) {
      organizationTargets.push(normalizeConsentTarget(fallbackOrganizationDid, {
        actorKind,
        preferOrganizationDid: true,
      }));
    }
  }

  const did = String(actor.did || '').trim();
  if (did) {
    directTargets.push(normalizeConsentTarget(did, { actorKind }));
    const baseOrgDid = did.startsWith('did:web:') ? `did:web:${did.slice('did:web:'.length).split(':')[0]}` : '';
    if (baseOrgDid) {
      organizationTargets.push(normalizeConsentTarget(baseOrgDid, {
        actorKind,
        preferOrganizationDid: true,
      }));
    }
  }

  for (const alias of actor.aliases || []) {
    const normalizedAlias = String(alias || '').trim();
    if (normalizedAlias) {
      directTargets.push(normalizeConsentTarget(normalizedAlias, { actorKind }));
    }
  }

  const phone = normalizePhone(String(actor.phone || ''));
  if (phone) {
    const phoneTarget = normalizeConsentTarget(`tel:${phone}`, { actorKind });
    directTargets.push(phoneTarget);
    phoneTargets.push(phoneTarget);
  }

  const orgDid = String(actor.organizationDid || '').trim();
  if (orgDid) {
    organizationTargets.push(normalizeConsentTarget(orgDid, {
      actorKind,
      preferOrganizationDid: true,
    }));
  }

  const orgUrl = String(actor.organizationUrl || '').trim();
  if (orgUrl) {
    const normalized = normalizeDidWebFromUrl(orgUrl);
    if (normalized) {
      organizationTargets.push(normalizeConsentTarget(normalized, {
        actorKind,
        preferOrganizationDid: true,
      }));
    }
  }

  const jurisdiction = normalizeJurisdiction(String(actor.jurisdiction || ''));
  if (jurisdiction) {
    jurisdictionTargets.push(normalizeConsentTarget(jurisdiction, { actorKind }));
  }

  return {
    actorKind,
    directTargets: uniqueTargets(directTargets),
    organizationTargets: uniqueTargets(organizationTargets),
    jurisdictionTargets: uniqueTargets(jurisdictionTargets),
    phoneTargets: uniqueTargets(phoneTargets),
  };
}

/**
 * Returns `true` when a consent rule is currently active.
 *
 * A rule is active when:
 * - it matches the requested subject when one is provided
 * - `Consent.status` is absent for legacy compatibility or is exactly `active`
 * - `Consent.period-start` is absent or already effective
 * - `Consent.period-end` is absent or still in the future
 *
 * @param rule Consent rule to inspect.
 * @param options.subject Optional subject filter.
 * @param options.now Optional evaluation timestamp.
 */
export function isConsentRuleActive(
  rule: ConsentRule,
  options: {
    subject?: string;
    now?: string | Date;
  } = {},
): boolean {
  if (options.subject && String(readConsentRuleClaim(rule, ClaimConsent.subject) || '').trim() !== String(options.subject || '').trim()) {
    return false;
  }
  const status = String(readConsentRuleClaim(rule, ClaimConsent.status) || '').trim();
  if (status && status !== ConsentStatuses.Active) return false;
  const now = options.now instanceof Date
    ? options.now.getTime()
    : options.now
      ? new Date(options.now).getTime()
      : Date.now();
  const periodStart = String(readConsentRuleClaim(rule, ClaimConsent.periodStart) || '').trim();
  const periodEnd = String(readConsentRuleClaim(rule, ClaimConsent.periodEnd) || '').trim();
  if (periodStart && (Number.isNaN(Date.parse(periodStart)) || Date.parse(periodStart) > now)) return false;
  if (periodEnd && (Number.isNaN(Date.parse(periodEnd)) || Date.parse(periodEnd) <= now)) return false;
  return true;
}

function groupRulesBy(
  rules: ConsentRule[],
  predicate: (target: NormalizedConsentTarget) => boolean,
): Record<string, ConsentRule[]> {
  const groups: Record<string, ConsentRule[]> = {};
  for (const rule of rules) {
    for (const token of splitCsv(readConsentRuleClaim(rule, ClaimConsent.actorIdentifier))) {
      const normalized = normalizeConsentTarget(token, { preferOrganizationDid: true });
      if (!predicate(normalized)) continue;
      groups[normalized.canonicalValue] ||= [];
      groups[normalized.canonicalValue].push(rule);
    }
  }
  return groups;
}

/**
 * Builds an aggregated active-consent view grouped by target kind.
 *
 * @param rules Full consent-rule set available for the subject.
 * @param options.subject Optional subject filter.
 * @param options.now Optional evaluation timestamp.
 */
export function groupActiveConsentsByTarget(
  rules: ConsentRule[],
  options: {
    subject?: string;
    now?: string | Date;
  } = {},
): ActiveConsentView {
  const activeRules = rules.filter((rule) => isConsentRuleActive(rule, options));
  return {
    activeRules,
    byDirectTarget: groupRulesBy(activeRules, (target) => target.isDirectTarget && !target.isPhoneExtension),
    byOrganizationTarget: groupRulesBy(activeRules, (target) => target.isOrganizationTarget),
    byJurisdictionTarget: groupRulesBy(activeRules, (target) => target.isJurisdictionTarget),
    byPhoneTarget: groupRulesBy(activeRules, (target) => target.isPhoneExtension),
  };
}

function normalizeRequestedList(values: string[] | undefined, wildcard = '*'): string[] {
  const normalized = (values || []).map((value) => String(value || '').trim()).filter(Boolean);
  return normalized.length ? Array.from(new Set(normalized)) : [wildcard];
}

function extractRuleResourceTypes(rule: ConsentRule & Record<string, unknown>): string[] {
  const candidates = [
    readConsentRuleClaim(rule, ClaimConsent.resourceType),
    rule['Consent.resource-type'],
    rule['Consent.resource'],
    rule['Consent.data-type'],
  ];
  for (const candidate of candidates) {
    const values = splitCsv(candidate);
    if (values.length > 0) return values;
  }
  return [];
}

function ruleMatchesRole(rule: ConsentRule, actorRole?: string): boolean {
  const ruleRoles = splitCsv(readConsentRuleClaim(rule, ClaimConsent.actorRole)).map(normalizeConsentRoleValue).filter(Boolean);
  if (ruleRoles.length === 0 || ruleRoles.includes('*')) return true;
  const requestedRole = normalizeConsentRoleValue(String(actorRole || ''));
  if (!requestedRole) return false;
  if (ruleRoles.includes(requestedRole)) return true;

  const requested = parseNormalizedConsentRole(requestedRole);
  return ruleRoles.some((ruleRole) => {
    const allowed = parseNormalizedConsentRole(ruleRole);
    if (!allowed.system || !requested.system || allowed.system !== requested.system) return false;

    // A base role matches its specialized suffix, e.g. 2211 -> 2211:obstetrician.
    if (!allowed.qualifier && allowed.baseCode === requested.baseCode) return true;

    // A broad ISCO group matches the defined concrete roles below it,
    // e.g. 221 -> 2211 / 2212.
    return !allowed.qualifier
      && allowed.baseCode.length < requested.baseCode.length
      && requested.baseCode.startsWith(allowed.baseCode);
  });
}

function ruleMatchesPurpose(rule: ConsentRule, purpose?: string): boolean {
  const rulePurpose = String(readConsentRuleClaim(rule, ClaimConsent.purpose) || '').trim();
  if (!purpose || !rulePurpose) return true;
  return rulePurpose === purpose;
}

function ruleMatchesSection(rule: ConsentRule, section?: string): boolean {
  if (!section || section === '*') return true;
  const requestedSection = normalizeSectionToken(section);
  const rawAction = String(readConsentRuleClaim(rule, ClaimConsent.action) || '').trim();
  const actions = extractRuleSectionTokens(rawAction).map(normalizeSectionToken);
  if (actions.length === 0) return false;
  return actions.includes(requestedSection) || actions.includes('*');
}

function extractRuleSectionTokens(rawAction: string): string[] {
  if (!rawAction) return [];
  const canonicalExpressions = rawAction
    .split(/\s+/)
    .map((value) => value.trim())
    .filter((value) =>
      /^(?:organization\/|patient\/)?Composition\.[A-Za-z]+(?:\?|$)/i.test(value));
  if (canonicalExpressions.length === 0) return splitCsv(rawAction);

  return canonicalExpressions.flatMap((expression) => {
    const [, queryString = ''] = expression.split('?', 2);
    const section = new URLSearchParams(queryString).get('section');
    return section
      ? section.split(',').map((value) => value.trim()).filter(Boolean)
      : ['*'];
  });
}

function ruleMatchesResourceType(rule: ConsentRule & Record<string, unknown>, resourceType?: string): boolean {
  if (!resourceType || resourceType === '*') return true;
  const resourceTypes = extractRuleResourceTypes(rule);
  if (resourceTypes.length === 0) return true;
  return resourceTypes.includes(resourceType) || resourceTypes.includes('*');
}

function resolveRuleMatch(
  rule: ConsentRule,
  actor: ResolvedConsentActor,
): { matchKind: ConsentMatchKind; target?: NormalizedConsentTarget; precedenceBase?: number } {
  for (const token of splitCsv(readConsentRuleClaim(rule, ClaimConsent.actorIdentifier))) {
    const normalized = normalizeConsentTarget(token, { preferOrganizationDid: true });
    if (actor.directTargets.some((target: NormalizedConsentTarget) => target.canonicalValue === normalized.canonicalValue)) {
      return { matchKind: 'direct', target: normalized, precedenceBase: 10 };
    }
    if (actor.organizationTargets.some((target: NormalizedConsentTarget) => target.canonicalValue === normalized.canonicalValue)) {
      return { matchKind: 'organization', target: normalized, precedenceBase: 20 };
    }
    if (actor.jurisdictionTargets.some((target: NormalizedConsentTarget) => target.canonicalValue === normalized.canonicalValue)) {
      return { matchKind: 'jurisdiction', target: normalized, precedenceBase: 30 };
    }
  }
  return { matchKind: 'none' };
}

function toRuleMatch(
  rule: ConsentRule,
  actor: ResolvedConsentActor,
  section?: string,
  resourceType?: string,
): ConsentRuleMatch | undefined {
  const resolved = resolveRuleMatch(rule, actor);
  if (!resolved.target || resolved.matchKind === 'none' || resolved.precedenceBase === undefined) return undefined;
  const decision = readConsentRuleClaim(rule, ClaimConsent.decision) as ConsentRule[ClaimConsent.decision];
  const precedence = resolved.precedenceBase + (decision === 'deny' ? 0 : 1);
  return {
    rule,
    ruleId: String(((rule as unknown as { id?: unknown }).id) || '').trim() || undefined,
    decision,
    matchKind: resolved.matchKind,
    target: resolved.target,
    precedence,
    section: section === '*' ? undefined : section,
    resourceType: resourceType === '*' ? undefined : resourceType,
  };
}

function emptyMissing(): MissingPermissionSet {
  return { sections: [], resourceTypes: [], pairs: [] };
}

/**
 * Evaluates effective consent coverage for a runtime access request.
 *
 * Precedence implemented by the shared evaluator:
 * 1. explicit deny for a concrete email
 * 2. explicit permit for a concrete email
 * 3. organization-scoped decisions
 * 4. jurisdiction-scoped decisions
 * 5. default deny
 *
 * Resource-type evaluation is optional: when a rule does not carry an explicit
 * resource-type filter, it is treated as section-scoped wildcard coverage.
 *
 * @param rules Full consent-rule set available to the caller.
 * @param request Runtime request to evaluate.
 */
export function evaluateConsentCoverage(
  rules: ConsentRule[],
  request: ConsentCoverageRequest,
): EffectiveAccessEvaluation {
  const actor = resolveConsentActor(request.actor);
  const sections = normalizeRequestedList(request.sections);
  const resourceTypes = normalizeRequestedList(request.resourceTypes);
  const activeRules = rules.filter((rule) => isConsentRuleActive(rule, {
    subject: request.subject,
    now: request.now,
  }));

  const matchedRules: ConsentRuleMatch[] = [];
  const winningRules: ConsentRuleMatch[] = [];
  const explicitDenials: ConsentRuleMatch[] = [];
  const allowedSections = new Set<string>();
  const deniedSections = new Set<string>();
  const allowedResourceTypes = new Set<string>();
  const deniedResourceTypes = new Set<string>();
  const missing: MissingPermissionSet = emptyMissing();

  for (const section of sections) {
    for (const resourceType of resourceTypes) {
      const candidates = activeRules
        .filter((rule) =>
          ruleMatchesRole(rule, request.actorRole)
          && ruleMatchesPurpose(rule, request.purpose)
          && ruleMatchesSection(rule, section)
          && ruleMatchesResourceType(rule as ConsentRule & Record<string, unknown>, resourceType))
        .map((rule) => toRuleMatch(rule, actor, section, resourceType))
        .filter((match): match is ConsentRuleMatch => Boolean(match))
        .sort((a, b) => a.precedence - b.precedence);

      matchedRules.push(...candidates);
      const winner = candidates[0];
      if (!winner) {
        missing.pairs.push({
          section: section === '*' ? undefined : section,
          resourceType: resourceType === '*' ? undefined : resourceType,
          reason: 'default-deny-no-active-consent',
        });
        if (section !== '*') missing.sections.push(section);
        if (resourceType !== '*') missing.resourceTypes.push(resourceType);
        if (section !== '*') deniedSections.add(section);
        if (resourceType !== '*') deniedResourceTypes.add(resourceType);
        continue;
      }

      winningRules.push(winner);
      if (winner.decision === 'deny') {
        explicitDenials.push(winner);
        if (section !== '*') deniedSections.add(section);
        if (resourceType !== '*') deniedResourceTypes.add(resourceType);
        missing.pairs.push({
          section: section === '*' ? undefined : section,
          resourceType: resourceType === '*' ? undefined : resourceType,
          reason: `explicit-${winner.matchKind}-deny`,
        });
        if (section !== '*') missing.sections.push(section);
        if (resourceType !== '*') missing.resourceTypes.push(resourceType);
      } else {
        if (section !== '*') allowedSections.add(section);
        if (resourceType !== '*') allowedResourceTypes.add(resourceType);
      }
    }
  }

  return {
    allowed: missing.pairs.length === 0,
    denied: missing.pairs.length > 0 && allowedSections.size === 0 && allowedResourceTypes.size === 0,
    partial: missing.pairs.length > 0 && (allowedSections.size > 0 || allowedResourceTypes.size > 0),
    subject: request.subject,
    actor,
    matchedRules,
    winningRules,
    explicitDenials,
    allowedSections: Array.from(allowedSections),
    deniedSections: Array.from(deniedSections),
    allowedResourceTypes: Array.from(allowedResourceTypes),
    deniedResourceTypes: Array.from(deniedResourceTypes),
    missing: {
      sections: Array.from(new Set(missing.sections)),
      resourceTypes: Array.from(new Set(missing.resourceTypes)),
      pairs: missing.pairs,
    },
  };
}
