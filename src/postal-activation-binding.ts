// Selective hosted identity contract reviewed from source revision 74479fa3fc8d8cbf92a9ff13dd626ccf8d6f2b1e.
// Copyright 2025-2026 Antifraud Services Inc. under Apache-2.0. Parsing and hashing never grant authority.
/** Canonical protected-code algorithm used by postal activation bindings. */
export const POSTAL_ACTIVATION_CODE_BINDING_ALGORITHM = 'scrypt-v1' as const;

/** Lifecycle for a separate postal-address verification credential. */
export const PostalActivationLicenseStatuses = Object.freeze({
  Issued: 'issued',
  Delivered: 'delivered',
  Redeemed: 'redeemed',
  Revoked: 'revoked',
  Expired: 'expired',
} as const);

export type PostalActivationLicenseStatus =
  typeof PostalActivationLicenseStatuses[keyof typeof PostalActivationLicenseStatuses];

/**
 * Public binding recorded for the activation licence. The activation code is
 * deliberately absent. The VC carries only a salted, pepper-dependent scrypt
 * binding so the host can verify the same code later without disclosing it or
 * enabling offline guessing from the credential alone.
 */
export type PostalActivationLicenseBinding = Readonly<{
  licenseId: string;
  applicationId: string;
  organizationIdentifier: string;
  controllerEmail: string;
  controllerKeyMaterial: string;
  postalAddressHash: string;
  protectedCode: Readonly<{
    algorithm: typeof POSTAL_ACTIVATION_CODE_BINDING_ALGORITHM;
    salt: string;
    digest: string;
  }>;
  hostDid: string;
  network: 'test-network' | 'network';
  status: PostalActivationLicenseStatus;
  issuedAt: string;
  expiresAt: string;
  deliveredAt?: string;
  redeemedAt?: string;
}>;

/** Reusable protected-code slice stored in encrypted host registration state. */
export type PostalActivationCodeBinding = PostalActivationLicenseBinding['protectedCode'];
