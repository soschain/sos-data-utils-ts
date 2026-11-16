// Copyright 2026 Antifraud Services Inc. under Apache-2.0.
// Selective synthetic wire examples; descriptors and example keys do not establish runtime authority.
import * as FhirClaims from 'fhir-data-utils-ts/claims'
import * as SchemaClaims from 'antifraud-data-utils-ts/schema-org-claims'
import {REPOSITORY_SAFE_EXAMPLES as safe} from './repository-privacy.js'
import * as shared from './gateway-flow-examples.js'
import {buildIndividualDidWeb,buildProfessionalDidWeb} from './hosted-did.js'
import {buildInterTenantAccessContractCredential} from './inter-tenant-access-contract.js'
import {buildSubjectIdentityBindingCredential} from './subject-identity-binding.js'
import {SchemaOrgPersonClaim} from 'antifraud-data-utils-ts/schema-org-claims'
import {HealthcareActorRoles} from './healthcare-roles.js'
import {DeviceUserClasses,DeviceAppTypes,LicenseStatuses} from './device-license-contract.js'
import {OrganizationEmployeeSearchResponseEntryTypes} from './gateway-response-contract.js'
import {SecureIdTypesIndividual} from './identity-identifiers.js'
import {BundleTypes} from './bundle-contract.js'
import {HttpMediaTypes} from './bff-wire-contract.js'
import {ServiceCapability} from './service-capabilities.js'
import {DataspaceSectors} from './dataspace-sectors.js'
import {ClaimInterTenantAccessContract} from './inter-tenant-access-contract.js'
import {buildOrganizationAuthorizationUrnCds} from './organization-authorization-urn.js'
import {HealthcareConsentPurposes,CommunicationCategoryCodes,VitalSignsCodes,VitalSignsUnits,ResourceTypesFhirR4} from 'fhir-data-utils-ts'
import type {ConfidentialStorageDoc} from './confidential-storage.js'
import type {CommunicationParticipantProjection,CommunicationParticipantSearchInput} from 'fhir-data-utils-ts/communication-participant-search'

const EXAMPLE_RESEARCH_API_ORGANIZATION_DID=`${safe.didWeb}:research-api`
const EXAMPLE_RESEARCH_TENANT_IDENTIFIER=`${safe.tenantId}-research`
export const EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_ID =
  'urn:uuid:inter-tenant-access-contract-001' as const;
export const EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_TYPE =
  `${safe.httpsBaseUrl}/fhir/CodeSystem/contract-type|data-sharing`;
export const EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_VALID_FROM =
  '2026-06-29T00:00:00.000Z' as const;
export const EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_VALID_UNTIL =
  '2027-06-29T00:00:00.000Z' as const;
export const EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_PURPOSE =
  HealthcareConsentPurposes.Research;
export const EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_SCOPE =
  ServiceCapability.IndexReader;
export const EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_SUBJECT_DID =
  shared.EXAMPLE_SUBJECT_DID;
export const EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_SECTION =
  'LOINC|48765-2' as const;
export const EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_AGREEMENT_PDF_URL =
  `${safe.httpsBaseUrl}/files/contracts/inter-tenant-contract.pdf`;
export const EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_CONSUMER_PROFESSIONAL_EMAIL =
  `researcher1@${safe.domain}`;
export const EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_CONSUMER_PROFESSIONAL_DID =
  buildProfessionalDidWeb({
    organizationDidWeb: EXAMPLE_RESEARCH_API_ORGANIZATION_DID,
    email: EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_CONSUMER_PROFESSIONAL_EMAIL,
    role: shared.EXAMPLE_HEALTHCARE_ACTOR_ROLE_PHYSICIAN,
  });
export const EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_PROVIDER_AUTHORIZED_SIGNATORY_DID =
  `${shared.EXAMPLE_API_ORGANIZATION_DID}:signatory`;
export const EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_CONSUMER_AUTHORIZED_SIGNATORY_DID =
  `${EXAMPLE_RESEARCH_API_ORGANIZATION_DID}:signatory`;
export const EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_SMART_SCOPE =
  `${EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_SCOPE}?subject=${EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_SUBJECT_DID}&section=${EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_SECTION}` as const;
export const EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_CLAIMS = Object.freeze({
  [ClaimInterTenantAccessContract.identifier]: EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_ID,
  [ClaimInterTenantAccessContract.status]: 'executed',
  [ClaimInterTenantAccessContract.type]: EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_TYPE,
  [ClaimInterTenantAccessContract.issued]: EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_VALID_FROM,
  [ClaimInterTenantAccessContract.appliesStart]: EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_VALID_FROM,
  [ClaimInterTenantAccessContract.appliesEnd]: EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_VALID_UNTIL,
  [ClaimInterTenantAccessContract.providerOrganization]: shared.EXAMPLE_API_ORGANIZATION_DID,
  [ClaimInterTenantAccessContract.consumerOrganization]: EXAMPLE_RESEARCH_API_ORGANIZATION_DID,
  [ClaimInterTenantAccessContract.providerAuthorizedSignatory]: EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_PROVIDER_AUTHORIZED_SIGNATORY_DID,
  [ClaimInterTenantAccessContract.consumerAuthorizedSignatory]: EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_CONSUMER_AUTHORIZED_SIGNATORY_DID,
  [ClaimInterTenantAccessContract.capability]: EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_SCOPE,
  [ClaimInterTenantAccessContract.purpose]: EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_PURPOSE,
  [ClaimInterTenantAccessContract.instantiatesUri]: EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_AGREEMENT_PDF_URL,
} as const);
export const EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_CREDENTIAL = Object.freeze(
  buildInterTenantAccessContractCredential({
    claims: EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_CLAIMS,
    issuer: shared.EXAMPLE_CONTROLLER_DID,
    validFrom: EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_VALID_FROM,
    validUntil: EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_VALID_UNTIL,
    additionalCredential: {
      id: EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_ID,
      proof: [
        {
          type: 'JsonWebSignature2020',
          proofPurpose: 'contractAgreement',
          verificationMethod: `${EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_PROVIDER_AUTHORIZED_SIGNATORY_DID}#contract-agreement`,
          jws: 'provider-authorized-signatory-proof',
        },
        {
          type: 'JsonWebSignature2020',
          proofPurpose: 'contractAgreement',
          verificationMethod: `${EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_CONSUMER_AUTHORIZED_SIGNATORY_DID}#contract-agreement`,
          jws: 'consumer-authorized-signatory-proof',
        },
      ],
    },
  }),
);
export const EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_CONTEXT = Object.freeze({
  providerTenantId: shared.EXAMPLE_TENANT_IDENTIFIER,
  providerSector: shared.EXAMPLE_SECTOR,
  providerOrganizationDid: shared.EXAMPLE_API_ORGANIZATION_DID,
  consumerTenantId: EXAMPLE_RESEARCH_TENANT_IDENTIFIER,
  consumerSector: DataspaceSectors.HealthResearch,
  consumerOrganizationDid: EXAMPLE_RESEARCH_API_ORGANIZATION_DID,
  jurisdiction: shared.EXAMPLE_JURISDICTION,
  actorRole: shared.EXAMPLE_HEALTHCARE_ACTOR_ROLE_PHYSICIAN,
  subjectDid: EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_SUBJECT_DID,
  consumerProfessionalDid: EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_CONSUMER_PROFESSIONAL_DID,
  requestedScope: EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_SCOPE,
  requestedSection: EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_SECTION,
  smartScope: EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_SMART_SCOPE,
  purpose: EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_PURPOSE,
} as const);
export const EXAMPLE_INTER_TENANT_ACCESS_CONTRACT_PROVIDER_ORGANIZATION_URN =
  buildOrganizationAuthorizationUrnCds({
    jurisdiction: shared.EXAMPLE_JURISDICTION,
    identifierType: 'TAX',
    identifierValue: shared.EXAMPLE_TENANT_IDENTIFIER,
  });

