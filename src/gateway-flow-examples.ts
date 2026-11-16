// Copyright 2026 Antifraud Services Inc. under Apache-2.0.
// Selective synthetic flow fixtures: canonical independent owners derive identities and clinical claims.
import { REPOSITORY_SAFE_EXAMPLES as safe } from './repository-privacy.js'
import { DataspaceSectors } from './dataspace-sectors.js'
import { HealthcareActorRoles } from './healthcare-roles.js'
import { HealthcarePermissionSummarySections } from './healthcare-sections.js'
import { BundleEntryClaimsContext } from './consent-access-editor-contract.js'
import { SecureIdTypesIndividual, normalizeIndividualIdentifierType } from './identity-identifiers.js'
import { buildHostedProviderDidWeb, buildIndividualDidWeb, buildIndividualMemberDidWeb, buildSecureIdValueIndividual, buildSecureIdValueMember, buildProfessionalDidWeb } from './hosted-did.js'
import { buildOrganizationAuthorizationUrnCds } from './organization-authorization-urn.js'
import { encodeBase58btc } from 'antifraud-data-utils-ts/encoding'
import { FhirCodeSystems, ResourceTypesFhirR4, HL7_CODING_SYSTEM_V3_ROLE_CODE, CommunicationCategoryCodes } from 'fhir-data-utils-ts'
import { CommunicationClaim } from 'fhir-data-utils-ts/claims'

export const EXAMPLE_TENANT_IDENTIFIER = safe.tenantId;
export const EXAMPLE_JURISDICTION = safe.secondaryCountryIso2;
export const EXAMPLE_ROUTE_VERSION = 'v1' as const;
export const EXAMPLE_SECTOR = DataspaceSectors.HealthCare;
export const EXAMPLE_EMAIL_CONTROLLER_ORG = `controller@${safe.domain}`;
export const EXAMPLE_ORGANIZATION_LEGAL_NAME = safe.organizationLegalName;
export const EXAMPLE_LEGAL_ORGANIZATION_TAX_ID = `ES-${safe.organizationBusinessNumber}`;
export const EXAMPLE_EMAIL_CONTROLLER_INDIVIDUAL = safe.individualEmail;
export const EXAMPLE_SELF_REGISTERED_INDIVIDUAL_EMAIL_NORMALIZED = safe.individualEmail;
export const EXAMPLE_REGISTERED_SUBJECT_ALTERNATE_NAME = 'Doraemon' as const;
export const EXAMPLE_REGISTERED_SUBJECT_BIRTH_YEAR = '2020' as const;
export const EXAMPLE_PDF_CONSENT_DATE = '2026-06-08' as const;
export const EXAMPLE_SIGNED_TERMS_PDF_URL = `${safe.httpsBaseUrl}/files/legal-organization-signed-terms.pdf`;
export const EXAMPLE_SERVICE_PROVIDER_DOMAIN = safe.domain;
export const EXAMPLE_KYC_CONTROLLER_UUID = '033ceb35-2528-402e-8385-f22e12f57805' as const;
export const EXAMPLE_KYC_CONTROLLER_USER_UUID = '8c18ec13-e908-4b7a-91bb-134bb3a229e1' as const;
export const EXAMPLE_KYC_CONTROLLER_GIVEN_NAME = safe.firstContactGivenName;
export const EXAMPLE_KYC_CONTROLLER_FAMILY_NAME = safe.personFamilyName;
export const EXAMPLE_KYC_CONTROLLER_COUNTRY = 'VE' as const;
export const EXAMPLE_KYC_CONTROLLER_CITY = 'Caracas' as const;
export const EXAMPLE_KYC_CONTROLLER_STREET_ADDRESS = 'Av. Principal 123' as const;
export const EXAMPLE_KYC_CONTROLLER_IDENTIFIER = 'V-12345678' as const;
export const EXAMPLE_KYC_CONTROLLER_POSTAL_CODE = '1010' as const;
export const EXAMPLE_KYC_CONTROLLER_TELEPHONE = safe.phoneE164;
export const EXAMPLE_KYC_CONTROLLER_BIRTHDATE = '1990-01-01' as const;
export const EXAMPLE_KYC_CONTROLLER_VERIFIED_AT = '2026-05-14T23:43:05.869+00:00' as const;
export const EXAMPLE_KYC_CONTROLLER_LANGUAGE = 'es' as const;
export const EXAMPLE_KYC_CONTROLLER_CREATED_AT = '2026-05-14T23:43:05.913+00:00' as const;
export const EXAMPLE_KYC_CONTROLLER_UPDATED_AT = '2026-05-14T23:43:05.913+00:00' as const;
export const EXAMPLE_KYC_CONTROLLER_GENDER_MALE = 'male' as const;
export const EXAMPLE_CONTROLLER_IDENTIFIER_TYPE = normalizeIndividualIdentifierType(SecureIdTypesIndividual.NationalNumber);
export const EXAMPLE_SYNTHETIC_CERT_COUNTRY = 'ES' as const;
export const EXAMPLE_FORM_CONTROLLER_PHONE = safe.firstContactPhoneE164;
export const EXAMPLE_FORM_SUBJECT_PHONE = safe.secondContactPhoneE164;
export const EXAMPLE_FORM_SUBJECT_IDENTIFIER_VALUE = 'identifier-subject-001' as const;
export const EXAMPLE_DEMO_PORTAL_ID_TOKEN =
  'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJkZW1vLXVzZXIiLCJlbWFpbCI6ImRlbW9AZXhhbXBsZS5vcmcifQ.demo' as const;
