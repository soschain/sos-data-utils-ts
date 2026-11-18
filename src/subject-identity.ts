// Selective hosted identity contract reviewed from source revision 74479fa3fc8d8cbf92a9ff13dd626ccf8d6f2b1e.
// Copyright 2025-2026 Antifraud Services Inc. under Apache-2.0. Parsing and hashing never grant authority.
import type { BundleEntry } from './bundle-contract.js';

/** Subject categories supported by the neutral identity collection. */
export type SubjectKind = 'person' | 'animal' | 'property';

/** Semantic resource types stored inside the neutral Subject collection. */
export type SubjectIdentityResourceType = 'Person' | 'Animal' | 'Place';

/** Exact private identifier input linked to one public unified card. */
export type SubjectIdentityInput = Readonly<{
  subjectKind: SubjectKind;
  cardId: string;
  /** Canonical identifier type/coding system. */
  codingSystem: string;
  /** ISO jurisdiction for scoped identifiers; empty for a global identifier. */
  jurisdiction: string;
  codeValue: string;
  /** Additional encrypted claims; canonical identifier and sameAs keys cannot be overridden. */
  additionalClaims?: Readonly<Record<string, unknown>>;
}>;

/** Normalized association recovered from one Subject collection entry. */
export type SubjectIdentityAssociation = SubjectIdentityInput & Readonly<{
  resourceType: SubjectIdentityResourceType;
  assetId: string;
}>;

/** Bundle entry used to write one semantic identity into the Subject collection. */
export type SubjectIdentityBundleEntry = BundleEntry & Readonly<{
  type: 'Subject-identity-link-v1.0';
  resource: NonNullable<BundleEntry['resource']> & Readonly<{
    resourceType: SubjectIdentityResourceType;
    meta: { claims: Record<string, unknown> };
  }>;
  request: { method: 'POST'; url: 'Subject' };
}>;

import {encodeMultibaseSha3} from 'antifraud-data-utils-ts/encoding'
import {normalizeIndividualIdentifierType} from './identity-identifiers.js'
import {normalizeDidWeb} from './hosted-did.js'
export type SubjectIdentifierLedgerPayload=Readonly<{indexProviderDid:string}>
const SUBJECT_RESOURCE_BY_KIND: Readonly<Record<SubjectKind, SubjectIdentityResourceType>> = {
  person: 'Person',
  animal: 'Animal',
  property: 'Place',
};

const SUBJECT_KIND_BY_RESOURCE: Readonly<Record<SubjectIdentityResourceType, SubjectKind>> = {
  Person: 'person',
  Animal: 'animal',
  Place: 'property',
};

const STABLE_CARD_ID_PATTERN = /^(?:did|urn|https):\S+$/i;
const ISO_3166_JURISDICTION_PATTERN = /^[A-Z]{2}(?:-[A-Z0-9]{1,3})?$/;
const DID_WEB_PATTERN = /^did:web:[^\s#?]+$/;

/**
 * Builds the exact UTF-8 token used by the distributed Subject lookup.
 *
 * Contract:
 * - canonical input is `codingSystem|jurisdiction-or-empty|codeValue`;
 * - an empty jurisdiction is explicit, producing `||` for global identifiers;
 * - values use the existing individual-identifier uppercase normalization;
 * - `|` is forbidden in every component to keep the encoding unambiguous.
 */
export function buildSubjectIdentifierToken(
  input: Pick<SubjectIdentityInput, 'codingSystem' | 'jurisdiction' | 'codeValue'>,
): string {
  const codingSystem = normalizeTokenPart(input.codingSystem, 'codingSystem');
  const jurisdiction = normalizeJurisdiction(input.jurisdiction);
  const codeValue = normalizeTokenPart(input.codeValue, 'codeValue').toUpperCase();
  return `${codingSystem}|${jurisdiction}|${codeValue}`;
}

/**
 * Returns `urn:multibase:<base58btc multihash>` using SHA3-384.
 *
 * The value is a deterministic public lookup key, not an authorization proof.
 * The raw identifier remains in the encrypted Subject collection and is never
 * included in the Fabric payload.
 */
export function buildSubjectIdentifierAssetId(
  input: Pick<SubjectIdentityInput, 'codingSystem' | 'jurisdiction' | 'codeValue'>,
): string {
  return `urn:multibase:${encodeMultibaseSha3(buildSubjectIdentifierToken(input), 384)}`;
}

/**
 * Builds the complete public value stored under an opaque subject identifier.
 *
 * The provider DID is deliberately the only payload field. DID resolution
 * discovers its service endpoint; the protected provider lookup then uses the
 * same opaque asset id to resolve the subject/card and authorized index.
 */
export function buildSubjectIdentifierLedgerPayload(
  indexProviderDid: string,
): SubjectIdentifierLedgerPayload {
  const normalized = normalizeDidWeb(String(indexProviderDid || '').trim());
  if (!DID_WEB_PATTERN.test(normalized)) {
    throw new TypeError('indexProviderDid must be a did:web identifier');
  }
  return { indexProviderDid: normalized };
}

/** Reads the strict provider-only subject-identifier ledger payload. */
export function readSubjectIdentifierLedgerPayload(payload: unknown): string {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new TypeError('subject_identifier_payload_must_contain_only_index_provider_did');
  }
  const record = payload as Record<string, unknown>;
  if (Object.keys(record).length !== 1 || !Object.hasOwn(record, 'indexProviderDid')) {
    throw new TypeError('subject_identifier_payload_must_contain_only_index_provider_did');
  }
  return buildSubjectIdentifierLedgerPayload(String(record.indexProviderDid || '')).indexProviderDid;
}

