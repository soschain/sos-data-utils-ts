// Flow contract: phone contacts are explicitly typed telephone fields, never placed in email properties.
import type {LegalOrganizationVerificationTransactionInput} from 'sos-data-utils-ts/gateway-transport-contract';
import {REPOSITORY_SAFE_EXAMPLES as SAFE} from 'sos-data-utils-ts/repository-privacy';
import {SchemaOrgServiceClaim} from 'antifraud-data-utils-ts/schema-org-claims';
const input:LegalOrganizationVerificationTransactionInput={claims:{[SchemaOrgServiceClaim.Category]:'health-care'},controller:{telephone:SAFE.phoneE164},legalRepresentativePayload:{telephone:SAFE.firstContactPhoneE164}};
void input;
