import type {OrganizationLifecycleSnapshot,OrganizationPurgeReceipt} from 'sos-data-utils-ts/organization-lifecycle-contract'
import {REPOSITORY_SAFE_EXAMPLES as SAFE} from 'sos-data-utils-ts/repository-privacy'
const snapshot:OrganizationLifecycleSnapshot={status:'active',descendants:{activeEmployees:1,activeIndividuals:0,unpurgedEmployees:1,unpurgedIndividuals:0},canDisable:false,canPurge:false}
const purge:OrganizationPurgeReceipt={status:'revoked',disposition:'purged',organizationIdentifier:SAFE.tenantId,providerDid:SAFE.didWeb,changedBy:`${SAFE.didWeb}:controller`,operationReference:SAFE.resourceUuid}
// @ts-expect-error Unknown lifecycle state cannot become an active snapshot.
const bad:OrganizationLifecycleSnapshot={...snapshot,status:'unknown'}
// @ts-expect-error A purge receipt is not a fresh descendant counter snapshot.
const counters:OrganizationLifecycleSnapshot=purge
void [snapshot,purge,bad,counters]
