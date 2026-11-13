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
export type OrganizationEmployeeLifecycleRecord=Readonly<{
  resourceId:string;email:string;roleCode:string;employeeDid:string
  status:'active'|'inactive'|'purged'|'unknown';license?:OrganizationEmployeeLicenseRecord
}>
