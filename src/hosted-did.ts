// Selective hosted identity contract reviewed from source revision 74479fa3fc8d8cbf92a9ff13dd626ccf8d6f2b1e.
// Copyright 2025-2026 Antifraud Services Inc. under Apache-2.0. Parsing and hashing never grant authority.
import type {ServiceEndpointSelector} from './confidential-job.js'
import {SecureIdTypesIndividual,type SecureIdTypeIndividual} from './identity-identifiers.js'
import {normalizePhone} from './consent-coverage.js'
import {encodeMultibaseSha3} from 'antifraud-data-utils-ts/encoding'
export {parseIndividualMemberDidWeb} from './individual-did-routing.js'
const multibase58MultihashSha3_256=(value:string)=>encodeMultibaseSha3(value,256)
export const IndividualDidMarkers={Individual:'individual',Multibase:'multibase',Member:'member',Role:'role'} as const
const UUID_VALUE_PATTERN=/^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i
const MULTIBASE_SHA3_384_PATTERN=/^z[1-9A-HJ-NP-Za-km-z]+$/
function buildSecureIdValue(typeInput: SecureIdTypeIndividual | string, valueInput: string, context: string): string {
  const type = String(typeInput || '').trim().toUpperCase();
  const rawValue = String(valueInput || '').trim();
  if (!type) throw new Error(`${context} requires a secure identifier type.`);
  if (!rawValue) throw new Error(`${context} requires a private identifier value.`);
  if (type === SecureIdTypesIndividual.Uuid) {
    if (!UUID_VALUE_PATTERN.test(rawValue)) {
      throw new Error(`${context} requires a hexadecimal UUID value.`);
    }
    const hex = rawValue.replace(/-/g, '').toLowerCase();
    const bytes = new Uint8Array(16);
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
    }
    return encodeMultibaseSha3(bytes, 384);
  }

  const canonicalText = type === SecureIdTypesIndividual.Email
    ? rawValue.replace(/^mailto:/i, '').replace(/\s+/g, '').toLowerCase()
    : type === SecureIdTypesIndividual.Phone
      ? normalizePhone(rawValue.replace(/^tel:/i, ''))
      : rawValue.normalize('NFKC').toUpperCase();
  if (!canonicalText) throw new Error(`${context} requires a valid ${type} value.`);
  return encodeMultibaseSha3(canonicalText, 384);
}

export function buildSecureIdValueIndividual(input: {
  secureIdTypeIndividual: SecureIdTypeIndividual | string;
  privateIdValueIndividual: string;
}): string {
  return buildSecureIdValue(
    input.secureIdTypeIndividual,
    input.privateIdValueIndividual,
    'buildSecureIdValueIndividual',
  );
}

export function buildSecureIdValueMember(input: {
  secureIdTypeMember: SecureIdTypeIndividual | string;
  privateIdValueMember: string;
}): string {
  return buildSecureIdValue(
    input.secureIdTypeMember,
    input.privateIdValueMember,
    'buildSecureIdValueMember',
  );
}

export function toDidMemberRoleCode(role: string): string {
  const normalized = String(role || '').trim();
  if (!normalized) throw new Error('toDidMemberRoleCode requires role.');
  const parts = normalized.split('|');
  return String(parts[parts.length - 1] || '').trim();
}

export function generateServiceId(selector: ServiceEndpointSelector): string {




  const parts = [
    selector.section?.toLowerCase(),
    selector.format?.toLowerCase(),
    selector.resourceType?.toLowerCase(),
    selector.action,
  ];

  return `#${parts.filter(p => p).join(':')}`;
}