export const EXAMPLE_ACCOUNT_OWNER_ID = 'account-owner-example' as const;
export const ExampleHttpStatusText = Object.freeze({
  Ok: '200',
  Conflict: '409',
} as const);
export const EXAMPLE_TENANT_ROUTE_CONTEXT = {
  tenantId: EXAMPLE_TENANT_IDENTIFIER,
  jurisdiction: EXAMPLE_JURISDICTION,
  sector: EXAMPLE_SECTOR,
} as const;
export const EXAMPLE_CONTROLLER_DID = `${safe.didWeb}:controller`;
export const EXAMPLE_RESEARCH_CONTROLLER_DID = `${safe.didWeb}:research-controller`;
export const EXAMPLE_API_ORGANIZATION_DID = `${safe.didWeb}:api`;
export const EXAMPLE_PROFESSIONAL_DID = buildProfessionalDidWeb({
  organizationDidWeb: EXAMPLE_API_ORGANIZATION_DID,
  email: safe.firstContactEmail,
  role: HealthcareActorRoles.GeneralistMedicalPractitioner,
});
export const EXAMPLE_PROVIDER_ORGANIZATION_DID = `${safe.didWeb}:provider`;
export const EXAMPLE_GATEWAY_PUBLIC_ORIGIN = safe.httpsBaseUrl;
export const EXAMPLE_HOST_PUBLIC_HOSTNAME = safe.domain;
export const EXAMPLE_HOST_PUBLIC_DID = `did:web:${EXAMPLE_HOST_PUBLIC_HOSTNAME}` as const;
export const EXAMPLE_PROVIDER_TAX_ID = 'ES-B00112233' as const;
export const EXAMPLE_PROVIDER_LEGAL_IDENTIFIER_VALUE_CDS = 'ES-B00112233' as const;
export const EXAMPLE_PROVIDER_ORGANIZATION_AUTHORIZATION_URN_CDS =
  buildOrganizationAuthorizationUrnCds({
    jurisdiction: EXAMPLE_JURISDICTION,
    version: EXAMPLE_ROUTE_VERSION,
    identifierType: 'TAX',
    identifierValue: EXAMPLE_PROVIDER_LEGAL_IDENTIFIER_VALUE_CDS,
  });
export const EXAMPLE_INDIVIDUAL_MULTIBASE_ID =
  encodeBase58btc(Uint8Array.from('a87e5b15aea444759c7c40aa88354b6f'.match(/../gu)!, value => Number.parseInt(value,16)));
export const EXAMPLE_PRIVATE_INDIVIDUAL_UUID = 'a87e5b15-aea4-4475-9c7c-40aa88354b6f' as const;
export const EXAMPLE_INDIVIDUAL_MULTIBASE_ID_SECONDARY =
  encodeBase58btc(Uint8Array.from('b98f6c24bfb545849d8d51bb99465c7e'.match(/../gu)!, value => Number.parseInt(value,16)));
