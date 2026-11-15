// Flow contract: existing email transaction inputs remain valid without a new mandatory contact discriminator.
import type {LegalOrganizationVerificationTransactionInput} from 'sos-data-utils-ts/gateway-transport-contract';
import {REPOSITORY_SAFE_EXAMPLES as SAFE} from 'sos-data-utils-ts/repository-privacy';
import {SchemaOrgServiceClaim} from 'antifraud-data-utils-ts/schema-org-claims';
const input:LegalOrganizationVerificationTransactionInput={claims:{[SchemaOrgServiceClaim.Category]:'health-care'},controller:{email:SAFE.individualEmail},legalRepresentativePayload:{email:SAFE.firstContactEmail}};
void input;
