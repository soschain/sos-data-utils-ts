// Copyright 2026 Antifraud Services Inc. under the Apache License, Version 2.0.

import { ContractCredentialTypes, W3cCredentialContexts, W3cCredentialTypes } from './identity-credential-contracts.js';
import { ClaimConsent } from 'fhir-data-utils-ts/claims';
import { ClaimInterTenantAccessContract } from './inter-tenant-access-contract-types.js';
import type {
  InterTenantAccessContractClaims,
  InterTenantContractAuthorizationConsentCriteria,
  InterTenantAccessContractMatchCriteria,
  InterTenantAccessContractSummary,
} from './inter-tenant-access-contract-types.js';
import type { VerifiableCredentialV2 } from 'antifraud-data-utils-ts/credential-contracts';
import { SHA3_384_MULTIHASH_PROFILE, bytesToHexString } from 'antifraud-data-utils-ts/encoding';

function sanitizeBlockchainReference(value: unknown): string | undefined {
  const normalized = String(value || '').trim();
  if (!normalized) return undefined;
  if (/^z[1-9A-HJ-NP-Za-km-z]+$/.test(normalized) || /^sha3-384:[a-f0-9]{96}$/i.test(normalized)) return normalized;
  return `sha3-384:${bytesToHexString(SHA3_384_MULTIHASH_PROFILE.digest(new TextEncoder().encode(normalized)))}`;
}
import { getVpCredentials } from './vp-token.js';

type ContractLike = Record<string, any>;

const ACTIVE_CONTRACT_STATUSES = new Set(['executed', 'amended', 'appended']);
const PROVIDER_ROLE = 'provider';
const CONSUMER_ROLE = 'consumer';
const PROVIDER_AUTHORIZED_SIGNATORY_ROLE = 'provider-authorized-signatory';
const CONSUMER_AUTHORIZED_SIGNATORY_ROLE = 'consumer-authorized-signatory';
const LEGACY_PROVIDER_CONTROLLER_ROLE = 'provider-controller';
const LEGACY_CONSUMER_CONTROLLER_ROLE = 'consumer-controller';

function splitCsv(value: unknown): string[] {
  return Array.from(new Set(
    String(value || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  ));
}

function buildContractTypeCodeableConcept(value: unknown): Record<string, unknown> | undefined {
  const normalized = String(value || '').trim();
  if (!normalized) return undefined;
  const separator = normalized.indexOf('|');
  if (separator < 1 || separator === normalized.length - 1) {
    return { text: normalized };
  }
  const system = normalized.slice(0, separator).trim();
  const code = normalized.slice(separator + 1).trim();
  if (!system || !code) return { text: normalized };
  return { coding: [{ system, code }] };
}

function readClaimWithAliases(
  claims: InterTenantAccessContractClaims,
  canonicalKey: ClaimInterTenantAccessContract,
  aliases: readonly string[] = [],
): string | undefined {
  const direct = String(claims[canonicalKey] || '').trim();
  if (direct) return direct;
  for (const alias of aliases) {
    const value = String((claims as Record<string, unknown>)[alias] || '').trim();
    if (value) return value;
  }
  return undefined;
}

function firstIdentifierValue(input: any): string | undefined {
  if (Array.isArray(input)) {
    for (const candidate of input) {
      const found = firstIdentifierValue(candidate);
      if (found) return found;
    }
    return undefined;
  }
  if (!input || typeof input !== 'object') return undefined;
  const direct = String(input.value || input.id || '').trim();
  return direct || undefined;
}

function extractRoleTexts(input: any): string[] {
  const items = Array.isArray(input) ? input : input ? [input] : [];
  return items
    .flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const text = String(item.text || '').trim();
      const codingItems = Array.isArray(item.coding) ? item.coding : item.coding ? [item.coding] : [];
      const codingValues = codingItems
        .map((coding: any) => String(coding?.code || coding?.display || '').trim())
        .filter(Boolean);
      return [text, ...codingValues].filter(Boolean);
    });
}

function extractCapabilityValues(input: any): string[] {
  const items = Array.isArray(input) ? input : input ? [input] : [];
  return Array.from(new Set(
    items.flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const text = String(item.text || '').trim();
      const codingItems = Array.isArray(item.coding) ? item.coding : item.coding ? [item.coding] : [];
      const codingValues = codingItems
        .map((coding: any) => String(coding?.code || coding?.display || '').trim())
        .filter(Boolean);
      return [text, ...codingValues].flatMap((value) => splitCsv(value));
    }),
  ));
}