export const EXAMPLE_HOSTED_PROVIDER_DID = buildHostedProviderDidWeb({
  hostDomain: EXAMPLE_HOST_PUBLIC_HOSTNAME,
  sector: EXAMPLE_SECTOR,
  providerTaxId: EXAMPLE_PROVIDER_TAX_ID,
});
export const EXAMPLE_SUBJECT_DID = buildIndividualDidWeb({
  providerDidWeb: EXAMPLE_HOSTED_PROVIDER_DID,
  individualId: EXAMPLE_INDIVIDUAL_MULTIBASE_ID,
});
export const EXAMPLE_SUBJECT_DID_SECONDARY = buildIndividualDidWeb({
  providerDidWeb: EXAMPLE_HOSTED_PROVIDER_DID,
  individualId: EXAMPLE_INDIVIDUAL_MULTIBASE_ID_SECONDARY,
});
export const EXAMPLE_HOSTING_OPERATOR_DID = `${safe.didWeb}:host`;
export const EXAMPLE_TENANT_SERVICE_DID = `${safe.didWeb}:service`;
export const EXAMPLE_SECONDARY_TENANT_SERVICE_DID = `${safe.didWeb}:reader-service`;
export const EXAMPLE_PROVIDER_LEGAL_NAME = 'ACME Health Provider' as const;
export const EXAMPLE_SECONDARY_PROVIDER_LEGAL_NAME = 'Reader Only Provider' as const;
export const EXAMPLE_SECONDARY_PROVIDER_ALTERNATE_NAME = 'reader-only' as const;
export const EXAMPLE_COVERAGE_SCOPE_EU = 'EU' as const;
export const EXAMPLE_SECONDARY_EU_COUNTRY = 'PT' as const;
export const EXAMPLE_PROFILE_PROVIDER_DID = EXAMPLE_TENANT_SERVICE_DID;
export const EXAMPLE_EMAIL_PROFESSIONAL = safe.firstContactEmail;
export const EXAMPLE_HEALTHCARE_JURISDICTION = 'ES' as const;
export const EXAMPLE_ORGANIZATION_CONTROLLER_ROLE = 'RESPRSN' as const;
export const EXAMPLE_HEALTHCARE_ACTOR_ROLE_PHYSICIAN = HealthcareActorRoles.Physician;
export const EXAMPLE_INDIVIDUAL_CONTROLLER_ROLE_TYPE = HL7_CODING_SYSTEM_V3_ROLE_CODE;
export const EXAMPLE_INDIVIDUAL_CONTROLLER_ROLE_VALUE = EXAMPLE_ORGANIZATION_CONTROLLER_ROLE;
export const EXAMPLE_RELATED_PERSON_ROLE = 'v3-RoleCode|RESPRSN' as const;
export const EXAMPLE_SECURE_ID_VALUE_INDIVIDUAL = buildSecureIdValueIndividual({
  secureIdTypeIndividual: SecureIdTypesIndividual.Uuid,
  privateIdValueIndividual: EXAMPLE_PRIVATE_INDIVIDUAL_UUID,
});
export const EXAMPLE_SECURE_ID_VALUE_INDIVIDUAL_CONTROLLER = buildSecureIdValueMember({
  secureIdTypeMember: SecureIdTypesIndividual.Email,
  privateIdValueMember: EXAMPLE_EMAIL_CONTROLLER_INDIVIDUAL,
});
export const EXAMPLE_HOSTED_INDIVIDUAL_DID = buildIndividualDidWeb({
  providerDidWeb: EXAMPLE_HOSTED_PROVIDER_DID,
  secureIdTypeIndividual: SecureIdTypesIndividual.Uuid,
  secureIdValueIndividual: EXAMPLE_SECURE_ID_VALUE_INDIVIDUAL,
});
export const EXAMPLE_HOSTED_INDIVIDUAL_CONTROLLER_DID = buildIndividualMemberDidWeb({
  individualDidWeb: EXAMPLE_HOSTED_INDIVIDUAL_DID,
  memberId: EXAMPLE_SECURE_ID_VALUE_INDIVIDUAL_CONTROLLER,
  roleType: EXAMPLE_INDIVIDUAL_CONTROLLER_ROLE_TYPE,
  roleValue: EXAMPLE_INDIVIDUAL_CONTROLLER_ROLE_VALUE,
});
export const EXAMPLE_RELATED_PERSON_MEMBER_DID = buildIndividualMemberDidWeb({
  individualDidWeb: EXAMPLE_SUBJECT_DID,
  role: EXAMPLE_RELATED_PERSON_ROLE,
});
export const EXAMPLE_CLINICAL_SECTION_HISTORY_MEDICATION = 'LOINC|10160-0' as const;
export const EXAMPLE_CLINICAL_SECTION_ALLERGIES = HealthcarePermissionSummarySections.AllergiesAndIntolerances.attributeValue;
export const EXAMPLE_CLINICAL_CODE_PROBLEM = 'LOINC|11450-4' as const;
export const EXAMPLE_CONSENT_DATE = '2026-05-20' as const;
export const EXAMPLE_CONSENT_UUID = 'urn:uuid:consent-example-001' as const;
export const EXAMPLE_CONSENT_IDENTIFIER = EXAMPLE_CONSENT_UUID;
export const EXAMPLE_COMMUNICATION_UUID = 'urn:uuid:communication-example-001' as const;
export const EXAMPLE_COMMUNICATION_IDENTIFIER = EXAMPLE_COMMUNICATION_UUID;
export const EXAMPLE_IPS_BUNDLE_NOTE_TEXT = 'IPS ingestion request' as const;
export const EXAMPLE_CONTENT_TYPE_FHIR_JSON = 'application/fhir+json' as const;
export const EXAMPLE_IPS_BUNDLE_ATTACHMENT_TITLE = 'IPS Document Bundle' as const;
export const EXAMPLE_DOCUMENT_REFERENCE_CONTENT_TYPE_PDF = 'application/pdf' as const;
export const EXAMPLE_VITAL_SIGNS_EFFECTIVE_DATE_TIME = '2026-06-11T08:30:00Z' as const;
export const EXAMPLE_CONSENT_ATTACHMENT_CONTENT_TYPE = EXAMPLE_DOCUMENT_REFERENCE_CONTENT_TYPE_PDF;
export const EXAMPLE_CONSENT_ATTACHMENT_DATA_BASE64 =
  'JVBERi0xLjQKJUZha2UgY29uc2VudCBQREYgZm9yIGxvY2FsIHNtb2tlIHRlc3QK' as const;
