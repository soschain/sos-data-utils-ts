// Copyright 2026 Antifraud Services Inc. under the Apache License, Version 2.0.

/**
 * Canonical flat claim keys used when a frontend captures an inter-tenant
 * access contract form and sends it to a backend before the final FHIR
 * `Contract` resource is assembled.
 *
 * Notes:
 * - these keys are claims-first transport helpers, not the legal source of
 *   truth
 * - the canonical legal payload is the FHIR `Contract` placed in
 *   `credentialSubject` of the emitted VC
 * - custom flat keys are used only where base FHIR does not define a simple
 *   one-claim scalar path suitable for UI transport
 */
export enum ClaimInterTenantAccessContract {
  /** Stable business identifier of the agreement/contract. */
  identifier = 'Contract.identifier',
  /** FHIR Contract lifecycle status, for example `executed` or `amended`. */
  status = 'Contract.status',
  /**
   * FHIR `Contract.type` CodeableConcept encoded as `system|code` in the flat
   * claims transport. The terminology authority is supplied by the adopting
   * governance domain rather than hardcoded in this product-neutral package.
   */
  type = 'Contract.type',
  /** When the agreement was formally issued. */
  issued = 'Contract.issued',
  /** Agreement validity start date/time. */
  appliesStart = 'Contract.applies-start',
  /** Agreement validity end date/time. */
  appliesEnd = 'Contract.applies-end',
  /**
   * Provider organization DID.
   *
   * Meaning for programmers:
   * - this is the tenant that owns/exposes the protected data
   * - in the current example this is the provider organization
   */
  providerOrganization = 'Contract.provider-organization',
  /**
   * Consumer organization DID.
   *
   * Meaning for programmers:
   * - this is the foreign tenant requesting access under the agreement
   * - in the current example this is the consumer organization
   */
  consumerOrganization = 'Contract.consumer-organization',
  /** DID of the person legally authorized to sign for the provider. */
  providerAuthorizedSignatory = 'Contract.provider-authorized-signatory',
  /** DID of the person legally authorized to sign for the consumer. */
  consumerAuthorizedSignatory = 'Contract.consumer-authorized-signatory',
  /** @deprecated Read-only compatibility alias. Technical control is not legal signing authority. */
  providerController = 'Contract.provider-controller',
  /** @deprecated Read-only compatibility alias. Technical control is not legal signing authority. */
  consumerController = 'Contract.consumer-controller',
  /**
   * Allowed operational capability, expressed with the same vocabulary used by
   * GW service capabilities and SMART-like root scopes.
   *
   * Example:
   * - `organization/Composition.rs`
   */
  capability = 'Contract.security-label',
  /**
   * Allowed business/legal purpose for the access.
   *
   * Example:
   * - `HRESCH` (HL7 v3 ActReason: healthcare research)
   */
  purpose = 'Contract.term-type',
  /**
   * External instantiated artifact for the agreement, typically the signed PDF
   * or CID/URL of the contract itself plus direct contractual annexes.
   *
   * Canonical FHIR field:
   * - `Contract.instantiatesUri`
   *
   * Flat claim rule in this stack:
   * - use FHIR-style `instantiates-uri` in claims, then map it to
   *   `instantiatesUri` in the actual FHIR resource object
   */
  instantiatesUri = 'Contract.instantiates-uri',
}

export type InterTenantAccessContractClaims =
  Partial<Record<ClaimInterTenantAccessContract, string>>;

export type InterTenantAccessContractSummary = Readonly<{
  identifier?: string;
  status?: string;
  issued?: string;
  appliesStart?: string;
  appliesEnd?: string;
  providerOrganizationDid?: string;
  consumerOrganizationDid?: string;
  providerAuthorizedSignatoryDid?: string;
  consumerAuthorizedSignatoryDid?: string;
  /** @deprecated Use providerAuthorizedSignatoryDid. */
  providerControllerDid?: string;
  /** @deprecated Use consumerAuthorizedSignatoryDid. */
  consumerControllerDid?: string;
  hasProviderContractAgreementProof: boolean;
  hasConsumerContractAgreementProof: boolean;
  capabilities: readonly string[];
  purposes: readonly string[];
}>;

export type InterTenantAccessContractMatchCriteria = Readonly<{
  providerOrganizationDid: string;
  consumerOrganizationDid: string;
  requiredCapabilities?: readonly string[];
  purpose?: string;
  now?: string | Date;
  /** Defaults to true for access-token authorization. */
  requireBilateralContractAgreementProofs?: boolean;
}>;

export type InterTenantContractAuthorizationConsentCriteria = Readonly<{
  consumerOrganizationDid: string;
  actorIdentifier: string;
  actorRole?: string;
  requiredCapabilities?: readonly string[];
  purpose?: string;
  now?: string | Date;
}>;