function extractOfferPartyReference(contract: ContractLike, expectedRole: string): string | undefined {
  const terms = Array.isArray(contract.term) ? contract.term : contract.term ? [contract.term] : [];
  for (const term of terms) {
    const parties = Array.isArray(term?.offer?.party) ? term.offer.party : term?.offer?.party ? [term.offer.party] : [];
    for (const party of parties) {
      const roleTexts = extractRoleTexts(party?.role).map((value) => value.toLowerCase());
      if (!roleTexts.includes(expectedRole)) continue;
      const reference = String(party?.reference?.reference || party?.reference || '').trim();
      if (reference) return reference;
    }
  }
  return undefined;
}

function extractSignerReference(contract: ContractLike, expectedRole: string): string | undefined {
  const signers = Array.isArray(contract.signer) ? contract.signer : contract.signer ? [contract.signer] : [];
  for (const signer of signers) {
    const roleTexts = extractRoleTexts(signer?.type).map((value) => value.toLowerCase());
    if (!roleTexts.includes(expectedRole)) continue;
    const reference = String(signer?.party?.reference || signer?.party?.identifier?.value || '').trim();
    if (reference) return reference;
  }
  return undefined;
}

function extractSignerReferenceWithAliases(
  contract: ContractLike,
  canonicalRole: string,
  legacyRole: string,
): string | undefined {
  return extractSignerReference(contract, canonicalRole) || extractSignerReference(contract, legacyRole);
}

function hasContractAgreementProof(credential: Record<string, any>, signatoryDid?: string): boolean {
  if (!signatoryDid) return false;
  const proofs = Array.isArray(credential.proof) ? credential.proof : credential.proof ? [credential.proof] : [];
  return proofs.some((proof: any) => {
    if (String(proof?.proofPurpose || '').trim() !== 'contractAgreement') return false;
    const verificationMethod = String(proof?.verificationMethod || '').trim();
    return verificationMethod === signatoryDid || verificationMethod.startsWith(`${signatoryDid}#`);
  });
}

function extractPurposes(contract: ContractLike): string[] {
  const terms = Array.isArray(contract.term) ? contract.term : contract.term ? [contract.term] : [];
  return Array.from(new Set(
    terms.flatMap((term) => {
      const typeItems = Array.isArray(term?.type) ? term.type : term?.type ? [term.type] : [];
      return typeItems.flatMap((item: any) => {
        if (!item || typeof item !== 'object') return [];
        const text = String(item.text || '').trim();
        const codingItems = Array.isArray(item.coding) ? item.coding : item.coding ? [item.coding] : [];
        const codingValues = codingItems
          .map((coding: any) => String(coding?.code || coding?.display || '').trim())
          .filter(Boolean);
        return [text, ...codingValues].flatMap((value) => splitCsv(value));
      });
    }),
  ));
}

function extractCapabilities(contract: ContractLike): string[] {
  const terms = Array.isArray(contract.term) ? contract.term : contract.term ? [contract.term] : [];
  return Array.from(new Set(
    terms.flatMap((term) => extractCapabilityValues(term?.offer?.securityLabel)),
  ));
}

function normalizeNow(input?: string | Date): number {
  if (input instanceof Date) return input.getTime();
  if (input) return new Date(input).getTime();
  return Date.now();
}

/**
 * Builds the canonical FHIR Contract. Signer entries identify legally
 * authorized signatories; technical tenant controllers are not inferred as
 * signatories. Historical controller role labels are accepted only on read.
 */
