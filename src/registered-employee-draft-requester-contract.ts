import type {EmployeeActivationGrant} from './employee-routing.js'
import type {RegisteredProfileBinding} from './registered-profile-contract.js'

/** Existing tuple written atomically with the profile after verified employee DCR. */
export type EmployeeEnrollmentConsumption=Readonly<{
 ownerId:string
 profileId:string
 clientInstanceId:string
}>

/**
 * Existing grant record with completed enrollment evidence. Invitation dates
 * describe admission to enrollment, not the lifetime of an already completed
 * enrollment or current employment/Consent. Runtime custody must verify the
 * exact profile, installation, contact and consumed tuple before projection.
 */
export type ConsumedEmployeeEnrollmentGrant=EmployeeActivationGrant&Readonly<{
 id:string
 consumedEnrollments?:readonly EmployeeEnrollmentConsumption[]
 tenantIssuer?:string
 accessPath?:string
}>

/** Recorded DCR identity and role for a draft proposal; no active entitlement. */
export type RegisteredEmployeeDraftRequester=RegisteredProfileBinding&Readonly<{
 clientId:string
 clientInstanceId:string
 recordedRole:string
}>