export const EXAMPLE_EMPLOYEE_ACTIVATION_CODE = 'ACT-001' as const;
export const EXAMPLE_EMPLOYEE_DEVICE_CLIENT_ID_PRIMARY = 'client-employee-primary' as const;
export const EXAMPLE_EMPLOYEE_DEVICE_INSTANCE_ID_PRIMARY = 'installation-employee-primary' as const;
export const EXAMPLE_EMPLOYEE_DEVICE_INSTANCE_ID_TERTIARY = 'installation-employee-tertiary' as const;
export const EXAMPLE_CLIENT_INSTANCE_UUID = '7f5e8d6c-91f4-4f6d-a29f-8bd42e44f101' as const;
export const EXAMPLE_LICENSE_PAYMENT_METHOD_STRIPE = 'Stripe' as const;
export const EXAMPLE_LICENSE_INVOICE_ID = 'invoice-001' as const;
export const EXAMPLE_POSTAL_ACTIVATION_CODE = 'EXAMPLE-ACTIVATION-001' as const;
export const EXAMPLE_POSTAL_ACTIVATION_CODE_INVALID = 'EXAMPLE-ACTIVATION-INVALID' as const;
export const EXAMPLE_POSTAL_ACTIVATION_PEPPER = 'example-host-pepper' as const;
export const EXAMPLE_POSTAL_ACTIVATION_SALT = 'example-base64url-salt' as const;
export const EXAMPLE_LICENSE_SUBJECT_ID_ACTIVE = 'urn:uuid:employee-controller-active-001' as const;
export const EXAMPLE_LICENSE_SEAT_UUID_ACTIVE = '8a8a5e1b-0d8e-4a7c-8c39-3b8034440001' as const;
export const EXAMPLE_LICENSE_SEAT_UUID_SECONDARY = '8a8a5e1b-0d8e-4a7c-8c39-3b8034440002' as const;
export const EXAMPLE_LICENSE_SEAT_UUID_AVAILABLE = '8a8a5e1b-0d8e-4a7c-8c39-3b8034440009' as const;
export const EXAMPLE_DEVICE_CLIENT_ID = `${safe.didWeb}:device`;
export const EXAMPLE_OBSERVATION_IDENTIFIER = 'urn:uuid:observation-example-001' as const;
export const EXAMPLE_OBSERVATION_IDENTIFIER_IPS = 'vs-1' as const;
export const EXAMPLE_OBSERVATION_PANEL_IDENTIFIER = 'urn:uuid:observation-panel-example-001' as const;
export const EXAMPLE_IPS_COMPOSITION_IDENTIFIER = 'ips-composition' as const;
export const EXAMPLE_VITAL_SIGN_VALUE_BODY_TEMPERATURE = 37.1 as const;
export const EXAMPLE_OBSERVATION_BODY_WEIGHT_CODING = Object.freeze({
  system: FhirCodeSystems.Loinc,
  code: '29463-7',
  display: 'Body weight',
});
export const EXAMPLE_OBSERVATION_ANXIETY_CODING = Object.freeze({
  system: FhirCodeSystems.SnomedCt,
  code: '48694002',
  display: 'Anxiety',
});
export const EXAMPLE_OBSERVATION_EVENT_TIMING_NIGHT_CODING = Object.freeze({
  system: FhirCodeSystems.EventTiming,
  code: 'NIGHT',
  display: 'Night',
});
export const EXAMPLE_ALLERGY_IDENTIFIER = 'urn:uuid:allergy-example-001' as const;
export const EXAMPLE_ALLERGY_ONSET_DATE_TIME = '2026-03-01T09:00:00Z' as const;
export const EXAMPLE_CONTROLLER_SIGN_KEY = {
  kid: 'controller-es384-001',
  kty: 'EC',
  crv: 'P-384',
  x: '<x>',
  y: '<y>',
  alg: 'ES384',
  use: 'sig',
} as const;
export function buildExampleCommunicationIngestionPayload({
  subjectDid = EXAMPLE_SUBJECT_DID,
  sent = '2026-05-22T10:00:00Z',
  ipsBundleBase64 = '<base64-ips-bundle>',
} = {}) {
  // Good practice note:
  // Communication claim keys in examples must come from `CommunicationClaim`
  // instead of repeating raw `Communication.*` strings inline.
  return {
    body: {
      data: [
        {
          type: 'Communication-ingestion-request-v1.0',
          resource: {
            resourceType: ResourceTypesFhirR4.Communication,
            status: 'completed',
            subject: { reference: `Patient/${subjectDid}` },
            category: [{
              coding: [{
                system: CommunicationCategoryCodes.Notification.system,
                code: CommunicationCategoryCodes.Notification.code,
              }],
            }],
            payload: [
              {
                contentAttachment: {
                  contentType: EXAMPLE_CONTENT_TYPE_FHIR_JSON,
                  title: EXAMPLE_IPS_BUNDLE_ATTACHMENT_TITLE,
                  data: ipsBundleBase64,
                },
              },
            ],
            note: [{ text: EXAMPLE_IPS_BUNDLE_NOTE_TEXT }],
            meta: {
              claims: {
                // The surrounding resource is native FHIR R4, while flat
                // claims remain version-neutral and can later render as R4 or R5.
                '@context': BundleEntryClaimsContext,
                [CommunicationClaim.Category]: CommunicationCategoryCodes.Notification.claim,
                [CommunicationClaim.Subject]: subjectDid,
                [CommunicationClaim.Sent]: sent,
                [CommunicationClaim.ContentAttachmentType]: EXAMPLE_CONTENT_TYPE_FHIR_JSON,
                [CommunicationClaim.Text]: EXAMPLE_IPS_BUNDLE_NOTE_TEXT,
              },
            },
          },
        },
      ],
    },
  };
}
export type ExampleHostedTenantRouteContext = Readonly<{
  alternateName: string;
  jurisdiction: string;
  version: string;
  sector: string;
}>;
export function buildExampleHostedTenantBaseUrl(input: ExampleHostedTenantRouteContext): string {
  return `${EXAMPLE_GATEWAY_PUBLIC_ORIGIN}/${input.alternateName}/cds-${input.jurisdiction.toLowerCase()}/${input.version}/${input.sector}`;
}

export const EXAMPLE_MEDICATION_STATEMENT_UUID = 'urn:uuid:medication-statement-example-001' as const;
export const EXAMPLE_MEDICATION_STATEMENT_IDENTIFIER = EXAMPLE_MEDICATION_STATEMENT_UUID;
export const EXAMPLE_MEDICATION_STATEMENT_STATUS = 'active' as const;
export const EXAMPLE_MEDICATION_STATEMENT_TEXT = 'atorvastatin 20 mg oral tablet' as const;
export const EXAMPLE_COMPOSITION_IDENTIFIER_MEDICATION_DOCUMENT =
  'urn:uuid:composition-medication-document-001' as const;
export const EXAMPLE_COMPOSITION_TITLE_MEDICATION_DOCUMENT =
  'Medication document authored from the self-managed frontend' as const;
export const EXAMPLE_COMPOSITION_DATE_MEDICATION_DOCUMENT = '2026-07-06T10:15:00Z' as const;
export const EXAMPLE_CONDITION_IDENTIFIER = 'condition-example-001' as const;
export const EXAMPLE_CONDITION_CODE = 'http://snomed.info/sct|44054006' as const;