export {EXAMPLE_ORGANIZATION_ROLE_LICENSE,EXAMPLE_ORGANIZATION_ROLE_LICENSE_IDENTITY} from './organization-role-license-examples.js'
function freeze<T>(value:T):Readonly<T>{if(value&&typeof value==='object'){Object.freeze(value);for(const entry of Object.values(value))freeze(entry)}return value}
export const EXAMPLE_PORTAL_INDIVIDUAL_DID = buildIndividualDidWeb({providerDidWeb:`${safe.didWeb}:portal`,individualId:shared.EXAMPLE_INDIVIDUAL_MULTIBASE_ID})
export const EXAMPLE_ALTERNATE_PORTAL_INDIVIDUAL_DID = buildIndividualDidWeb({providerDidWeb:`${safe.didWeb}:cards`,individualId:shared.EXAMPLE_INDIVIDUAL_MULTIBASE_ID})
export const EXAMPLE_TRUSTED_HEALTH_PORTAL_DID = `${safe.didWeb}:portal`


export const EXAMPLE_DEVICE_LICENSE_AVAILABLE=freeze({
  "id": shared.EXAMPLE_LICENSE_SEAT_UUID_AVAILABLE,
  "tenantId": shared.EXAMPLE_TENANT_IDENTIFIER,
  "orderId": shared.EXAMPLE_LICENSE_INVOICE_ID,
  "userClass": "employee",
  "userCategory": shared.EXAMPLE_HEALTHCARE_ACTOR_ROLE_PHYSICIAN,
  "type": "mobile",
  "status": "available",
  "plan": "default",
  "renewalCycle": "12m",
  "reactivationEnabled": false,
  "exp": 1893456000
} as const)
export const EXAMPLE_EMPLOYEE_ACTIVE_DEVICE_BINDINGS=freeze([{
    "clientId": shared.EXAMPLE_EMPLOYEE_DEVICE_CLIENT_ID_PRIMARY,
    "clientInstanceId": shared.EXAMPLE_EMPLOYEE_DEVICE_INSTANCE_ID_PRIMARY,
    "status": "active",
    "deviceInfo": {
      "clientInstanceId": shared.EXAMPLE_EMPLOYEE_DEVICE_INSTANCE_ID_PRIMARY,
      "model": "Shared browser profile"
    },
    "activatedAt": 1786570800,
    "revokedAt": undefined
  },{
    "clientId": "client-employee-secondary",
    "clientInstanceId": "installation-employee-secondary",
    "status": "active",
    "deviceInfo": {
      "clientInstanceId": "installation-employee-secondary"
    },
    "activatedAt": 1786570900,
    "revokedAt": undefined
  }] as const)
export const EXAMPLE_LICENSE_ACTIVE_RECORD=freeze({
  "id": shared.EXAMPLE_LICENSE_SEAT_UUID_ACTIVE,
  "status": "active",
  "activationCode": shared.EXAMPLE_EMPLOYEE_ACTIVATION_CODE,
  "subjectId": shared.EXAMPLE_LICENSE_SUBJECT_ID_ACTIVE,
  "claims": {
    "@context": "org.schema",
    [SchemaClaims.SchemaOrgIndividualProductClaim.SerialNumber]: shared.EXAMPLE_LICENSE_SEAT_UUID_ACTIVE,
    [SchemaClaims.SchemaOrgIndividualProductClaim.Category]: "professional",
    [SchemaClaims.SchemaOrgIndividualProductClaim.AdditionalType]: "mobile",
    [SchemaClaims.SchemaOrgPersonClaim.Email]: shared.EXAMPLE_EMAIL_CONTROLLER_ORG,
    [SchemaClaims.SchemaOrgPersonClaim.OccupationIdentifierValue]: shared.EXAMPLE_HEALTHCARE_ACTOR_ROLE_PHYSICIAN
  }
} as const)
export const ExampleEmployeeEmails=freeze({
  "SharedProfessional": "shared.professional@example.invalid"
} as const)
export const ExampleEmployeeRoles=freeze({
  "Controller": shared.EXAMPLE_INDIVIDUAL_CONTROLLER_ROLE_VALUE,
  "Doctor": shared.EXAMPLE_HEALTHCARE_ACTOR_ROLE_PHYSICIAN
} as const)
export const EXAMPLE_EMPLOYEE_DOCTOR_ACTIVE=freeze({...{
  "resourceId": "urn:uuid:22222222-2222-4222-8222-222222222222",
  "identifier": shared.EXAMPLE_API_ORGANIZATION_DID + ":employee:zW1pyWCpGPgRpKMwSR8paD7RWtrQtT7tv84BvzDfHbnVWDC:ISCO-08|2211",
  "email": "shared.professional@example.invalid",
  "role": shared.EXAMPLE_HEALTHCARE_ACTOR_ROLE_PHYSICIAN,
  "status": "active"
},identifier:buildProfessionalDidWeb({organizationDidWeb:shared.EXAMPLE_API_ORGANIZATION_DID,email:ExampleEmployeeEmails.SharedProfessional,role:ExampleEmployeeRoles.Doctor})} as const)









