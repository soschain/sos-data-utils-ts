import type {TestNetworkProviderPdfForm,TestNetworkLegalOrganizationPdfForm,TestNetworkLegalRepresentativePdfForm,TestNetworkControllerPdfForm,TestNetworkRegistrationDocumentMetadata,TestNetworkOrganizationRegistrationPdfForm,TestNetworkOrganizationRegistrationPdfFieldName} from 'sos-data-utils-ts/test-network-organization-registration-form'
import {TEST_NETWORK_ORGANIZATION_REGISTRATION_PDF_FIELDS} from 'sos-data-utils-ts/test-network-organization-registration-form'
declare const provider:TestNetworkProviderPdfForm,organization:TestNetworkLegalOrganizationPdfForm,representative:TestNetworkLegalRepresentativePdfForm,controller:TestNetworkControllerPdfForm,metadata:TestNetworkRegistrationDocumentMetadata
const complete:TestNetworkOrganizationRegistrationPdfForm={...provider,...organization,...representative,...controller,...metadata}
const keys:readonly (keyof TestNetworkOrganizationRegistrationPdfForm)[]=TEST_NETWORK_ORGANIZATION_REGISTRATION_PDF_FIELDS
const key:TestNetworkOrganizationRegistrationPdfFieldName='controllerKeyCommitment'
// @ts-expect-error authorization confirmation is boolean, not a free-text claim
const wrongConfirmation:TestNetworkLegalRepresentativePdfForm['representativeSelfDeclaration']='true'
// @ts-expect-error document metadata is required independently of applicant fields
const missingServerMetadata:TestNetworkOrganizationRegistrationPdfForm={...provider,...organization,...representative,...controller}
// @ts-expect-error technical controller type must not be conflated with representative block
const conflated:TestNetworkControllerPdfForm=representative
void [complete,keys,key,wrongConfirmation,missingServerMetadata,conflated]
