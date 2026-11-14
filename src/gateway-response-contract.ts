import { ResourceTypesFhirR4 } from 'fhir-data-utils-ts'

/** Accepted URL sections; advertising a route does not establish permission. */
export const GatewayRouteSections = Object.freeze({
  Entity: 'entity', Identity: 'identity', Individual: 'individual',
  Network: 'network', Registry: 'registry',
} as const)

/** SOS gateway route namespaces, distinct from canonical clinical coding systems. */
export const GatewayRouteFormats = Object.freeze({
  Auth: 'auth', Firebase: 'firebase', FhirApi: 'org.hl7.fhir.api',
  OpenId: 'openid', SchemaOrg: 'org.schema',
} as const)

/** Stable identity-operation entry discriminators, not proof that the operation succeeded. */
export const IdentityAuthResponseEntryTypes = Object.freeze({
  LicenseIssued: 'License:Issued', DeviceRevoked: 'Device:Revoked',
} as const)

/** Employee and licence search entry types used by the organization directory. */
export const OrganizationEmployeeSearchResponseEntryTypes = Object.freeze({
  Employee: 'Employee-search-response-v1.0', License: 'License-search-response-v1.0',
} as const)

/** Versioned SOS response-entry discriminators; the terminal response still carries its own status. */
export const GatewayResponseEntryTypes = Object.freeze({
  BundleSearch: 'Bundle-search-response-v1.0',
  BundleSummary: 'Bundle-summary-response-v1.0',
  CommunicationIngestionRequest: 'Communication-ingestion-request-v1.0',
  CommunicationSearch: 'Communication-search-response-v1.0',
  CompositionSearch: 'Composition-search-response-v1.0',
  DeviceRegistered: 'Device:Registered',
  DocumentReferenceSearch: 'DocumentReference-search-response-v1.0',
  EmployeeLicenseOffer: 'Employee-license-offer-v1.0',
  EmployeeSearch: OrganizationEmployeeSearchResponseEntryTypes.Employee,
  FamilyDisable: 'Family-disable-response-v1.0',
  FamilyOrder: 'Family-order-response-v1.0',
  FamilyOwnerDirectory: 'Family-owner-directory-result-v1.0',
  FamilyPurge: 'Family-purge-response-v1.0',
  FamilyRegistrationOffer: 'Family-registration-offer-v1.0',
  FamilySearch: 'Family-search-result-v1.0',
  IcaEnroll: 'IcaEnrollResponse-v1.0',
  IndividualLicenseOffer: 'Individual-license-offer-v1.0',
  LicenseGeneration: 'LicenseGenerationResult',
  LicenseIssued: IdentityAuthResponseEntryTypes.LicenseIssued,
  LicenseSearch: OrganizationEmployeeSearchResponseEntryTypes.License,
  MedicationStatementSearch: 'MedicationStatement-search-response-v1.0',
  MessagingDelete: 'MessagingDeleteResponse-v1.0',
  MessagingGet: 'MessagingGetResponse-v1.0',
  MessagingList: 'MessagingListResponse-v1.0',
  MessagingReceive: 'MessagingReceiveResponse-v1.0',
  MessagingResponse: 'MessagingResponse-v1.0',
  MessagingSend: 'MessagingSendResponse-v1.0',
  OfferSearch: 'Offer-search-response-v1.0',
  OperationOutcome: ResourceTypesFhirR4.OperationOutcome,
  OrganizationActivation: 'Organization-activation-response-v1.0',
  OrganizationLifecycleStatus: 'Organization-lifecycle-status-response-v1.0',
  OrganizationLicenseOffer: 'Organization-license-offer-response-v1.0',
  OrganizationOrder: 'Organization-order-response-v1.0',
  OrganizationPurge: 'Organization-purge-response-v1.0',
  OrderSearch: 'Order-search-response-v1.0',
  RelatedPersonSearch: 'RelatedPerson-search-response-v1.0',
  ResearchSubjectSearch: 'ResearchSubject-search-response-v1.0',
  SubjectSearch: 'Subject-search-response-v1.0',
} as const)

/** Non-FHIR resource names used by SOS gateway envelopes. */
export const GatewayInternalResourceTypes = Object.freeze({
  Document: 'Document', IcaEnrollmentResult: 'IcaEnrollmentResult',
} as const)