export const EXAMPLE_SUBJECT_IDENTITY_BINDING_CREDENTIAL=freeze(buildSubjectIdentityBindingCredential({id:"urn:uuid:subject-identity-binding-001",issuerDid:EXAMPLE_TRUSTED_HEALTH_PORTAL_DID,subjectDid:EXAMPLE_PORTAL_INDIVIDUAL_DID,aliasDids:[EXAMPLE_ALTERNATE_PORTAL_INDIVIDUAL_DID],sectors:[shared.EXAMPLE_SECTOR],validFrom:"2026-01-01T00:00:00.000Z",validUntil:"2027-01-01T00:00:00.000Z"}))
export const EXAMPLE_INDIVIDUAL_ORGANIZATION_START_INPUT=freeze({
  "alternateName": "ana",
  "controllerEmail": shared.EXAMPLE_EMAIL_CONTROLLER_INDIVIDUAL,
  "timeoutSeconds": 7,
  "intervalSeconds": 2
} as const)
export const EXAMPLE_LIVE_CONSENT_GRANT_INPUT=freeze({
  "subjectDid": shared.EXAMPLE_SUBJECT_DID,
  "actorId": shared.EXAMPLE_PROFESSIONAL_DID,
  "actorRole": shared.EXAMPLE_HEALTHCARE_ACTOR_ROLE_PHYSICIAN,
  "purpose": "TREAT",
  "actions": [shared.EXAMPLE_CLINICAL_SECTION_ALLERGIES]
} as const)
export const EXAMPLE_EMPLOYEE_DEVICE_ACTIVATION_INPUT=freeze({
  "activationCode": shared.EXAMPLE_EMPLOYEE_ACTIVATION_CODE,
  "idToken": "employee-id-token-001",
  "dcrPayload": {
    "application_type": "native",
    "client_name": "Acme Controller App",
    "redirect_uris": ["acme-controller://callback"],
    "jwks": {
      "keys": [{
          "kid": "controller-didcomm-enc-001",
          "kty": "EC",
          "crv": "P-384",
          "x": "<enc-x>",
          "y": "<enc-y>",
          "use": "enc",
          "purposes": ["didcomm-enc"]
        }]
    },
    "ext_device_info": {
      "push_token": "ExponentPushToken[example-controller]",
      "push_provider": "expo",
      "device_id": "device-controller-001",
      "device_name": "Controller iPhone"
    }
  }
} as const)
export const EXAMPLE_GW_ORGANIZATION_ACTIVATE_PAYLOAD=freeze({
  "vp_token": "<ica-proof-token>",
  "controller": {
    "did": shared.EXAMPLE_CONTROLLER_DID,
    "sameAs": "mailto:" + shared.EXAMPLE_EMAIL_CONTROLLER_ORG,
    "publicKeyJwk": {
      "kid": "controller-es384-001",
      "kty": "EC",
      "crv": "P-384",
      "x": "<x>",
      "y": "<y>",
      "alg": "ES384",
      "use": "sig"
    },
    "jwks": {
      "keys": [{
          "kid": "controller-didcomm-enc-001",
          "kty": "EC",
          "crv": "P-384",
          "x": "<enc-x>",
          "y": "<enc-y>",
          "use": "enc",
          "purposes": ["didcomm-enc"]
        }]
    }
  }
} as const)
export const EXAMPLE_OPENID_SMART_TOKEN_INPUT=freeze({
  "idToken": "employee-id-token-001",
  "vpToken": "<vp-jws-or-jsonld>",
  "scopes": ["organization/Composition.rs?subject=did%3Aweb%3Ahost.example.com%3Ahealth-care%3Aorganization%3Ataxid%3AES-B00112233%3Aindividual%3Amultibase%3AzMomQqDS8U8M8MxEbzn7gjG&section=LOINC%7C48765-2"],
  "smartTokenKind": "openid-smart",
  "clientId": "device-1",
  "subjectDid": shared.EXAMPLE_SUBJECT_DID
} as const)
export const EXAMPLE_ORGANIZATION_EMPLOYEE_INPUT=freeze({
  "employeeClaims": {
    [SchemaClaims.SchemaOrgPersonClaim.Identifier]: "urn:uuid:11b2c3d4-e5f6-7890-1234-567890abcdef",
    [SchemaClaims.SchemaOrgPersonClaim.Email]: "receptionist1@example.invalid",
    [SchemaClaims.SchemaOrgPersonClaim.OccupationIdentifierValue]: "ISCO-08|4226"
  }
} as const)
export const EXAMPLE_SMART_PRESENTATION_SUBMISSION=freeze({
  "id": "ps-001",
  "definition_id": "pd-001",
  "descriptor_map": [{
      "id": "vp-credential",
      "format": "jwt_vp",
      "path": "$.vp_token"
    }]
} as const)
export const EXAMPLE_VITAL_SIGN_SYSTOLIC_BLOOD_PRESSURE_INPUT=freeze({
  "identifier": "urn:uuid:observation-component-example-001",
  "subject": shared.EXAMPLE_SUBJECT_DID,
  "code": VitalSignsCodes.SystolicBloodPressure,
  "unit": VitalSignsUnits.MillimeterOfMercury,
  "valueQuantity": 120,
  "effectiveDateTime": shared.EXAMPLE_VITAL_SIGNS_EFFECTIVE_DATE_TIME
} as const)
export const EXAMPLE_FAMILY_ORGANIZATION_SEARCH_RESPONSE_BODY=freeze({
  "body": {
    "data": [{
        "type": "Family-search-result-v1.0",
        "resource": {
          "id": "org-uuid-001",
          "meta": {
            "claims": {
              "org.schema.FamilyRegistration.status": "already_exists",
              [SchemaClaims.SchemaOrgOfferClaim.Identifier]: "offer-uuid-001",
              [SchemaClaims.SchemaOrgOrganizationClaim.Identifier]: "org-uuid-001",
              [SchemaClaims.SchemaOrgOrganizationClaim.AlternateName]: "Ana",
              [SchemaClaims.SchemaOrgOrganizationClaim.OwnerTelephone]: safe.firstContactPhoneE164,
              "org.schema.Organization.foundingDate": "2010-05-20"
            }
          }
        }
      }]
  }
} as const)
export const EXAMPLE_DEVICE_BOUND_SMART_DIDCOMM_MESSAGE=freeze({
  "meta": {
    "jws": {
      "protected": {
        "alg": "ES384",
        "kid": shared.EXAMPLE_DEVICE_CLIENT_ID + "#dcr-signing",
        "typ": "JWT",
        "cty": "application/didcomm-signed+json"
      }
    }
  },
  "iss": shared.EXAMPLE_DEVICE_CLIENT_ID,
  "from": shared.EXAMPLE_DEVICE_CLIENT_ID,
  "aud": shared.EXAMPLE_HOSTING_OPERATOR_DID,
  "jti": "urn:uuid:didcomm-smart-example",
  "thid": "didcomm-smart-example",
  "type": "Smart-token-request-v1.0",
  "body": {
    "client_id": shared.EXAMPLE_DEVICE_CLIENT_ID,
    "sub": shared.EXAMPLE_PROFESSIONAL_DID,
    "scope": "organization/Composition.rs?subject=did%3Aweb%3Ahost.example.com%3Ahealth-care%3Aorganization%3Ataxid%3AES-B00112233%3Aindividual%3Amultibase%3AzMomQqDS8U8M8MxEbzn7gjG&section=LOINC%7C60591-5"
  }
} as const)
export const EXAMPLE_ORG_ACTIVATION_CONTROLLER_CREDENTIAL=freeze({
  "@context": ["https://www.w3.org/ns/credentials/v2","https://schema.org"],
  "type": ["VerifiableCredential","ServiceControllerCredential"],
  "credentialSubject": {
    "id": "ESB00112233",
    "@type": "Service",
    "serviceType": "OrganizationControllerService",
    "provider": {
      "taxID": "ESB00112233"
    },
    "owner": {
      "@type": "Person",
      "additionalType": shared.EXAMPLE_INDIVIDUAL_CONTROLLER_ROLE_VALUE,
      "sameAs": "urn:multibase:zControllerHash",
      "hasOccupation": {
        "@type": "Occupation",
        "occupationalCategory": "ISCO-08|1330"
      },
      "hasCredential": {
        "material": "urn:ietf:params:oauth:jwk-thumbprint:sha-256:Q0ZfM0V4YW1wbGVUaHVtYnByaW50X2Jhc2U2NHVybA"
      }
    }
  }
} as const)
export const EXAMPLE_RELATED_PERSON_DISABLE_BUNDLE_PAYLOAD=freeze({
  "thid": "relatedperson-disable-example-001",
  "body": {
    "resourceType": "Bundle",
    "type": "batch",
    "entry": [{
        "request": {
          "method": "POST"
        },
        "resource": {
          "resourceType": "RelatedPerson",
          "identifier": [{
              "value": "rel-001"
            }],
          "meta": {
            "claims": {
              "@context": "org.hl7.fhir.api",
              [FhirClaims.RelatedPersonClaim.Identifier]: "rel-001",
              [FhirClaims.RelatedPersonClaim.Patient]: shared.EXAMPLE_SUBJECT_DID,
              [FhirClaims.RelatedPersonClaim.Telecom]: "mailto:parent.guardian@example.invalid",
              [FhirClaims.RelatedPersonClaim.Relationship]: shared.EXAMPLE_RELATED_PERSON_ROLE
            },
            "status": "inactive"
          },
          "id": "rel-001"
        }
      }]
  }
} as const)
export const EXAMPLE_RELATED_PERSON_PURGE_BUNDLE_PAYLOAD=freeze({
  "thid": "relatedperson-purge-example-001",
  "body": {
    "resourceType": "Bundle",
    "type": "batch",
    "entry": [{
        "type": "RelatedPerson-purge-request-v1.0",
        "request": {
          "method": "POST"
        },
        "resource": {
          "resourceType": "RelatedPerson",
          "identifier": [{
              "value": "rel-001"
            }],
          "meta": {
            "claims": {
              "@context": "org.hl7.fhir.api",
              [FhirClaims.RelatedPersonClaim.Identifier]: "rel-001",
              [FhirClaims.RelatedPersonClaim.Patient]: shared.EXAMPLE_SUBJECT_DID,
              [FhirClaims.RelatedPersonClaim.Telecom]: "mailto:parent.guardian@example.invalid",
              [FhirClaims.RelatedPersonClaim.Relationship]: shared.EXAMPLE_RELATED_PERSON_ROLE
            },
            "status": "purged"
          },
          "id": "rel-001"
        }
      }]
  }
} as const)
export const EXAMPLE_INDIVIDUAL_ORGANIZATION_DISABLE_PAYLOAD=freeze({
  "thid": "individual-organization-disable-example-001",
  "body": {
    "data": [{
        "type": "Family-disable-request-v1.0",
        "request": {
          "method": "POST"
        },
        "resource": {
          "meta": {
            "claims": {
              "@context": "org.schema",
              [SchemaClaims.SchemaOrgOrganizationClaim.IdentifierReference]: "{{individualIdentifier}}",
              [SchemaClaims.SchemaOrgOrganizationClaim.AlternateName]: "{{individualAlternateName}}",
              [SchemaClaims.SchemaOrgOrganizationClaim.OwnerEmail]: shared.EXAMPLE_EMAIL_CONTROLLER_INDIVIDUAL
            }
          }
        }
      }]
  }
} as const)
export const EXAMPLE_INDIVIDUAL_ORGANIZATION_PURGE_PAYLOAD=freeze({
  "thid": "individual-organization-purge-example-001",
  "body": {
    "data": [{
        "type": "Family-purge-request-v1.0",
        "request": {
          "method": "POST"
        },
        "resource": {
          "meta": {
            "claims": {
              "@context": "org.schema",
              [SchemaClaims.SchemaOrgOrganizationClaim.IdentifierReference]: "{{individualIdentifier}}",
              [SchemaClaims.SchemaOrgOrganizationClaim.AlternateName]: "{{individualAlternateName}}",
              [SchemaClaims.SchemaOrgOrganizationClaim.OwnerEmail]: shared.EXAMPLE_EMAIL_CONTROLLER_INDIVIDUAL
            }
          }
        }
      }]
  }
} as const)
export const EXAMPLE_TENANT_DELETE_MESSAGE=freeze({
  "operation": "delete",
  "resourceType": "Organization",
  "routeContext": {
    "tenantId": "host",
    "jurisdiction": shared.EXAMPLE_HEALTHCARE_JURISDICTION,
    "sector": shared.EXAMPLE_SECTOR
  },
  "claims": {
    "@context": "org.schema",
    [SchemaClaims.SchemaOrgOrganizationClaim.IdentifierType]: "taxID",
    [SchemaClaims.SchemaOrgOrganizationClaim.Identifier]: "{{tenantTaxId}}",
    [SchemaClaims.SchemaOrgOrganizationClaim.TaxId]: "{{tenantTaxId}}",
    [SchemaClaims.SchemaOrgOrganizationClaim.IdentifierReference]: "{{tenantDid}}"
  },
  "deleteReason": "{{deleteReason}}"
} as const)
export const EXAMPLE_TENANT_DISABLE_MESSAGE=freeze({
  "operation": "disable",
  "resourceType": "Organization",
  "routeContext": {
    "tenantId": "host",
    "jurisdiction": shared.EXAMPLE_HEALTHCARE_JURISDICTION,
    "sector": shared.EXAMPLE_SECTOR
  },
  "claims": {
    "@context": "org.schema",
    [SchemaClaims.SchemaOrgOrganizationClaim.IdentifierType]: "taxID",
    [SchemaClaims.SchemaOrgOrganizationClaim.Identifier]: "{{tenantTaxId}}",
    [SchemaClaims.SchemaOrgOrganizationClaim.TaxId]: "{{tenantTaxId}}",
    [SchemaClaims.SchemaOrgOrganizationClaim.IdentifierReference]: "{{tenantDid}}"
  },
  "expectedSemantics": {
    "keepsAuditTrail": true,
    "purgeAllowedByDefault": false,
    "requiresIcaCredentialStatusUpdate": true
  }
} as const)
export const EXAMPLE_TENANT_DISABLE_REQUEST_TYPE=freeze("Organization-disable-request-v1.0")
export const EXAMPLE_TENANT_ENABLE_MESSAGE=freeze({
  "operation": "enable",
  "resourceType": "Organization",
  "routeContext": {
    "tenantId": "host",
    "jurisdiction": shared.EXAMPLE_HEALTHCARE_JURISDICTION,
    "sector": shared.EXAMPLE_SECTOR
  },
  "claims": {
    "@context": "org.schema",
    [SchemaClaims.SchemaOrgOrganizationClaim.IdentifierType]: "taxID",
    [SchemaClaims.SchemaOrgOrganizationClaim.Identifier]: "{{tenantTaxId}}",
    [SchemaClaims.SchemaOrgOrganizationClaim.TaxId]: "{{tenantTaxId}}",
    [SchemaClaims.SchemaOrgOrganizationClaim.IdentifierReference]: "{{tenantDid}}"
  }
} as const)
export const EXAMPLE_TENANT_ENABLE_REQUEST_TYPE=freeze("Organization-enable-request-v1.0")
export const EXAMPLE_TENANT_PURGE_REQUEST_TYPE=freeze("Organization-purge-request-v1.0")
export const EXAMPLE_CONSENT_ACCESS_RULES=freeze({
  "physicianByEmailContinuousCare": {
    "@context": "org.hl7.fhir.api",
    [FhirClaims.ClaimConsent.identifier]: "urn:uuid:consent-physician-email-treatment",
    [FhirClaims.ClaimConsent.subject]: shared.EXAMPLE_SUBJECT_DID,
    [FhirClaims.ClaimConsent.actorIdentifier]: shared.EXAMPLE_EMAIL_PROFESSIONAL,
    [FhirClaims.ClaimConsent.actorRole]: shared.EXAMPLE_HEALTHCARE_ACTOR_ROLE_PHYSICIAN,
    [FhirClaims.ClaimConsent.decision]: "permit",
    [FhirClaims.ClaimConsent.purpose]: "TREAT",
    [FhirClaims.ClaimConsent.action]: shared.EXAMPLE_CLINICAL_SECTION_ALLERGIES,
    [FhirClaims.ClaimConsent.resourceType]: "Composition,AllergyIntolerance",
    [FhirClaims.ClaimConsent.date]: shared.EXAMPLE_CONSENT_DATE
  },
  "physicianByEmailEmergency": {
    "@context": "org.hl7.fhir.api",
    [FhirClaims.ClaimConsent.identifier]: "urn:uuid:consent-physician-email-emergency",
    [FhirClaims.ClaimConsent.subject]: shared.EXAMPLE_SUBJECT_DID,
    [FhirClaims.ClaimConsent.actorIdentifier]: shared.EXAMPLE_EMAIL_PROFESSIONAL,
    [FhirClaims.ClaimConsent.actorRole]: shared.EXAMPLE_HEALTHCARE_ACTOR_ROLE_PHYSICIAN,
    [FhirClaims.ClaimConsent.decision]: "permit",
    [FhirClaims.ClaimConsent.purpose]: "ETREAT",
    [FhirClaims.ClaimConsent.action]: "LOINC|60591-5",
    [FhirClaims.ClaimConsent.resourceType]: "Composition,DocumentReference",
    [FhirClaims.ClaimConsent.date]: shared.EXAMPLE_CONSENT_DATE
  },
  "physicianByOrganizationContinuousCare": {
    "@context": "org.hl7.fhir.api",
    [FhirClaims.ClaimConsent.identifier]: "urn:uuid:consent-physician-org-treatment",
    [FhirClaims.ClaimConsent.subject]: shared.EXAMPLE_SUBJECT_DID,
    [FhirClaims.ClaimConsent.actorIdentifier]: shared.EXAMPLE_PROVIDER_ORGANIZATION_DID,
    [FhirClaims.ClaimConsent.actorRole]: shared.EXAMPLE_HEALTHCARE_ACTOR_ROLE_PHYSICIAN,
    [FhirClaims.ClaimConsent.decision]: "permit",
    [FhirClaims.ClaimConsent.purpose]: "TREAT",
    [FhirClaims.ClaimConsent.action]: "LOINC|30954-2",
    [FhirClaims.ClaimConsent.resourceType]: "Composition,DiagnosticReport",
    [FhirClaims.ClaimConsent.date]: shared.EXAMPLE_CONSENT_DATE
  },
  "physicianByJurisdictionEmergency": {
    "@context": "org.hl7.fhir.api",
    [FhirClaims.ClaimConsent.identifier]: "urn:uuid:consent-physician-jurisdiction-emergency",
    [FhirClaims.ClaimConsent.subject]: shared.EXAMPLE_SUBJECT_DID,
    [FhirClaims.ClaimConsent.actorIdentifier]: shared.EXAMPLE_HEALTHCARE_JURISDICTION,
    [FhirClaims.ClaimConsent.actorRole]: shared.EXAMPLE_HEALTHCARE_ACTOR_ROLE_PHYSICIAN,
    [FhirClaims.ClaimConsent.decision]: "permit",
    [FhirClaims.ClaimConsent.purpose]: "ETREAT",
    [FhirClaims.ClaimConsent.action]: "LOINC|60591-5",
    [FhirClaims.ClaimConsent.resourceType]: "Composition,DocumentReference",
    [FhirClaims.ClaimConsent.date]: shared.EXAMPLE_CONSENT_DATE
  },
  "nurseByOrganization": {
    "@context": "org.hl7.fhir.api",
    [FhirClaims.ClaimConsent.identifier]: "urn:uuid:consent-nurse-org-treatment",
    [FhirClaims.ClaimConsent.subject]: shared.EXAMPLE_SUBJECT_DID,
    [FhirClaims.ClaimConsent.actorIdentifier]: shared.EXAMPLE_PROVIDER_ORGANIZATION_DID,
    [FhirClaims.ClaimConsent.actorRole]: "ISCO-08|2221",
    [FhirClaims.ClaimConsent.decision]: "permit",
    [FhirClaims.ClaimConsent.purpose]: "TREAT",
    [FhirClaims.ClaimConsent.action]: shared.EXAMPLE_CLINICAL_SECTION_HISTORY_MEDICATION,
    [FhirClaims.ClaimConsent.resourceType]: "Composition,MedicationStatement",
    [FhirClaims.ClaimConsent.date]: shared.EXAMPLE_CONSENT_DATE
  },
  "paramedicByJurisdiction": {
    "@context": "org.hl7.fhir.api",
    [FhirClaims.ClaimConsent.identifier]: "urn:uuid:consent-paramedic-jurisdiction-emergency",
    [FhirClaims.ClaimConsent.subject]: shared.EXAMPLE_SUBJECT_DID,
    [FhirClaims.ClaimConsent.actorIdentifier]: shared.EXAMPLE_HEALTHCARE_JURISDICTION,
    [FhirClaims.ClaimConsent.actorRole]: "ISCO-08|2240",
    [FhirClaims.ClaimConsent.decision]: "permit",
    [FhirClaims.ClaimConsent.purpose]: "ETREAT",
    [FhirClaims.ClaimConsent.action]: "LOINC|60591-5",
    [FhirClaims.ClaimConsent.resourceType]: "Composition,Observation",
    [FhirClaims.ClaimConsent.date]: shared.EXAMPLE_CONSENT_DATE
  },
  "directPhysicianDenyInsideAllowedOrganization": {
    "@context": "org.hl7.fhir.api",
    [FhirClaims.ClaimConsent.identifier]: "urn:uuid:consent-physician-direct-deny",
    [FhirClaims.ClaimConsent.subject]: shared.EXAMPLE_SUBJECT_DID,
    [FhirClaims.ClaimConsent.actorIdentifier]: shared.EXAMPLE_EMAIL_PROFESSIONAL,
    [FhirClaims.ClaimConsent.actorRole]: shared.EXAMPLE_HEALTHCARE_ACTOR_ROLE_PHYSICIAN,
    [FhirClaims.ClaimConsent.decision]: "deny",
    [FhirClaims.ClaimConsent.purpose]: "TREAT",
    [FhirClaims.ClaimConsent.action]: "LOINC|30954-2",
    [FhirClaims.ClaimConsent.resourceType]: "DiagnosticReport",
    [FhirClaims.ClaimConsent.date]: shared.EXAMPLE_CONSENT_DATE
  },
  "relatedPersonByEmail": {
    "@context": "org.hl7.fhir.api",
    [FhirClaims.ClaimConsent.identifier]: "urn:uuid:consent-related-person-email",
    [FhirClaims.ClaimConsent.subject]: shared.EXAMPLE_SUBJECT_DID,
    [FhirClaims.ClaimConsent.actorIdentifier]: "parent.guardian@example.invalid",
    [FhirClaims.ClaimConsent.actorRole]: shared.EXAMPLE_RELATED_PERSON_ROLE,
    [FhirClaims.ClaimConsent.decision]: "permit",
    [FhirClaims.ClaimConsent.purpose]: "TREAT",
    [FhirClaims.ClaimConsent.action]: "LOINC|60591-5",
    [FhirClaims.ClaimConsent.resourceType]: "Composition,DocumentReference",
    [FhirClaims.ClaimConsent.date]: shared.EXAMPLE_CONSENT_DATE
  },
  "relatedPersonClinicalSections": {
    "@context": "org.hl7.fhir.api",
    [FhirClaims.ClaimConsent.identifier]: "urn:uuid:consent-related-person-clinical-sections",
    [FhirClaims.ClaimConsent.subject]: shared.EXAMPLE_SUBJECT_DID,
    [FhirClaims.ClaimConsent.actorIdentifier]: "parent.guardian@example.invalid",
    [FhirClaims.ClaimConsent.actorRole]: shared.EXAMPLE_RELATED_PERSON_ROLE,
    [FhirClaims.ClaimConsent.decision]: "permit",
    [FhirClaims.ClaimConsent.purpose]: "TREAT",
    [FhirClaims.ClaimConsent.action]: "LOINC|48765-2,LOINC|10160-0",
    [FhirClaims.ClaimConsent.resourceType]: "Composition,AllergyIntolerance,MedicationStatement",
    [FhirClaims.ClaimConsent.date]: shared.EXAMPLE_CONSENT_DATE
  },
  "revokedPhysicianEmailConsent": {
    "@context": "org.hl7.fhir.api",
    [FhirClaims.ClaimConsent.identifier]: "urn:uuid:consent-physician-email-revoked",
    [FhirClaims.ClaimConsent.subject]: shared.EXAMPLE_SUBJECT_DID,
    [FhirClaims.ClaimConsent.actorIdentifier]: shared.EXAMPLE_EMAIL_PROFESSIONAL,
    [FhirClaims.ClaimConsent.actorRole]: shared.EXAMPLE_HEALTHCARE_ACTOR_ROLE_PHYSICIAN,
    [FhirClaims.ClaimConsent.decision]: "permit",
    [FhirClaims.ClaimConsent.purpose]: "ETREAT",
    [FhirClaims.ClaimConsent.action]: "LOINC|60591-5",
    [FhirClaims.ClaimConsent.periodEnd]: "2026-05-01T00:00:00Z",
    [FhirClaims.ClaimConsent.date]: shared.EXAMPLE_CONSENT_DATE
  }
} as const)
export const EXAMPLE_ORG_ACTIVATION_ORGANIZATION_CREDENTIAL=freeze({
  "@context": ["https://www.w3.org/ns/credentials/v2","https://schema.org"],
  "type": ["VerifiableCredential","OrganizationCredential"],
  "credentialSubject": {
    "id": "ESB00112233",
    "taxID": "ESB00112233",
    "makesOffer": {
      "category": shared.EXAMPLE_SECTOR,
      "serviceType": "organization/Composition.cruds"
    }
  }
} as const)
export const EXAMPLE_ORG_ACTIVATION_LEGAL_REPRESENTATIVE_CREDENTIAL=freeze({
  "@context": ["https://www.w3.org/ns/credentials/v2","https://schema.org"],
  "type": ["VerifiableCredential","LegalRepresentativeCredential"],
  "credentialSubject": {
    "id": "urn:person:identifier:IDCES-99999999R",
    "memberOf": {
      "taxID": "ESB00112233"
    },
    "hasOccupation": {
      "@type": "Occupation",
      "occupationalCategory": "ISCO-08|1120"
    },
    "identifier": "IDCES-99999999R",
    "sameAs": "urn:multibase:zControllerHash"
  }
} as const)