export function buildInterTenantAccessContractResource(
  claims: InterTenantAccessContractClaims,
): ContractLike {
  const identifier = readClaimWithAliases(claims, ClaimInterTenantAccessContract.identifier) || '';
  const status = readClaimWithAliases(claims, ClaimInterTenantAccessContract.status) || 'executed';
  const type = buildContractTypeCodeableConcept(
    readClaimWithAliases(claims, ClaimInterTenantAccessContract.type),
  );
  const issued = readClaimWithAliases(claims, ClaimInterTenantAccessContract.issued) || '';
  const appliesStart = readClaimWithAliases(claims, ClaimInterTenantAccessContract.appliesStart, ['Contract.applies.start']) || '';
  const appliesEnd = readClaimWithAliases(claims, ClaimInterTenantAccessContract.appliesEnd, ['Contract.applies.end']) || '';
  const providerOrganization = readClaimWithAliases(claims, ClaimInterTenantAccessContract.providerOrganization, ['Contract.term.offer.party.provider']) || '';
  const consumerOrganization = readClaimWithAliases(claims, ClaimInterTenantAccessContract.consumerOrganization, ['Contract.term.offer.party.consumer']) || '';
  const providerAuthorizedSignatory = readClaimWithAliases(
    claims,
    ClaimInterTenantAccessContract.providerAuthorizedSignatory,
    [ClaimInterTenantAccessContract.providerController, 'Contract.signer.provider'],
  ) || '';
  const consumerAuthorizedSignatory = readClaimWithAliases(
    claims,
    ClaimInterTenantAccessContract.consumerAuthorizedSignatory,
    [ClaimInterTenantAccessContract.consumerController, 'Contract.signer.consumer'],
  ) || '';
  const instantiatesUri = readClaimWithAliases(claims, ClaimInterTenantAccessContract.instantiatesUri, ['Contract.instantiatesUri']) || '';
  const capabilities = splitCsv(readClaimWithAliases(claims, ClaimInterTenantAccessContract.capability, ['Contract.term.offer.securityLabel']));
  const purposes = splitCsv(readClaimWithAliases(claims, ClaimInterTenantAccessContract.purpose, ['Contract.term.type']));

  return {
    resourceType: 'Contract',
    id: identifier || undefined,
    identifier: identifier ? [{ value: identifier }] : undefined,
    status,
    type,
    issued: issued || undefined,
    instantiatesUri: instantiatesUri || undefined,
    applies: {
      ...(appliesStart ? { start: appliesStart } : {}),
      ...(appliesEnd ? { end: appliesEnd } : {}),
    },
    signer: [
      providerAuthorizedSignatory
        ? {
            type: [{ text: PROVIDER_AUTHORIZED_SIGNATORY_ROLE }],
            party: { reference: providerAuthorizedSignatory },
          }
        : undefined,
      consumerAuthorizedSignatory
        ? {
            type: [{ text: CONSUMER_AUTHORIZED_SIGNATORY_ROLE }],
            party: { reference: consumerAuthorizedSignatory },
          }
        : undefined,
    ].filter(Boolean),
    term: [{
      type: purposes.map((purpose) => ({ text: purpose })),
      offer: {
        party: [
          providerOrganization
            ? {
                reference: { reference: providerOrganization },
                role: [{ text: PROVIDER_ROLE }],
              }
            : undefined,
          consumerOrganization
            ? {
                reference: { reference: consumerOrganization },
                role: [{ text: CONSUMER_ROLE }],
              }
            : undefined,
        ].filter(Boolean),
        securityLabel: capabilities.map((capability) => ({ text: capability })),
      },
    }],
  };
}

export function buildInterTenantAccessContractCredential(input: Readonly<{
  claims: InterTenantAccessContractClaims;
  issuer: string;
  validFrom: string;
  validUntil?: string;
  additionalCredential?: Record<string, unknown>;
}>): VerifiableCredentialV2 {
  return {
    '@context': [W3cCredentialContexts.V2],
    type: [
      W3cCredentialTypes.VerifiableCredential,
      ContractCredentialTypes.InterTenantAccessContractCredential,
    ],
    issuer: String(input.issuer || '').trim(),
    validFrom: String(input.validFrom || '').trim(),
    ...(input.validUntil ? { validUntil: String(input.validUntil).trim() } : {}),
    credentialSubject: buildInterTenantAccessContractResource(input.claims),
    ...(input.additionalCredential || {}),
  };
}

