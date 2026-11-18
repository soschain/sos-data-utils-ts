// Copyright 2026 Antifraud Services Inc. under Apache-2.0.
// Selective ledger identity contract reviewed at source revision 74479fa3fc8d8cbf92a9ff13dd626ccf8d6f2b1e.
import {encodeMultibaseSha3} from 'antifraud-data-utils-ts/encoding'
import {DataspaceSectors,type DataspaceSector} from './dataspace-sectors.js'
// Copyright 2026 Antifraud Services Inc. under the Apache License, Version 2.0.



/** Lifecycle of one organization-owned, role-bearing licence assignment. */
export type OrganizationRoleLicenseStatus = 'active' | 'revoked';

/**
 * Contractual policy for one sector.
 *
 * Every entry targets one canonical dataspace sector. Omitting `maxDevices`
 * delegates the numeric limit to the GW/portal policy.
 */
export interface OrganizationRoleLicenseSectorPolicy {
  sector: DataspaceSector;
  active: boolean;
  maxDevices?: number;
}

/**
 * Public ledger projection of one licence assigned by an organization.
 *
 * The stable contact is a one-way `urn:multibase:` identifier. Clear email,
 * telephone, tenant-local employee UUIDs, payment details, DCR registrations,
 * hosts and application permissions must never be written to this asset.
 */
export interface OrganizationRoleLicense {
  id: string;
  /** Official legal identifier value; never an embedded `urn:org:*` identifier. */
  organizationOfficialId: string;
  jurisdiction: string;
  stableContactIdentifier: string;
  licensedRole: string;
  status: OrganizationRoleLicenseStatus;
  data: OrganizationRoleLicenseSectorPolicy[];
  createdAt: number;
  updatedAt: number;
  revokedAt?: number;
}
export type OrganizationRoleLicenseIdentity = Readonly<{
  jurisdiction: string;
  organizationOfficialId: string;
  stableContactIdentifier: string;
  licensedRole: string;
}>;

function required(value: string, label: string): string {
  const normalized = String(value || '').trim();
  if (!normalized) throw new TypeError(`${label} is required.`);
  return normalized;
}

function normalizedSector(value: string): string {
  return String(value || '').trim().toLowerCase();
}

export const DEFAULT_ORGANIZATION_ROLE_LICENSE_POLICY: OrganizationRoleLicenseSectorPolicy =
  Object.freeze({
    sector: DataspaceSectors.OneHealthResearch,
    active: true,
  });

function validateStableContactIdentifier(value: string): string {
  const normalized = required(value, 'stableContactIdentifier');
  if (!/^urn:multibase:z[1-9A-HJ-NP-Za-km-z]+$/.test(normalized)) {
    throw new TypeError('stableContactIdentifier must be a canonical urn:multibase value.');
  }
  return normalized;
}

export function validateOrganizationOfficialId(value: string): string {
  const normalized = required(value, 'organizationOfficialId');
  if (normalized.includes(':') || /^urn:/i.test(normalized)) {
    throw new TypeError(
      'organizationOfficialId must be the official identifier value, not an organization URN.',
    );
  }
  return normalized;
}

/**
 * Builds the exact, compact licence preimage agreed across portals and hosts.
 * The preimage is hashed before persistence and is never itself a ledger key.
 */
export function buildOrganizationRoleLicensePreimage(
  identity: OrganizationRoleLicenseIdentity,
): string {
  const jurisdiction = required(identity.jurisdiction, 'jurisdiction').toLowerCase();
  const organizationOfficialId = validateOrganizationOfficialId(identity.organizationOfficialId);
  const stableContactIdentifier = validateStableContactIdentifier(identity.stableContactIdentifier);
  const licensedRole = required(identity.licensedRole, 'licensedRole');
  return `urn:cds-${jurisdiction}:${organizationOfficialId}:${stableContactIdentifier}:${licensedRole}`;
}

/** SHA3-384 multihash identifier for organization + contact + licensed role. */
export function buildOrganizationRoleLicenseId(
  identity: OrganizationRoleLicenseIdentity,
): string {
  return `urn:multibase:${encodeMultibaseSha3(buildOrganizationRoleLicensePreimage(identity), 384)}`;
}

/** Validates and de-duplicates sector policies while preserving input order. */
export function normalizeOrganizationRoleLicensePolicies(
  policies: readonly OrganizationRoleLicenseSectorPolicy[],
): OrganizationRoleLicenseSectorPolicy[] {
  if (!Array.isArray(policies) || policies.length === 0) {
    throw new TypeError('At least one licence sector policy is required.');
  }
  const seen = new Set<DataspaceSector>();
  return policies.map((policy) => {
    const sector = normalizedSector(policy.sector) as DataspaceSector;
    if (!sector) throw new TypeError('Licence sector policy requires a canonical sector.');
    if (!Object.values(DataspaceSectors).includes(sector)) {
      throw new TypeError(`Unsupported licence sector policy: ${sector}.`);
    }
    if (seen.has(sector)) throw new TypeError(`Duplicate licence sector policy: ${sector}.`);
    seen.add(sector);
    if (policy.maxDevices !== undefined
      && (!Number.isInteger(policy.maxDevices) || policy.maxDevices < 1)) {
      throw new TypeError('maxDevices must be omitted or a positive integer.');
    }
    return {
      sector,
      active: Boolean(policy.active),
      ...(policy.maxDevices === undefined ? {} : { maxDevices: policy.maxDevices }),
    };
  });
}

/** Resolves the exact canonical sector policy. */
export function resolveOrganizationRoleLicensePolicy(
  policies: readonly OrganizationRoleLicenseSectorPolicy[],
  sector: string,
): OrganizationRoleLicenseSectorPolicy | undefined {
  const requested = required(sector, 'sector').toLowerCase();
  return policies.find((policy) => normalizedSector(policy.sector) === requested);
}

/** Returns the contractual limit or the positive GW/portal default. */
export function resolveOrganizationRoleLicenseMaxDevices(
  policy: OrganizationRoleLicenseSectorPolicy,
  defaultMaxDevices: number,
): number {
  if (policy.maxDevices !== undefined) return policy.maxDevices;
  if (!Number.isInteger(defaultMaxDevices) || defaultMaxDevices < 1) {
    throw new TypeError('defaultMaxDevices must be a positive integer.');
  }
  return defaultMaxDevices;
}

/** Checks global status plus the resolved exact-sector policy. */
export function organizationRoleLicenseAllowsSector(
  license: Readonly<{
    status: OrganizationRoleLicense['status'];
    data: readonly OrganizationRoleLicenseSectorPolicy[];
  }>,
  sector: string,
): boolean {
  if (license.status !== 'active') return false;
  return resolveOrganizationRoleLicensePolicy(license.data, sector)?.active === true;
}
