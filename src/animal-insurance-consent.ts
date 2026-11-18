import {
  ClaimConsent,
  ConsentDecisions,
  ConsentStatuses,
} from 'fhir-data-utils-ts'
import {
  HealthcareConsentPurposes,
} from 'fhir-data-utils-ts'
import { ResourceTypesFhirR4 } from 'fhir-data-utils-ts'
import {
  consentFlatToFhirR4,
  consentFlatToFhirR5,
} from 'fhir-data-utils-ts'

/** W3C ODRL and VetChain profile identifiers used by insurance eligibility consent. */
export const AnimalInsuranceConsentVocabulary = Object.freeze({
  OdrlContext: 'http://www.w3.org/ns/odrl.jsonld',
  Agreement: 'Agreement',
  Read: 'read',
  Equal: 'eq',
  GreaterThanOrEqual: 'gteq',
  LessThanOrEqual: 'lteq',
  MediaType: 'application/odrl+json',
  Profile: 'https://vetchain.app/ns/odrl/animal-insurance-eligibility/v1',
  EligibilitySummaryTarget: 'https://vetchain.app/ns/asset/animal-insurance-eligibility-summary',
  FactKindOperand: 'https://vetchain.app/ns/odrl/operand/eligibility-fact-kind',
  ClinicalCodeOperand: 'https://vetchain.app/ns/odrl/operand/clinical-code',
  DataPeriodStartOperand: 'https://vetchain.app/ns/odrl/operand/data-period-start',
  DataPeriodEndOperand: 'https://vetchain.app/ns/odrl/operand/data-period-end',
} as const)

export const AnimalInsuranceEligibilityFactKinds = Object.freeze({
  LatestEventDate: 'latest-event-date',
  EventCount: 'event-count',
} as const)

export const AnimalInsuranceConsentErrors = Object.freeze({
  InvalidOdrl: 'insurance_consent_odrl_invalid',
  OdrlClaimsDiverge: 'insurance_consent_odrl_claims_diverge',
  ResearchForbidden: 'insurance_consent_research_forbidden',
  FactsRequired: 'insurance_consent_facts_required',
} as const)

/** Reusable values for package, GW and portal contract tests. */
export const ANIMAL_INSURANCE_CONSENT_TEST_DATA = Object.freeze({
  consentId: 'animal-insurance-consent-test-01',
  consentIdentifier: 'urn:uuid:54b4d158-ed78-48b4-b006-84ba5a5d85b4',
  subjectReference: 'Patient/animal-beneficiary-test-01',
  controllerReference: 'RelatedPerson/controller-test-01',
  insurerReference: 'Organization/animal-insurer-test-01',
  managerReference: 'Organization/vetchain-consent-manager-test-01',
  enforcerReference: 'Organization/vetchain-consent-enforcer-test-01',
  createdAt: '2026-09-08',
  consentPeriodStart: '2026-09-08T00:00:00Z',
  consentPeriodEnd: '2026-10-08T00:00:00Z',
  dataPeriodStart: '2025-09-08T00:00:00Z',
  dataPeriodEnd: '2026-09-08T00:00:00Z',
  actorRole: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode|PAYOR',
  action: 'http://terminology.hl7.org/CodeSystem/consentaction|access',
  purpose: `http://terminology.hl7.org/CodeSystem/v3-ActReason|${HealthcareConsentPurposes.Operations}`,
  scope: 'http://terminology.hl7.org/CodeSystem/consentscope|patient-privacy',
  category: 'http://loinc.org|59284-0',
  resourceType: 'http://hl7.org/fhir/fhir-types|Observation',
  clinicalCode: 'http://loinc.org|85353-1',
  secondClinicalCode: 'http://loinc.org|8310-5',
  clinicalCodeList: 'http://loinc.org|85353-1,http://loinc.org|8310-5',
  status: ConsentStatuses.Active,
  decision: ConsentDecisions.Permit,
  factKind: AnimalInsuranceEligibilityFactKinds.LatestEventDate,
  forbiddenPurpose: `http://terminology.hl7.org/CodeSystem/v3-ActReason|${HealthcareConsentPurposes.Research}`,
  divergentInsurerReference: 'Organization/different-animal-insurer-test-01',
  jurisdiction: 'CA',
  fhirConsentResourceType: ResourceTypesFhirR4.Consent,
} as const)

