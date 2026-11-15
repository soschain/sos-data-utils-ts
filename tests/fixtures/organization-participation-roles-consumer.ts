import {OrganizationParticipationRoles as roles,type OrganizationParticipationRole} from 'sos-data-utils-ts/organization-participation-roles'
const all:readonly OrganizationParticipationRole[]=Object.values(roles)
const exact:'individual-personal-backup-service-provider'=roles.IndividualPersonalBackupServiceProvider
// @ts-expect-error runtime capabilities are not organization participation-role identifiers
const invalid:OrganizationParticipationRole='document-backup-provider'
// @ts-expect-error catalog members are readonly
roles.IndividualIndexServiceProvider='other'
void [all,exact,invalid]
