/** Existing SOS host-registry lifecycle extension keys; selecting a value does not authorize a transition. */
export const OrganizationLifecycleClaim=Object.freeze({
  TenantAuthorizationStatus:'org.schema.Action.tenantAuthorization.status',
  TenantAuthorizationChangedBy:'org.schema.Action.tenantAuthorization.changedBy',
  TenantAuthorizationLifecycleDisposition:'org.schema.Action.tenantAuthorization.lifecycleDisposition',
} as const)

/** Counters must come from authoritative host-registry readback, never a local fabricated snapshot. */
export type OrganizationLifecycleSnapshot=Readonly<{
  status:'active'|'suspended'|'revoked'
  descendants:Readonly<{activeEmployees:number;activeIndividuals:number;unpurgedEmployees:number;unpurgedIndividuals:number}>
  canDisable:boolean;canPurge:boolean
}>

/** A successful purge removes the registry record; this receipt is distinct from a post-delete status snapshot. */
export type OrganizationPurgeReceipt=Readonly<{
  status:'revoked';disposition:'purged';organizationIdentifier:string;providerDid:string
  changedBy:string;operationReference:string
}>
