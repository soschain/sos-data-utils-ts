// Selective hosted identity contract reviewed from source revision 74479fa3fc8d8cbf92a9ff13dd626ccf8d6f2b1e.
// Copyright 2025-2026 Antifraud Services Inc. under Apache-2.0. Parsing and hashing never grant authority.
import type { BundleJsonApi } from './bundle-contract.js';

export const OrganizationDidBindingEntryTypes = Object.freeze({
  Request: 'Organization-did-binding-request-v1.0',
  Response: 'Organization-did-binding-response-v1.0',
} as const);

export type OrganizationDidBindingErrorCode =
  | 'MISSING_ORGANIZATION_URL'
  | 'UNSUPPORTED_ORGANIZATION_LOCATOR';

export type OrganizationDidBindingValidationError = Readonly<{
  code: OrganizationDidBindingErrorCode;
  message: string;
  claimPaths: string[];
}>;

export type OrganizationDidBindingControllerInput = Readonly<{
  sameAs?: string;
}>;

export type OrganizationDidBindingOrganizationInput = Readonly<{
  url: string | string[];
  taxID?: string;
  taxId?: string;
  identifier?: string;
}>;

export type OrganizationDidBindingInput = Readonly<{
  organization: OrganizationDidBindingOrganizationInput;
  controller?: OrganizationDidBindingControllerInput;
}>;

export type ValidateOrganizationDidBindingInputResult = Readonly<{
  ok: boolean;
  errors: OrganizationDidBindingValidationError[];
  normalizedInput: Readonly<{
    organization: {
      url: string[];
    };
    controller?: OrganizationDidBindingControllerInput;
  }>;
}>;

function normalizeOptionalText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function normalizeOrganizationUrls(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const urls = value
      .map((item) => normalizeOptionalText(item))
      .filter((item): item is string => Boolean(item));
    return urls.length ? urls : undefined;
  }
  const raw = normalizeOptionalText(value);
  if (!raw) return undefined;
  const urls = raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return urls.length ? urls : undefined;
}


export function validateOrganizationDidBindingInput(
  input: OrganizationDidBindingInput,
): ValidateOrganizationDidBindingInputResult {
  const errors: OrganizationDidBindingValidationError[] = [];
  const normalizedUrls = normalizeOrganizationUrls(input?.organization?.url);
  const taxID = normalizeOptionalText(input?.organization?.taxID || input?.organization?.taxId);
  const identifier = normalizeOptionalText(input?.organization?.identifier);
  const controllerSameAs = normalizeOptionalText(input?.controller?.sameAs);

  if (!normalizedUrls?.length) {
    errors.push({
      code: 'MISSING_ORGANIZATION_URL',
      message: 'Organization DID binding requires at least one organization.url value.',
      claimPaths: ['organization.url'],
    });
  }

  if (taxID || identifier) {
    errors.push({
      code: 'UNSUPPORTED_ORGANIZATION_LOCATOR',
      message: 'Organization DID binding in the host uses the tenant path as locator and does not accept organization.taxID or organization.identifier in this version.',
      claimPaths: ['organization.taxID', 'organization.identifier'],
    });
  }

  return {
    ok: errors.length === 0,
    errors,
    normalizedInput: {
      organization: {
        url: normalizedUrls || [],
      },
      ...(controllerSameAs ? { controller: { sameAs: controllerSameAs } } : {}),
    },
  };
}


export function buildOrganizationDidBindingBundle(
  input: OrganizationDidBindingInput,
): BundleJsonApi {
  const validation = validateOrganizationDidBindingInput(input);
  if (!validation.ok) {
    throw new Error(validation.errors.map((item) => item.message).join(' '));
  }

  return {
    resourceType: 'Bundle',
    type: 'collection',
    total: 1,
    data: [{
      type: OrganizationDidBindingEntryTypes.Request,
      resource: {
        organization: {
          url: validation.normalizedInput.organization.url,
        },
        ...(validation.normalizedInput.controller
          ? { controller: validation.normalizedInput.controller }
          : {}),
      },
    }],
  } as BundleJsonApi;
}