export function buildExampleEmployeeClaims(record:Readonly<{identifier:string;email:string;role:string}>):Readonly<Record<string,string>>{return Object.freeze({'@context':'org.schema',[SchemaOrgPersonClaim.Identifier]:record.identifier,[SchemaOrgPersonClaim.Email]:record.email,[SchemaOrgPersonClaim.OccupationIdentifierValue]:record.role})}

export {buildVitalSignObservationEntry} from 'fhir-data-utils-ts'
export function cloneExample<T>(value:T):T{return JSON.parse(JSON.stringify(value)) as T}

/** Existing lifecycle wire identifiers for synthetic requests; the runtime still authorizes every transition. */
export const LifecycleRequestType=Object.freeze({
  IndividualOrganizationDisable:'Family-disable-request-v1.0',
  IndividualOrganizationPurge:'Family-purge-request-v1.0',
  RelatedPersonDisable:'RelatedPerson-disable-request-v1.0',
  RelatedPersonPurge:'RelatedPerson-purge-request-v1.0',
  TenantEnable:'Organization-enable-request-v1.0',
  TenantDisable:'Organization-disable-request-v1.0',
  TenantPurge:'Organization-purge-request-v1.0',
} as const)
export const EXAMPLE_LICENSE_INVALID_OFFER_ID='urn:offer:invalid-001' as const

