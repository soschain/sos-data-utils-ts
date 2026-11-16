import {EmployeeLifecycleActions,EmployeeLifecycleQueryActions,type EmployeeLifecycleAction} from 'sos-data-utils-ts/employee-routing'
import {EmployeeLifecycleActions as RootActions,type EmployeeLifecycleAction as RootAction} from 'sos-data-utils-ts'
const actions:readonly EmployeeLifecycleAction[]=Object.values(EmployeeLifecycleActions)
const rootActions:readonly RootAction[]=Object.values(RootActions)
const query:'list'=EmployeeLifecycleQueryActions.List
const same:typeof EmployeeLifecycleActions=RootActions
// @ts-expect-error Queries are not mutating lifecycle actions.
const queryMutation:EmployeeLifecycleAction=EmployeeLifecycleQueryActions.List
// @ts-expect-error Reactivation remains an explicit host operation, not an added legacy mutation code.
const unknown:RootAction='reactivate'
void [actions,rootActions,query,same,queryMutation,unknown]