export type AnimalInsuranceEligibilityFact = Readonly<{
  kind: typeof AnimalInsuranceEligibilityFactKinds[keyof typeof AnimalInsuranceEligibilityFactKinds]
  clinicalCode: string
}>

export type AnimalInsuranceConsentInput = Readonly<{
  id: string
  identifier: string
  subjectReference: string
  grantorReference: string
  granteeReference: string
  managerReference: string
  controllerReference: string
  createdAt: string
  consentPeriod: Readonly<{ start: string; end: string }>
  dataPeriod: Readonly<{ start: string; end: string }>
  actorRole: string
  action: string
  purpose: string
  scope: string
  category: string
  resourceType: string
  facts: readonly AnimalInsuranceEligibilityFact[]
}>

/** Complete reusable builder input used by downstream GW, SDK and portal tests. */
export const ANIMAL_INSURANCE_CONSENT_TEST_INPUT: AnimalInsuranceConsentInput = Object.freeze({
  id: ANIMAL_INSURANCE_CONSENT_TEST_DATA.consentId,
  identifier: ANIMAL_INSURANCE_CONSENT_TEST_DATA.consentIdentifier,
  subjectReference: ANIMAL_INSURANCE_CONSENT_TEST_DATA.subjectReference,
  grantorReference: ANIMAL_INSURANCE_CONSENT_TEST_DATA.controllerReference,
  granteeReference: ANIMAL_INSURANCE_CONSENT_TEST_DATA.insurerReference,
  managerReference: ANIMAL_INSURANCE_CONSENT_TEST_DATA.managerReference,
  controllerReference: ANIMAL_INSURANCE_CONSENT_TEST_DATA.enforcerReference,
  createdAt: ANIMAL_INSURANCE_CONSENT_TEST_DATA.createdAt,
  consentPeriod: Object.freeze({
    start: ANIMAL_INSURANCE_CONSENT_TEST_DATA.consentPeriodStart,
    end: ANIMAL_INSURANCE_CONSENT_TEST_DATA.consentPeriodEnd,
  }),
  dataPeriod: Object.freeze({
    start: ANIMAL_INSURANCE_CONSENT_TEST_DATA.dataPeriodStart,
    end: ANIMAL_INSURANCE_CONSENT_TEST_DATA.dataPeriodEnd,
  }),
  actorRole: ANIMAL_INSURANCE_CONSENT_TEST_DATA.actorRole,
  action: ANIMAL_INSURANCE_CONSENT_TEST_DATA.action,
  purpose: ANIMAL_INSURANCE_CONSENT_TEST_DATA.purpose,
  scope: ANIMAL_INSURANCE_CONSENT_TEST_DATA.scope,
  category: ANIMAL_INSURANCE_CONSENT_TEST_DATA.category,
  resourceType: ANIMAL_INSURANCE_CONSENT_TEST_DATA.resourceType,
  facts: Object.freeze([{
    kind: ANIMAL_INSURANCE_CONSENT_TEST_DATA.factKind,
    clinicalCode: ANIMAL_INSURANCE_CONSENT_TEST_DATA.clinicalCode,
  }, {
    kind: AnimalInsuranceEligibilityFactKinds.EventCount,
    clinicalCode: ANIMAL_INSURANCE_CONSENT_TEST_DATA.secondClinicalCode,
  }]),
})

export type ClaimsFirstAnimalInsuranceConsent = Readonly<{
  resourceType: typeof ResourceTypesFhirR4.Consent
  id: string
  meta: Readonly<{ claims: Readonly<Record<string, string>> }>
}>

export type AnimalInsuranceOdrlConstraint = Readonly<{
  leftOperand: string
  operator: string
  rightOperand: string
}>

export type AnimalInsuranceOdrlPolicy = Readonly<{
  '@context': typeof AnimalInsuranceConsentVocabulary.OdrlContext
  '@type': typeof AnimalInsuranceConsentVocabulary.Agreement
  uid: string
  profile: typeof AnimalInsuranceConsentVocabulary.Profile
  assigner: string
  assignee: string
  permission: readonly Readonly<{
    target: typeof AnimalInsuranceConsentVocabulary.EligibilitySummaryTarget
    action: typeof AnimalInsuranceConsentVocabulary.Read
    constraint: readonly AnimalInsuranceOdrlConstraint[]
  }>[]
}>

