/** Pure application/PDF projection contracts. Values never establish signature, authority or admission. */

/** Deployment facts supplied by the BFF, not editable applicant identity. */
export interface TestNetworkProviderPdfForm {
  "hostServiceCountry": string;
  "hostServiceLegalName": string;
  "hostServiceTaxId": string;
  "hostServiceUrl": string;
}

/** Legal organization details; official identifier and professional licence remain distinct. */
export interface TestNetworkLegalOrganizationPdfForm {
  "Identification number": string;
  "organizationLegalName": string;
  "organizationName": string;
  "organizationAddressCountry": string;
  "organizationAddressRegion": string;
  "organizationOfficialLicense": string;
  "organizationAddressPostalCode": string;
  "organizationAddressLine": string;
  "organizationAddressCity": string;
  "organizationContactUrl": string;
  "organizationContactEmail": string;
  "organizationContactPhone": string;
  "organizationServiceCategory": string;
  "organizationIdentifierType": string;
  "organizationIndexProvider": boolean;
  "organizationResearchProvider": boolean;
}

/** Legal representative details and declaration, separate from technical custody. */
export interface TestNetworkLegalRepresentativePdfForm {
  "representativeFullName": string;
  "representativeContactEmail": string;
  "representativeContactPhone": string;
  "representativeIdentifierType": string;
  "representativeIdentifierValue": string;
  "representativeIdentifierCountry": string;
  "representativeIdentifierRegion": string;
  "representativeSelfDeclaration": boolean;
  "I confirm that I am duly authorized by the organization to submit this application": boolean;
}

/** Technical controller details; same-person declaration does not imply verified authority. */
export interface TestNetworkControllerPdfForm {
  "controllerFullName": string;
  "controllerContactEmail": string;
  "controllerContactPhone": string;
  "controllerIdentifierType": string;
  "controllerIdentifierValue": string;
  "controllerIdentifierCountry": string;
  "controllerIdentifierRegion": string;
  "representativeIsController": boolean;
  "The legal representative and the technical controller of the service are the same person": boolean;
}

/** BFF-owned immutable document version, signing date and controller public-key commitment. */
export interface TestNetworkRegistrationDocumentMetadata {
  "docVersion": string;
  "signDate": string;
  "controllerKeyCommitment": string;
}

/** Exact supplied AcroForm field projection; no transport or jurisdiction policy. */
export type TestNetworkOrganizationRegistrationPdfForm = TestNetworkProviderPdfForm & TestNetworkLegalOrganizationPdfForm & TestNetworkLegalRepresentativePdfForm & TestNetworkControllerPdfForm & TestNetworkRegistrationDocumentMetadata;

/** Ordered immutable field catalog, including historical sentence-shaped checkboxes. */
export const TEST_NETWORK_ORGANIZATION_REGISTRATION_PDF_FIELDS = Object.freeze([
  "Identification number",
  "I confirm that I am duly authorized by the organization to submit this application",
  "The legal representative and the technical controller of the service are the same person",
  "hostServiceCountry",
  "hostServiceLegalName",
  "hostServiceTaxId",
  "hostServiceUrl",
  "organizationLegalName",
  "organizationName",
  "organizationAddressCountry",
  "organizationAddressRegion",
  "organizationOfficialLicense",
  "organizationAddressPostalCode",
  "organizationAddressLine",
  "organizationAddressCity",
  "organizationContactUrl",
  "organizationContactEmail",
  "organizationContactPhone",
  "representativeContactEmail",
  "representativeFullName",
  "representativeIdentifierValue",
  "representativeIdentifierCountry",
  "representativeIdentifierRegion",
  "controllerContactPhone",
  "controllerFullName",
  "controllerContactEmail",
  "controllerIdentifierValue",
  "controllerIdentifierCountry",
  "controllerIdentifierRegion",
  "representativeContactPhone",
  "organizationServiceCategory",
  "representativeIdentifierType",
  "controllerIdentifierType",
  "representativeSelfDeclaration",
  "representativeIsController",
  "docVersion",
  "signDate",
  "organizationIndexProvider",
  "organizationResearchProvider",
  "organizationIdentifierType",
  "controllerKeyCommitment"
] as const);

export type TestNetworkOrganizationRegistrationPdfFieldName = typeof TEST_NETWORK_ORGANIZATION_REGISTRATION_PDF_FIELDS[number];
