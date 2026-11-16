/** Complete operational directory states; a stored state alone grants no authority. */
export const EmployeeDirectoryStatuses=Object.freeze({Active:'active',Inactive:'inactive',Purged:'purged',Unknown:'unknown'} as const)
export type EmployeeDirectoryStatus=typeof EmployeeDirectoryStatuses[keyof typeof EmployeeDirectoryStatuses]

/** Routing metadata only; a V1 grant is not contact possession, employment, a licence or a device grant. */
export const EmployeeActivationGrantVersions=Object.freeze({V1:'employee-activation-grant-v1'} as const)
export type EmployeeActivationGrant=Readonly<{
  version:typeof EmployeeActivationGrantVersions.V1
  employeeDid:string;employeeRoleCode:string;employeeActorIdentifier:string;providerDid:string
  routeContext:Readonly<{tenantId:string;jurisdiction:string;sector:string}>
  createdAt:string;expiresAt:string
}>
export type OrganizationEmployeeDeviceRecord=Readonly<{
  clientId:string;name:string;status:'active'|'revoked';ownerContact?:string
  ownerContactKind?:'email'|'phone';activatedAt?:number
}>
export type OrganizationEmployeeLicenseRecord=Readonly<{
  id:string;status:string;maxDevices:number;activeDevices:number
  devices:readonly OrganizationEmployeeDeviceRecord[]
}>
/** Inventory counts projected from authoritative seat records; no local capacity grant. */
export type LicenseListSummary=Readonly<{
  contracted:number;free:number;used:number;available:number;issued:number;active:number;inactive:number
}>
/** A returned contact label is not proof of possession or authority. */
export type OrganizationEmployeeLifecycleRecord=Readonly<{
  resourceId:string;roleCode:string;employeeDid:string
  /** Actual correlated Occupation record ID; no inferred or pre-existing FHIR PractitionerRole is asserted. */
  occupationResourceId?:string
  status:EmployeeDirectoryStatus;license?:OrganizationEmployeeLicenseRecord
}>&(Readonly<{email:string;contactKind?:'email';telephone?:never}>|Readonly<{contactKind:'phone';telephone:string;email?:never}>)