/** Fresh opaque envelope shape for persistence tests; no encryption or signature claim is made. */
export function buildExampleConfidentialJwe():Record<string,any>{
  return {protected:'eyJlbmMiOiJDMjBQIn0',recipients:[{encrypted_key:'4PQsjDGs8IE3YqgcoGfwPTuVG25MKjojx4HSZqcjfkhr0qhwqkpUUw',header:{kid:'urn:rfc7638:sha-256:Base64Url(SHA256(JWK))',alg:'ML-KEM'}}],iv:'FoJ5uPIR6HDPFCtD',ciphertext:'tIupQ-9MeYLdkAc1Us0Mdlp1kZ5Dbavq0No-eJ91cF0R0hE',tag:'TMRcEPc74knOIbXhLDJA_w'}
}
/** Synthetic index labels are opaque persistence fixtures, not contact identities or calculated HMAC evidence. */
export function buildExampleConfidentialStorageDoc(overrides:Partial<ConfidentialStorageDoc>={}):ConfidentialStorageDoc{
  return {id:'doc-1',status:'active',sequence:0,indexed:{attributes:[{name:'hmac_for_email',value:'hmac_for_test@example.com',unique:true},{name:'hmac_for_role',value:'hmac_for_admin'}]},jwe:buildExampleConfidentialJwe(),...overrides}
}
/** Deterministic projection data, never a participant's authentication or permission. */
export function buildExampleCommunicationParticipantProjection(overrides:Partial<CommunicationParticipantProjection & {id?:string;thid?:string}>={}):CommunicationParticipantProjection & {id:string;thid:string}{
 return {id:'communication-participant-record-001',thid:'thread-communication-example-001',subject:shared.EXAMPLE_SUBJECT_DID,sender:shared.EXAMPLE_TENANT_SERVICE_DID,sent:'2026-06-15T10:00:00Z',category:CommunicationCategoryCodes.Notification.attributeValue,topic:'care-plan-follow-up',recipients:[shared.EXAMPLE_RELATED_PERSON_MEMBER_DID,`email:${safe.firstContactEmail}`,`tel:${safe.phoneE164}`],...overrides}
}
export function buildExampleCommunicationParticipantSearchInput(overrides:Partial<CommunicationParticipantSearchInput>={}):CommunicationParticipantSearchInput{
 return {subject:shared.EXAMPLE_SUBJECT_DID,userActorId:[shared.EXAMPLE_RELATED_PERSON_MEMBER_DID,`email:${safe.individualEmail}`],targetActorId:[`email:${safe.firstContactEmail}`,`tel:${safe.phoneE164}`],searchParams:{[FhirClaims.CommunicationClaim.Category]:CommunicationCategoryCodes.Notification.attributeValue,[FhirClaims.CommunicationClaim.Topic]:'care-plan-follow-up'},...overrides}
}

