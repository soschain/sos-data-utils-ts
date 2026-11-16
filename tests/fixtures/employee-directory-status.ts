import {EmployeeDirectoryStatuses as rootStatuses} from 'sos-data-utils-ts'
import {EmployeeDirectoryStatuses,type OrganizationEmployeeLifecycleRecord} from 'sos-data-utils-ts/employee-routing'
const statuses:OrganizationEmployeeLifecycleRecord['status'][]=Object.values(EmployeeDirectoryStatuses)
const complete:readonly ['active','inactive','purged','unknown']=[EmployeeDirectoryStatuses.Active,EmployeeDirectoryStatuses.Inactive,EmployeeDirectoryStatuses.Purged,EmployeeDirectoryStatuses.Unknown]
const same:typeof EmployeeDirectoryStatuses=rootStatuses
// @ts-expect-error Directory state spelling is a closed wire contract.
const unsupported:OrganizationEmployeeLifecycleRecord['status']='disabled'
void [statuses,complete,same,unsupported]