function encodeBase64Utf8(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary)
}

function decodeBase64Utf8(value: string): string {
  const binary = atob(value)
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function buildPolicy(input: AnimalInsuranceConsentInput): AnimalInsuranceOdrlPolicy {
  return {
    '@context': AnimalInsuranceConsentVocabulary.OdrlContext,
    '@type': AnimalInsuranceConsentVocabulary.Agreement,
    uid: input.identifier,
    profile: AnimalInsuranceConsentVocabulary.Profile,
    assigner: input.grantorReference,
    assignee: input.granteeReference,
    permission: input.facts.map((fact) => ({
      target: AnimalInsuranceConsentVocabulary.EligibilitySummaryTarget,
      action: AnimalInsuranceConsentVocabulary.Read,
      constraint: [
        { leftOperand: AnimalInsuranceConsentVocabulary.FactKindOperand, operator: AnimalInsuranceConsentVocabulary.Equal, rightOperand: fact.kind },
        { leftOperand: AnimalInsuranceConsentVocabulary.ClinicalCodeOperand, operator: AnimalInsuranceConsentVocabulary.Equal, rightOperand: fact.clinicalCode },
        { leftOperand: AnimalInsuranceConsentVocabulary.DataPeriodStartOperand, operator: AnimalInsuranceConsentVocabulary.GreaterThanOrEqual, rightOperand: input.dataPeriod.start },
        { leftOperand: AnimalInsuranceConsentVocabulary.DataPeriodEndOperand, operator: AnimalInsuranceConsentVocabulary.LessThanOrEqual, rightOperand: input.dataPeriod.end },
      ],
    })),
  }
}

function rejectResearchSemantics(input: Pick<AnimalInsuranceConsentInput, 'purpose' | 'resourceType'>): void {
  if (input.purpose.split('|').at(-1) === HealthcareConsentPurposes.Research
    || input.resourceType.split('|').at(-1) === ResourceTypesFhirR4.ResearchStudy) {
    throw new TypeError(AnimalInsuranceConsentErrors.ResearchForbidden)
  }
}

/**
 * Builds an atomic claims-first FHIR Consent for one insurer eligibility query.
 * Standard authorization semantics are mirrored in flat Consent claims; the
 * complete query-shaping policy remains an ODRL JSON attachment.
 */
export function buildAnimalInsuranceEligibilityConsent(
  input: AnimalInsuranceConsentInput,
): ClaimsFirstAnimalInsuranceConsent {
  rejectResearchSemantics(input)
  if (!input.facts.length) throw new TypeError(AnimalInsuranceConsentErrors.FactsRequired)
  if (input.facts.some((fact) => !Object.values(AnimalInsuranceEligibilityFactKinds).includes(fact.kind))) {
    throw new TypeError(AnimalInsuranceConsentErrors.InvalidOdrl)
  }
  const policy = buildPolicy(input)
  return {
    resourceType: ResourceTypesFhirR4.Consent,
    id: input.id,
    meta: {
      claims: {
        '@context': 'org.hl7.fhir.api',
        [ClaimConsent.identifier]: input.identifier,
        [ClaimConsent.status]: ConsentStatuses.Active,
        [ClaimConsent.subject]: input.subjectReference,
        [ClaimConsent.date]: input.createdAt,
        [ClaimConsent.decision]: ConsentDecisions.Permit,
        [ClaimConsent.periodStart]: input.consentPeriod.start,
        [ClaimConsent.periodEnd]: input.consentPeriod.end,
        [ClaimConsent.dataPeriodStart]: input.dataPeriod.start,
        [ClaimConsent.dataPeriodEnd]: input.dataPeriod.end,
        [ClaimConsent.grantor]: input.grantorReference,
        [ClaimConsent.grantee]: input.granteeReference,
        [ClaimConsent.manager]: input.managerReference,
        [ClaimConsent.controller]: input.controllerReference,
        [ClaimConsent.actorIdentifier]: input.granteeReference,
        [ClaimConsent.actorRole]: input.actorRole,
        [ClaimConsent.action]: input.action,
        [ClaimConsent.purpose]: input.purpose,
        [ClaimConsent.scope]: input.scope,
        [ClaimConsent.category]: input.category,
        [ClaimConsent.resourceType]: input.resourceType,
        [ClaimConsent.provisionCode]: input.facts.map((fact) => fact.clinicalCode).join(','),
        [ClaimConsent.attachmentContentType]: AnimalInsuranceConsentVocabulary.MediaType,
        [ClaimConsent.attachmentData]: encodeBase64Utf8(JSON.stringify(policy)),
      },
    },
  }
}

function constraintValue(
  permission: AnimalInsuranceOdrlPolicy['permission'][number],
  operand: string,
): string | undefined {
  return permission.constraint.find((constraint) => constraint.leftOperand === operand)?.rightOperand
}

/** Parses the attached ODRL and fails closed unless its authorization semantics match the claims. */
export function validateAnimalInsuranceConsentOdrlParity(
  resource: ClaimsFirstAnimalInsuranceConsent,
): AnimalInsuranceOdrlPolicy {
  const claims = resource?.meta?.claims
  if (resource?.resourceType !== ResourceTypesFhirR4.Consent
    || claims?.[ClaimConsent.attachmentContentType] !== AnimalInsuranceConsentVocabulary.MediaType) {
    throw new TypeError(AnimalInsuranceConsentErrors.InvalidOdrl)
  }
  let policy: AnimalInsuranceOdrlPolicy
  try {
    policy = JSON.parse(decodeBase64Utf8(claims[ClaimConsent.attachmentData])) as AnimalInsuranceOdrlPolicy
  } catch {
    throw new TypeError(AnimalInsuranceConsentErrors.InvalidOdrl)
  }
  const permissions = Array.isArray(policy.permission) ? policy.permission : []
  const codes = permissions.map((permission) => constraintValue(permission, AnimalInsuranceConsentVocabulary.ClinicalCodeOperand)).filter(Boolean)
  const periodsMatch = permissions.every((permission) =>
    constraintValue(permission, AnimalInsuranceConsentVocabulary.DataPeriodStartOperand) === claims[ClaimConsent.dataPeriodStart]
    && constraintValue(permission, AnimalInsuranceConsentVocabulary.DataPeriodEndOperand) === claims[ClaimConsent.dataPeriodEnd])
  const coreMatches = policy['@context'] === AnimalInsuranceConsentVocabulary.OdrlContext
    && policy['@type'] === AnimalInsuranceConsentVocabulary.Agreement
    && policy.profile === AnimalInsuranceConsentVocabulary.Profile
    && policy.uid === claims[ClaimConsent.identifier]
    && policy.assigner === claims[ClaimConsent.grantor]
    && policy.assignee === claims[ClaimConsent.grantee]
    && claims[ClaimConsent.actorIdentifier] === claims[ClaimConsent.grantee]
    && claims[ClaimConsent.decision] === ConsentDecisions.Permit
    && permissions.length > 0
    && permissions.every((permission) => permission.target === AnimalInsuranceConsentVocabulary.EligibilitySummaryTarget
      && permission.action === AnimalInsuranceConsentVocabulary.Read)
    && codes.join(',') === claims[ClaimConsent.provisionCode]
    && periodsMatch
  if (!coreMatches) throw new TypeError(AnimalInsuranceConsentErrors.OdrlClaimsDiverge)
  rejectResearchSemantics({
    purpose: claims[ClaimConsent.purpose],
    resourceType: claims[ClaimConsent.resourceType],
  })
  return policy
}

/** Validates parity, then exports a native FHIR R4 Consent without ODRL-only fields. */
export function projectAnimalInsuranceConsentToFhirR4(resource: ClaimsFirstAnimalInsuranceConsent): Record<string, unknown> {
  validateAnimalInsuranceConsentOdrlParity(resource)
  return consentFlatToFhirR4(resource.meta.claims)
}

/** Validates parity, then exports a native FHIR R5 Consent without ODRL-only fields. */
export function projectAnimalInsuranceConsentToFhirR5(resource: ClaimsFirstAnimalInsuranceConsent): Record<string, unknown> {
  validateAnimalInsuranceConsentOdrlParity(resource)
  return consentFlatToFhirR5(resource.meta.claims)
}