export type VoiceReminderDemoContext=Readonly<{tenantId:string;jurisdiction:string;sector:string;hostRegistryNetwork:string;subjectId:string;subjectAlias:string;subjectEmail:string;subjectIdentifierType:string;subjectIdentifierValue:string;ownerId:string;controllerEmail?:string}>
/** Cloneable synthetic routing context only. Task execution requires a separately authorized explicit policy. */
export function buildVoiceReminderDemoContext(overrides:Partial<VoiceReminderDemoContext>={}):VoiceReminderDemoContext{
 return {tenantId:shared.EXAMPLE_TENANT_IDENTIFIER,jurisdiction:shared.EXAMPLE_JURISDICTION,sector:shared.EXAMPLE_SECTOR,hostRegistryNetwork:'test',subjectId:shared.EXAMPLE_SUBJECT_DID,subjectAlias:shared.EXAMPLE_REGISTERED_SUBJECT_ALTERNATE_NAME,subjectEmail:safe.individualEmail,subjectIdentifierType:shared.EXAMPLE_CONTROLLER_IDENTIFIER_TYPE,subjectIdentifierValue:shared.EXAMPLE_FORM_SUBJECT_IDENTIFIER_VALUE,ownerId:shared.EXAMPLE_CONTROLLER_DID,controllerEmail:shared.EXAMPLE_EMAIL_CONTROLLER_INDIVIDUAL,...overrides}
}

