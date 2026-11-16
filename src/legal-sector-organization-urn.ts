// Copyright 2026 Connecting Solution & Applications Ltd. under Apache-2.0.
// Selective ledger identity contract reviewed at source revision 74479fa3fc8d8cbf92a9ff13dd626ccf8d6f2b1e.
import {encodeMultibaseSha3} from 'antifraud-data-utils-ts/encoding'
export type LegalSectorOrganizationUrnInput = Readonly<{
  /** Governed data-space sector, for example `health-care` or `animal-care`. */
  sector: string;
  /** ISO 3166-1 alpha-2 country code. */
  country: string;
  /** Optional ISO 3166-2 or governed first administrative subdivision. */
  administrativeSublevel1?: string;
  /** Optional second administrative subdivision. */
  administrativeSublevel2?: string;
  /** Optional third administrative subdivision. */
  administrativeSublevel3?: string;
  /** HL7 v2-0203-derived or governed extension code, such as TAX, EN or BN. */
  identifierType: string;
  /** Issuer-defined official identifier. Its casing is preserved. */
  identifierValue: string;
}>;

const NORMALIZED_SEGMENT_PATTERN = /^[a-z0-9][a-z0-9._-]*$/;

function normalizeRequiredSegment(value: string, field: string): string {
  const normalized = String(value || '').trim().normalize('NFKC').toLowerCase();
  if (!NORMALIZED_SEGMENT_PATTERN.test(normalized)) {
    throw new Error(`Legal sector organization URN requires a valid ${field}.`);
  }
  return normalized;
}

function normalizeOptionalSegment(value: string | undefined, field: string): string {
  if (!String(value || '').trim()) return '';
  return normalizeRequiredSegment(String(value), field);
}

/**
 * Builds the organization-level public identifier from the governed legal URN
 * grammar. All structural tokens are lower-cased; the official identifier is
 * preserved exactly after trimming and NFKC normalization.
 *
 * Format:
 * `urn:legal:<sector>:<country>:<admin1>:<admin2>:<admin3>:organization:<type>:<official-id>`
 */
export function buildLegalSectorOrganizationUrn(
  input: LegalSectorOrganizationUrnInput,
): string {
  const sector = normalizeRequiredSegment(input.sector, 'sector');
  const country = normalizeRequiredSegment(input.country, 'country');
  if (!/^[a-z]{2}$/.test(country)) {
    throw new Error('Legal sector organization URN requires an ISO 3166-1 alpha-2 country.');
  }
  const administrativeSublevel1 = normalizeOptionalSegment(
    input.administrativeSublevel1,
    'administrativeSublevel1',
  );
  const administrativeSublevel2 = normalizeOptionalSegment(
    input.administrativeSublevel2,
    'administrativeSublevel2',
  );
  const administrativeSublevel3 = normalizeOptionalSegment(
    input.administrativeSublevel3,
    'administrativeSublevel3',
  );
  const identifierType = normalizeRequiredSegment(input.identifierType, 'identifierType');
  const identifierValue = String(input.identifierValue || '').trim().normalize('NFKC');
  if (!identifierValue || /[:\s]/u.test(identifierValue)) {
    throw new Error('Legal sector organization URN requires a colon-free identifierValue.');
  }

  return [
    'urn',
    'legal',
    sector,
    country,
    administrativeSublevel1,
    administrativeSublevel2,
    administrativeSublevel3,
    'organization',
    identifierType,
    identifierValue,
  ].join(':');
}

/**
 * Builds the stable Fabric lookup key for one organization-sector binding.
 *
 * The exact canonical legal-sector URN UTF-8 bytes are encoded as
 * `urn:multibase:base58btc(multihash(SHA3-256))`. A provider/DID rotation does
 * not change this key; only the binding asset state and history change.
 */
export function buildLegalSectorOrganizationAssetId(organizationUrn: string): string {
  const canonicalUrn = String(organizationUrn || '').trim().normalize('NFKC');
  const parts = canonicalUrn.split(':');
  if (parts.length !== 10 || parts[0] !== 'urn' || parts[1] !== 'legal' || parts[7] !== 'organization') {
    throw new Error('Legal sector organization asset ID requires a canonical organization-level urn:legal identifier.');
  }
  const rebuilt = buildLegalSectorOrganizationUrn({
    sector: parts[2],
    country: parts[3],
    administrativeSublevel1: parts[4],
    administrativeSublevel2: parts[5],
    administrativeSublevel3: parts[6],
    identifierType: parts[8],
    identifierValue: parts[9],
  });
  if (rebuilt !== canonicalUrn) {
    throw new Error('Legal sector organization asset ID requires an already-canonical urn:legal identifier.');
  }
  return `urn:multibase:${encodeMultibaseSha3(canonicalUrn, 256)}`;
}