/** Summarizes tenant, authority and bilateral proof evidence from one Contract VC. */
export function summarizeInterTenantAccessContract(
  credential: unknown,
): InterTenantAccessContractSummary | undefined {
  if (!credential || typeof credential !== 'object') return undefined;
  const typeRaw = Array.isArray((credential as any).type) ? (credential as any).type : [(credential as any).type].filter(Boolean);
  if (!typeRaw.includes(ContractCredentialTypes.InterTenantAccessContractCredential)) return undefined;

  const subject = ((credential as any).credentialSubject || {}) as ContractLike;
  if (String(subject.resourceType || '').trim() !== 'Contract') return undefined;

  const providerAuthorizedSignatoryDid = extractSignerReferenceWithAliases(
    subject,
    PROVIDER_AUTHORIZED_SIGNATORY_ROLE,
    LEGACY_PROVIDER_CONTROLLER_ROLE,
  );
  const consumerAuthorizedSignatoryDid = extractSignerReferenceWithAliases(
    subject,
    CONSUMER_AUTHORIZED_SIGNATORY_ROLE,
    LEGACY_CONSUMER_CONTROLLER_ROLE,
  );

  return {
    identifier: firstIdentifierValue(subject.identifier) || String(subject.id || '').trim() || undefined,
    status: String(subject.status || '').trim() || undefined,
    issued: String(subject.issued || '').trim() || undefined,
    appliesStart: String(subject.applies?.start || '').trim() || undefined,
    appliesEnd: String(subject.applies?.end || '').trim() || undefined,
    providerOrganizationDid: extractOfferPartyReference(subject, PROVIDER_ROLE),
    consumerOrganizationDid: extractOfferPartyReference(subject, CONSUMER_ROLE),
    providerAuthorizedSignatoryDid,
    consumerAuthorizedSignatoryDid,
    providerControllerDid: providerAuthorizedSignatoryDid,
    consumerControllerDid: consumerAuthorizedSignatoryDid,
    hasProviderContractAgreementProof: hasContractAgreementProof(credential as Record<string, any>, providerAuthorizedSignatoryDid),
    hasConsumerContractAgreementProof: hasContractAgreementProof(credential as Record<string, any>, consumerAuthorizedSignatoryDid),
    capabilities: extractCapabilities(subject),
    purposes: extractPurposes(subject),
  };
}

export function isInterTenantAccessContractActive(
  summary: InterTenantAccessContractSummary | undefined,
  options: Readonly<{ now?: string | Date }> = {},
): boolean {
  if (!summary) return false;
  const status = String(summary.status || '').trim().toLowerCase();
  if (!ACTIVE_CONTRACT_STATUSES.has(status)) return false;

  const nowMs = normalizeNow(options.now);
  const startMs = summary.appliesStart ? Date.parse(summary.appliesStart) : NaN;
  const endMs = summary.appliesEnd ? Date.parse(summary.appliesEnd) : NaN;

  if (!Number.isNaN(startMs) && startMs > nowMs) return false;
  if (!Number.isNaN(endMs) && endMs < nowMs) return false;
  return true;
}

/**
 * Matches an active contract and, by default, requires contractAgreement
 * proofs whose verification methods belong to both named signatories.
 * Cryptographic proof verification must occur before this structural match.
 */
export function matchesInterTenantAccessContract(
  summary: InterTenantAccessContractSummary | undefined,
  criteria: InterTenantAccessContractMatchCriteria,
): boolean {
  if (!isInterTenantAccessContractActive(summary, { now: criteria.now })) return false;
  if (String(summary?.providerOrganizationDid || '').trim() !== String(criteria.providerOrganizationDid || '').trim()) return false;
  if (String(summary?.consumerOrganizationDid || '').trim() !== String(criteria.consumerOrganizationDid || '').trim()) return false;
  if ((criteria.requireBilateralContractAgreementProofs ?? true)
    && (!summary?.hasProviderContractAgreementProof || !summary?.hasConsumerContractAgreementProof)) return false;

  const requiredCapabilities = Array.from(new Set((criteria.requiredCapabilities || []).map((value) => String(value || '').trim()).filter(Boolean)));
  if (requiredCapabilities.length > 0) {
    const contractCapabilities = new Set((summary?.capabilities || []).map((value) => String(value || '').trim()));
    if (!requiredCapabilities.every((value) => contractCapabilities.has(value))) return false;
  }

  const purpose = String(criteria.purpose || '').trim();
  if (purpose) {
    const contractPurposes = new Set((summary?.purposes || []).map((value) => String(value || '').trim()));
    if (contractPurposes.size > 0 && !contractPurposes.has(purpose)) return false;
  }

  return true;
}

export function getMatchingInterTenantAccessContractFromVpToken(
  vpToken: string,
  criteria: InterTenantAccessContractMatchCriteria,
): Record<string, unknown> | undefined {
  const credentials = getVpCredentials(vpToken);
  return credentials.find((credential) => matchesInterTenantAccessContract(
    summarizeInterTenantAccessContract(credential),
    criteria,
  ));
}