/** Remaining neutral purchase/search example descriptors share the same governed seat identities. */
export const EXAMPLE_LICENSE_OFFER_ID='urn:offer:family-003' as const
export const EXAMPLE_LICENSE_PAYMENT_METHOD_INVOICE='invoice' as const
export const EXAMPLE_LICENSE_SUBJECT_ID_AVAILABLE='urn:uuid:subject-license-available-001' as const
export const EXAMPLE_JOB_IDENTIFIER_LICENSE_SEARCH='job-license-search-001' as const
export const EXAMPLE_THREAD_IDENTIFIER_LICENSE_SEARCH='thid-license-search-001' as const
export const EXAMPLE_SERVICE_PUBLIC_DID=`${safe.didWeb}:public` as const
export const EXAMPLE_BUNDLE_RESOURCE_TYPE=ResourceTypesFhirR4.Bundle
export const EXAMPLE_BUNDLE_TYPE_BATCH=BundleTypes.batch
export const EXAMPLE_CONTENT_TYPE_APPLICATION_JSON=HttpMediaTypes.Json
export const EXAMPLE_HEALTHCARE_ACTOR_ROLE_GENERALIST_MEDICAL_PRACTITIONER=HealthcareActorRoles.GeneralistMedicalPractitioner
const examplePurchaseSerials=[shared.EXAMPLE_LICENSE_SEAT_UUID_ACTIVE,shared.EXAMPLE_LICENSE_SEAT_UUID_SECONDARY] as const
export const EXAMPLE_LICENSE_PURCHASE_INPUT=freeze({quantity:examplePurchaseSerials.length,userClass:DeviceUserClasses.Employee,type:DeviceAppTypes.Web,serialNumbers:examplePurchaseSerials} as const)
export const EXAMPLE_LICENSE_AVAILABLE_RECORD=freeze({id:shared.EXAMPLE_LICENSE_SEAT_UUID_AVAILABLE,status:LicenseStatuses.Available,subjectId:EXAMPLE_LICENSE_SUBJECT_ID_AVAILABLE,claims:{...EXAMPLE_LICENSE_ACTIVE_RECORD.claims,[SchemaClaims.SchemaOrgIndividualProductClaim.SerialNumber]:shared.EXAMPLE_LICENSE_SEAT_UUID_AVAILABLE}} as const)
export const EXAMPLE_LICENSE_RUNTIME_DEFAULTS=freeze({plan:EXAMPLE_DEVICE_LICENSE_AVAILABLE.plan,renewalCycle:EXAMPLE_DEVICE_LICENSE_AVAILABLE.renewalCycle,reactivationEnabled:true} as const)

