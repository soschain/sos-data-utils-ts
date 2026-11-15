// Flow contract: typed entries retain routed Consent POST/status-PATCH and full PUT while excluding arbitrary Group PUT or read operations.
import type {OrganizationWorkflowGroupEntry,OrganizationWorkflowConsentEntry,OrganizationWorkflowFlatEntry,TestNetworkControllerWorkflowAssignment} from 'sos-data-utils-ts/organization-workflow-access'
import {ClaimConsent,ConsentStatuses} from 'fhir-data-utils-ts'
export function revoke(plan:TestNetworkControllerWorkflowAssignment){
 const consent:OrganizationWorkflowConsentEntry={...plan.authorization,request:{method:'PUT',url:`Consent/${plan.authorization.resource.id}`}}
 const group:OrganizationWorkflowGroupEntry=plan.group
 const entries:readonly OrganizationWorkflowFlatEntry[]=[consent,group]
 // @ts-expect-error Actual Group workflow uses POST/PATCH, not PUT.
 const wrongGroup:OrganizationWorkflowGroupEntry={...group,request:{method:'PUT',url:`Group/${group.resource.id}`}}
 const historicalPatch:OrganizationWorkflowConsentEntry={...consent,resource:{...consent.resource,meta:{claims:{[ClaimConsent.status]:ConsentStatuses.Inactive}}},request:{method:'PATCH',url:`Consent/${consent.resource.id}`}}
 // @ts-expect-error Read operations are not workflow mutations.
 const wrongConsent:OrganizationWorkflowConsentEntry={...consent,request:{method:'GET',url:`Consent/${consent.resource.id}`}}
 return {entries,wrongGroup,wrongConsent,historicalPatch}
}