export function normalizeDidWeb(did: string): string {
  const parts = did.split(':');
  if (parts[0] !== 'did' || parts[1] !== 'web' || parts.length < 3) {

    return did;
  }

  const lastIndex = parts.length - 1;
  return parts.map((part, index) => {
    if (index < 2) return part.toLowerCase();
    if (index === 2) return part.toLowerCase().replace(/%3a/gi, '%3A');



    if (/^vat[a-z]{2}[-a-z0-9._]+$/i.test(part)) {
      return part.toUpperCase();
    }

    const jurisdictionMatch = /^cds-([a-z]{2})$/i.exec(part);
    if (jurisdictionMatch) {
      return `cds-${jurisdictionMatch[1].toUpperCase()}`;
    }

    if (index === lastIndex) {
      if (!part.includes('|')) return part;
      const [system, ...codeParts] = part.split('|');
      return `${system.toLowerCase()}|${codeParts.join('|')}`;
    }

    return part.toLowerCase();
  }).join(':');
}

export function createHostedDidWeb(
  hostDidWeb: string,
  tenantId: string,
  context: { jurisdiction: string; version: string; sector: string }
): string {
  const hostPart = hostDidWeb.replace(/^did:web:/, '');

  const didPath = `cds-${context.jurisdiction}:${context.version}:${context.sector}`;
  return `did:web:${hostPart}:${tenantId}:${didPath}`;
}

export function buildHostedOrganizationDidWeb(input: {
  hostDomain: string;
  sector: string;
  officialIdentifierType: string;
  officialIdentifierValue: string;
}): string {
  const hostDomain = String(input.hostDomain || '').trim().toLowerCase();
  const sector = String(input.sector || '').trim().toLowerCase();
  const identifierType = String(input.officialIdentifierType || '').trim().toLowerCase();
  const identifierValue = String(input.officialIdentifierValue || '').trim();
  if (!hostDomain) throw new Error('buildHostedOrganizationDidWeb requires hostDomain.');
  if (!sector) throw new Error('buildHostedOrganizationDidWeb requires sector.');
  if (!/^[a-z][a-z0-9._-]*$/.test(identifierType)) {
    throw new Error('buildHostedOrganizationDidWeb requires a canonical officialIdentifierType path token.');
  }
  if (!identifierValue || /[:/\s]/.test(identifierValue)) {
    throw new Error('buildHostedOrganizationDidWeb requires one DID-path-safe officialIdentifierValue.');
  }
  return `did:web:${hostDomain}:${sector}:organization:${identifierType}:${identifierValue}`;
}

export function buildHostedProviderDidWeb(input: {
  hostDomain: string;
  sector: string;
  providerTaxId: string;
}): string {
  const hostDomain = String(input.hostDomain || '').trim().toLowerCase();
  const sector = String(input.sector || '').trim().toLowerCase();
  const providerTaxId = String(input.providerTaxId || '').trim();
  if (!hostDomain) throw new Error('buildHostedProviderDidWeb requires hostDomain.');
  if (!sector) throw new Error('buildHostedProviderDidWeb requires sector.');
  if (!providerTaxId) throw new Error('buildHostedProviderDidWeb requires providerTaxId.');
  return buildHostedOrganizationDidWeb({
    hostDomain,
    sector,
    officialIdentifierType: 'taxid',
    officialIdentifierValue: providerTaxId,
  });
}

export function buildOrganizationDidWeb(input: {
  hostDidWeb: string;
  tenantId?: string;
  tenantAlternateName?: string;
  jurisdiction: string;
  version?: string;
  sector: string;
}): string {
  const tenantId = String(input.tenantId || input.tenantAlternateName || '').trim();
  if (!tenantId) throw new Error('buildOrganizationDidWeb requires tenantId.');
  return createHostedDidWeb(input.hostDidWeb, tenantId, {
    jurisdiction: input.jurisdiction,
    version: input.version || 'v1',
    sector: input.sector,
  });
}

export function buildProfessionalDidWeb(input: {
  organizationDidWeb: string;
  email: string;
  role: string;
  deviceId?: string;
}): string {
  const normalizedEmail = String(input.email || '').trim().toLowerCase();
  const role = String(input.role || '').trim();
  if (!normalizedEmail) throw new Error('buildProfessionalDidWeb requires email.');
  if (!role) throw new Error('buildProfessionalDidWeb requires role.');
  const memberId = multibase58MultihashSha3_256(normalizedEmail);
  return [
    String(input.organizationDidWeb).trim(),
    'employee',
    memberId,
    role,
    input.deviceId ? String(input.deviceId).trim() : undefined,
  ].filter(Boolean).join(':');
}

