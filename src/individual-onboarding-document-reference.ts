import {ResourceTypesFhirR4,DocumentReferenceClaim} from 'fhir-data-utils-ts';
import type {IndividualOnboardingPdfDocumentReferenceClaims,IndividualOnboardingPdfDocumentReferenceEntry,IndividualOnboardingPdfDocumentReferenceInput,IndividualOnboardingPdfDraftBundle} from './individual-onboarding-contract.js';
function normalizeText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function buildIndividualOnboardingPdfDocumentReferenceClaims(
  input: IndividualOnboardingPdfDocumentReferenceInput,
): IndividualOnboardingPdfDocumentReferenceClaims {
  const claims: Record<string, unknown> = {
    ...(input.claims || {}),
    [DocumentReferenceClaim.Subject]: input.subject,
    [DocumentReferenceClaim.ContentData]: input.contentData,
    [DocumentReferenceClaim.ContentType]: normalizeText(input.contentType) || 'application/pdf',
  };

  const optionalClaims: Array<readonly [string, unknown]> = [
    [DocumentReferenceClaim.Identifier, normalizeText(input.identifier)],
    [DocumentReferenceClaim.Description, normalizeText(input.description)],
    [DocumentReferenceClaim.Date, normalizeText(input.date)],
    [DocumentReferenceClaim.Location, normalizeText(input.location)],
    [DocumentReferenceClaim.ContentHash, normalizeText(input.contentHash)],
    [DocumentReferenceClaim.Language, normalizeText(input.language)],
  ];

  for (const [claimKey, claimValue] of optionalClaims) {
    if (claimValue !== undefined) {
      claims[claimKey] = claimValue;
    }
  }

  return claims;
}

export function buildIndividualOnboardingPdfDocumentReferenceEntry(
  input: IndividualOnboardingPdfDocumentReferenceInput,
): IndividualOnboardingPdfDocumentReferenceEntry {
  return {
    type: ResourceTypesFhirR4.DocumentReference,
    resource: {
      resourceType: ResourceTypesFhirR4.DocumentReference,
      meta: {
        claims: buildIndividualOnboardingPdfDocumentReferenceClaims(input),
      },
    },
  };
}

export function buildIndividualOnboardingPdfDraftBundle(
  input: IndividualOnboardingPdfDocumentReferenceInput,
): IndividualOnboardingPdfDraftBundle {
  return {
    resourceType: 'Bundle',
    type: 'collection',
    total: 1,
    data: [buildIndividualOnboardingPdfDocumentReferenceEntry(input)],
  };
}

/**
 * Builds the canonical `body.data[]` request bundle for the individual
 * controller onboarding-PDF draft flow.
 *
 * Current scope:
 * - individual controller only
 * - `DocumentReference` carries the PDF as claims-first metadata in
 *   `resource.meta.claims`
 *
 * Future controllers (for example legal-organization controller onboarding)
 * should use a different helper instead of overloading this one.
 */
export function buildIndividualOnboardingPdfDraftRequestBundle(
  input: IndividualOnboardingPdfDocumentReferenceInput,
): IndividualOnboardingPdfDraftBundle {
  return buildIndividualOnboardingPdfDraftBundle(input);
}