function splitClaimCsv(value: unknown): string[] {
  return Array.from(new Set(
    String(value || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  ));
}

function isConsentLikeRuleActive(rule: Record<string, unknown>, now?: string | Date): boolean {
  const nowMs = normalizeNow(now);
  const startMs = Date.parse(String(rule[ClaimConsent.periodStart] || '').trim());
  const endMs = Date.parse(String(rule[ClaimConsent.periodEnd] || '').trim());
  if (!Number.isNaN(startMs) && startMs > nowMs) return false;
  if (!Number.isNaN(endMs) && endMs < nowMs) return false;
  return true;
}

/**
 * Returns the public blockchain-safe reference that a reused consent-style
 * authorization rule should store under `Consent.source-reference` when it
 * delegates use of one inter-tenant contract VC to an employee/researcher.
 *
 * Source-of-truth order:
 * - VC `id`
 * - FHIR `Contract.identifier`
 *
 * In both cases the reference is normalized through the same blockchain-safe
 * sanitization rule already used by consent-access assets.
 */
export function getInterTenantAccessContractBlockchainReference(
  credential: unknown,
): string | undefined {
  if (!credential || typeof credential !== 'object') return undefined;
  const vcId = sanitizeBlockchainReference((credential as Record<string, unknown>).id);
  if (vcId) return vcId;
  const summary = summarizeInterTenantAccessContract(credential);
  return sanitizeBlockchainReference(summary?.identifier);
}

/**
 * Evaluates one consent-style rule reused as an organization-to-employee
 * delegation for inter-tenant contract usage.
 *
 * Shared semantic contract:
 * - `Consent.subject` = consumer organization DID
 * - `Consent.actor-identifier` = delegated employee/researcher identifier
 * - `Consent.action` = allowed capabilities/scopes
 * - `Consent.purpose` = allowed purpose
 * - `Consent.source-reference` = blockchain-safe hash/reference of the
 *   underlying contract VC
 */
export function matchesInterTenantContractAuthorizationConsentRule(
  rule: Record<string, unknown>,
  contractCredential: unknown,
  criteria: InterTenantContractAuthorizationConsentCriteria,
): boolean {
  const summary = summarizeInterTenantAccessContract(contractCredential);
  if (!isInterTenantAccessContractActive(summary, { now: criteria.now })) {
    return false;
  }

  if (String(rule[ClaimConsent.decision] || '').trim() !== 'permit') return false;
  if (!isConsentLikeRuleActive(rule, criteria.now)) return false;
  if (String(rule[ClaimConsent.subject] || '').trim() !== String(criteria.consumerOrganizationDid || '').trim()) return false;
  if (String(rule[ClaimConsent.actorIdentifier] || '').trim() !== String(criteria.actorIdentifier || '').trim()) return false;

  const expectedReference = getInterTenantAccessContractBlockchainReference(contractCredential);
  const ruleReference = String(
    rule[ClaimConsent.sourceReference]
      || rule[ClaimConsent.eventBasedOn]
      || '',
  ).trim();
  if (!expectedReference || ruleReference !== expectedReference) return false;

  const purpose = String(criteria.purpose || '').trim();
  if (purpose) {
    const rulePurpose = String(rule[ClaimConsent.purpose] || '').trim();
    if (rulePurpose && rulePurpose !== purpose) return false;
  }

  const actorRole = String(criteria.actorRole || '').trim();
  if (actorRole) {
    const allowedRoles = splitClaimCsv(rule[ClaimConsent.actorRole]);
    if (allowedRoles.length > 0 && !allowedRoles.includes(actorRole)) return false;
  }

  const requiredCapabilities = Array.from(new Set((criteria.requiredCapabilities || []).map((value) => String(value || '').trim()).filter(Boolean)));
  if (requiredCapabilities.length > 0) {
    const allowedCapabilities = new Set(splitClaimCsv(rule[ClaimConsent.action]));
    if (!requiredCapabilities.every((value) => allowedCapabilities.has(value) || allowedCapabilities.has('*'))) return false;
  }

  if (requiredCapabilities.length > 0) {
    const contractCapabilities = new Set((summary?.capabilities || []).map((value) => String(value || '').trim()));
    if (!requiredCapabilities.every((value) => contractCapabilities.has(value))) return false;
  }

  if (purpose) {
    const contractPurposes = new Set((summary?.purposes || []).map((value) => String(value || '').trim()));
    if (contractPurposes.size > 0 && !contractPurposes.has(purpose)) return false;
  }

  return true;
}

export * from './inter-tenant-access-contract-types.js';