export function buildIndividualDidWeb(input: {
  providerDidWeb: string;
  secureIdTypeIndividual?: SecureIdTypeIndividual | string;
  secureIdValueIndividual?: string;

  individualId?: string;

  subjectId?: string;
}): string {
  const providerDidWeb = String(input.providerDidWeb || '').trim();
  const secureIdTypeIndividual = String(input.secureIdTypeIndividual || '').trim().toUpperCase();
  const secureIdValueIndividual = String(input.secureIdValueIndividual || '').trim();
  const individualId = String(input.individualId || input.subjectId || '').trim();
  if (!providerDidWeb) throw new Error('buildIndividualDidWeb requires providerDidWeb.');
  if (secureIdTypeIndividual || secureIdValueIndividual) {
    if (!secureIdTypeIndividual || !secureIdValueIndividual) {
      throw new Error('buildIndividualDidWeb requires both secure individual id type and value.');
    }
    if (!MULTIBASE_SHA3_384_PATTERN.test(secureIdValueIndividual)) {
      throw new Error('buildIndividualDidWeb requires secureIdValueIndividual as bare multibase base58btc.');
    }
    return [
      providerDidWeb,
      IndividualDidMarkers.Individual,
      IndividualDidMarkers.Multibase,
      secureIdValueIndividual,
    ].join(':');
  }
  if (!individualId) throw new Error('buildIndividualDidWeb requires individualId.');
  return [
    providerDidWeb,
    IndividualDidMarkers.Individual,
    IndividualDidMarkers.Multibase,
    individualId,
  ].filter(Boolean).join(':');
}

export function buildIndividualMemberDidWeb(input: {
  individualDidWeb: string;
  memberId?: string;
  roleType?: string;
  roleValue?: string;

  role?: string;
}): string {
  const individualDidWeb = String(input.individualDidWeb || '').trim();
  if (!individualDidWeb) throw new Error('buildIndividualMemberDidWeb requires individualDidWeb.');
  const memberId = String(input.memberId || '').trim();
  const roleType = String(input.roleType || '').trim();
  const roleValue = String(input.roleValue || '').trim();
  if (memberId || roleType || roleValue) {
    if (!MULTIBASE_SHA3_384_PATTERN.test(memberId)) {
      throw new Error('buildIndividualMemberDidWeb requires memberId as bare multibase base58btc.');
    }
    if (!roleType || !roleValue) {
      throw new Error('buildIndividualMemberDidWeb requires both roleType and roleValue.');
    }
    return [individualDidWeb, IndividualDidMarkers.Member, memberId, roleValue].join(':');
  }
  return [
    individualDidWeb,
    IndividualDidMarkers.Member,
    IndividualDidMarkers.Role,
    toDidMemberRoleCode(String(input.role || '')),
  ].join(':');
}

export function buildIndividualMemberDidWebFromPrivateIdentifiers(input: {
  providerDidWeb: string;
  secureIdTypeIndividual: SecureIdTypeIndividual | string;
  privateIdValueIndividual: string;
  secureIdTypeMember: SecureIdTypeIndividual | string;
  privateIdValueMember: string;
  roleType: string;
  roleValue: string;
}): string {
  const individualDidWeb = buildIndividualDidWeb({
    providerDidWeb: input.providerDidWeb,
    secureIdTypeIndividual: input.secureIdTypeIndividual,
    secureIdValueIndividual: buildSecureIdValueIndividual({
      secureIdTypeIndividual: input.secureIdTypeIndividual,
      privateIdValueIndividual: input.privateIdValueIndividual,
    }),
  });
  return buildIndividualMemberDidWeb({
    individualDidWeb,
    memberId: buildSecureIdValueMember({
      secureIdTypeMember: input.secureIdTypeMember,
      privateIdValueMember: input.privateIdValueMember,
    }),
    roleType: input.roleType,
    roleValue: input.roleValue,
  });
}
