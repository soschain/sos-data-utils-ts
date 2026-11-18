import {REPOSITORY_SAFE_EXAMPLES as e} from './repository-privacy.js'
import {buildStableActorIdentifier} from 'antifraud-data-utils-ts/organization-identity'
import {buildOrganizationRoleLicenseId,DEFAULT_ORGANIZATION_ROLE_LICENSE_POLICY,type OrganizationRoleLicense,type OrganizationRoleLicenseIdentity} from './organization-role-license.js'
import {DataspaceSectors} from './dataspace-sectors.js'
import {HealthcareActorRoles} from './healthcare-roles.js'
/** Governed local example only, never an active ledger assignment. */
export const EXAMPLE_ORGANIZATION_ROLE_LICENSE_IDENTITY:OrganizationRoleLicenseIdentity=Object.freeze({jurisdiction:e.countryIso2,organizationOfficialId:e.organizationBusinessNumber,stableContactIdentifier:buildStableActorIdentifier({contactKind:'email',contact:e.firstContactEmail}),licensedRole:HealthcareActorRoles.Controller})
export const EXAMPLE_ORGANIZATION_ROLE_LICENSE_POLICIES=Object.freeze([DEFAULT_ORGANIZATION_ROLE_LICENSE_POLICY,Object.freeze({sector:DataspaceSectors.AnimalCare,active:false,maxDevices:2})])
export const EXAMPLE_ORGANIZATION_ROLE_LICENSE:OrganizationRoleLicense=Object.freeze({id:buildOrganizationRoleLicenseId(EXAMPLE_ORGANIZATION_ROLE_LICENSE_IDENTITY),...EXAMPLE_ORGANIZATION_ROLE_LICENSE_IDENTITY,status:'active',data:[...EXAMPLE_ORGANIZATION_ROLE_LICENSE_POLICIES],createdAt:1700000000,updatedAt:1700000000})