const exampleEmployeeController=freeze({...EXAMPLE_EMPLOYEE_DOCTOR_ACTIVE,resourceId:'urn:uuid:11111111-1111-4111-8111-111111111111',role:ExampleEmployeeRoles.Controller,identifier:buildProfessionalDidWeb({organizationDidWeb:shared.EXAMPLE_API_ORGANIZATION_DID,email:ExampleEmployeeEmails.SharedProfessional,role:ExampleEmployeeRoles.Controller})} as const)
const exampleEmployeeHistorical=freeze({...EXAMPLE_EMPLOYEE_DOCTOR_ACTIVE,resourceId:'urn:uuid:33333333-3333-4333-8333-333333333333',identifier:`${EXAMPLE_EMPLOYEE_DOCTOR_ACTIVE.identifier}:historical:000`,status:'purged'} as const)
const exampleEmployeeDirectory=freeze([exampleEmployeeController,EXAMPLE_EMPLOYEE_DOCTOR_ACTIVE,exampleEmployeeHistorical])
export const EXAMPLE_EMPLOYEE_SEARCH_RESPONSE_BODY=freeze({resourceType:'Bundle',type:'batch-response',total:exampleEmployeeDirectory.length,data:exampleEmployeeDirectory.map(record=>({type:OrganizationEmployeeSearchResponseEntryTypes.Employee,resource:{id:record.resourceId,status:record.status,claims:buildExampleEmployeeClaims(record),meta:{status:record.status,claims:buildExampleEmployeeClaims(record)}},response:{status:shared.ExampleHttpStatusText.Ok}}))})

export const EXAMPLE_FAMILY_REGISTRATION_OWNER_TELEPHONE=safe.firstContactPhoneE164
/** Canonical synthetic registration data; the caller still authenticates and authorizes the write. */
export function buildExampleFamilyRegistrationClaims(overrides:Record<string,unknown>={}):Record<string,unknown>{
 const O=SchemaClaims.SchemaOrgOrganizationClaim,P=SchemaClaims.SchemaOrgPersonClaim,S=SchemaClaims.SchemaOrgServiceClaim
 return {[S.Category]:shared.EXAMPLE_SECTOR,[O.AddressCountry]:shared.EXAMPLE_JURISDICTION,[O.IdentifierReference]:shared.EXAMPLE_SUBJECT_DID,[O.IdentifierType]:SecureIdTypesIndividual.Uuid,[O.IdentifierValue]:shared.EXAMPLE_INDIVIDUAL_MULTIBASE_ID,[O.OwnerEmail]:safe.individualEmail,[O.OwnerTelephone]:EXAMPLE_FAMILY_REGISTRATION_OWNER_TELEPHONE,[O.OwnerIdentifierValue]:'IDCES-TEST-CONTROLLER',[O.AlternateName]:shared.EXAMPLE_REGISTERED_SUBJECT_ALTERNATE_NAME,[P.Email]:safe.individualEmail,[P.Identifier]:shared.EXAMPLE_SUBJECT_DID,[P.IdentifierType]:SecureIdTypesIndividual.Uuid,[P.IdentifierValue]:shared.EXAMPLE_INDIVIDUAL_MULTIBASE_ID,[P.Telephone]:EXAMPLE_FAMILY_REGISTRATION_OWNER_TELEPHONE,[P.AlternateName]:shared.EXAMPLE_REGISTERED_SUBJECT_ALTERNATE_NAME,[S.IdentifierReference]:shared.EXAMPLE_TENANT_SERVICE_DID,[S.ServiceType]:'health-provider',[S.TermsOfService]:`${safe.httpsBaseUrl}/terms`,...overrides}
}
export function buildExampleFamilyRegistrationContent(input:Readonly<{status:string;claims?:Record<string,unknown>;contained?:Array<Record<string,unknown>>}>){return {status:input.status,claims:buildExampleFamilyRegistrationClaims(input.claims),contained:input.contained??[]}}