/**
 * Builds one semantic identity resource for the neutral Subject collection.
 *
 * `sameAs` always identifies the stable public unified card. The private
 * coding system and code value remain claims of Person, Animal or Place; the
 * collection name never replaces that semantic resource type.
 */
export function buildSubjectIdentityBundleEntry(
  input: SubjectIdentityInput,
): SubjectIdentityBundleEntry {
  const resourceType = SUBJECT_RESOURCE_BY_KIND[input.subjectKind];
  if (!resourceType) throw new TypeError(`Unsupported subject kind: ${input.subjectKind}`);
  const cardId = input.cardId.trim();
  if (!STABLE_CARD_ID_PATTERN.test(cardId)) {
    throw new TypeError('Subject identity cardId must be a stable URI (did:, urn: or https:).');
  }
  const codingSystem = input.subjectKind === 'person'
    ? normalizeIndividualIdentifierType(input.codingSystem)
    : normalizeTokenPart(input.codingSystem, 'codingSystem');
  const jurisdiction = normalizeJurisdiction(input.jurisdiction);
  if (input.subjectKind === 'person' && !jurisdiction) {
    throw new TypeError('Person identity jurisdiction is required.');
  }
  const codeValue = normalizeTokenPart(input.codeValue, 'codeValue').toUpperCase();
  const assetId = buildSubjectIdentifierAssetId({ codingSystem, jurisdiction, codeValue });
  const claimPrefix = `org.schema.${resourceType}`;

  return {
    id: assetId,
    fullUrl: assetId,
    type: 'Subject-identity-link-v1.0',
    resource: {
      resourceType,
      id: assetId,
      meta: {
        claims: {
          ...(input.additionalClaims || {}),
          [`${claimPrefix}.identifier`]: assetId,
          [`${claimPrefix}.identifier.additionalType`]: codingSystem,
          [`${claimPrefix}.identifier.jurisdiction`]: jurisdiction,
          [`${claimPrefix}.identifier.value`]: codeValue,
          [`${claimPrefix}.sameAs`]: cardId,
        },
      },
    },
    request: { method: 'POST', url: 'Subject' },
  };
}

/** Reads and validates one Person/Animal/Place entry from the Subject collection. */
export function readSubjectIdentityBundleEntry(entry: BundleEntry): SubjectIdentityAssociation {
  const resourceType = String(entry.resource?.resourceType || '') as SubjectIdentityResourceType;
  const subjectKind = SUBJECT_KIND_BY_RESOURCE[resourceType];
  if (!subjectKind) {
    throw new TypeError(
      `Unsupported Subject identity resourceType: ${resourceType || '(missing)'}; expected Person, Animal or Place.`,
    );
  }
  const claims = entry.resource?.meta?.claims || {};
  const prefix = `org.schema.${resourceType}`;
  const cardId = String(claims[`${prefix}.sameAs`] || '').trim();
  const codingSystem = String(claims[`${prefix}.identifier.additionalType`] || '').trim();
  const jurisdiction = normalizeJurisdiction(String(claims[`${prefix}.identifier.jurisdiction`] || ''));
  const codeValue = String(claims[`${prefix}.identifier.value`] || '').trim();
  if (!STABLE_CARD_ID_PATTERN.test(cardId)) throw new TypeError('Subject identity sameAs must contain one stable card URI.');
  if (subjectKind === 'person' && !jurisdiction) throw new TypeError('Person identity jurisdiction is required.');
  const assetId = buildSubjectIdentifierAssetId({ codingSystem, jurisdiction, codeValue });
  const claimedAssetId = String(claims[`${prefix}.identifier`] || entry.resource?.id || entry.id || '').trim();
  if (claimedAssetId && claimedAssetId !== assetId) {
    throw new TypeError('Subject identity identifier does not match codingSystem|jurisdiction|codeValue.');
  }
  return { subjectKind, resourceType, cardId, codingSystem, jurisdiction, codeValue, assetId };
}

function normalizeTokenPart(value: string, field: string): string {
  const normalized = String(value || '').trim().normalize('NFKC');
  if (!normalized) throw new TypeError(`${field} is required`);
  if (normalized.includes('|')) throw new TypeError(`${field} must not contain the '|' delimiter`);
  return normalized;
}

function normalizeJurisdiction(value: string): string {
  const normalized = String(value || '').trim().normalize('NFKC').toUpperCase();
  if (normalized.includes('|')) throw new TypeError("jurisdiction must not contain the '|' delimiter");
  if (normalized && !ISO_3166_JURISDICTION_PATTERN.test(normalized)) {
    throw new TypeError(`Invalid ISO 3166 jurisdiction: ${value}`);
  }
  return normalized;
}
