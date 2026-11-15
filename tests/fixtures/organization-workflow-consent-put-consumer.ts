// Flow contract: typed entries match actual workflow manager operations without allowing Consent PATCH or arbitrary Group PUT.
import type {OrganizationWorkflowGroupEntry,OrganizationWorkflowConsentEntry,OrganizationWorkflowFlatEntry,TestNetworkControllerWorkflowAssignment} from 'sos-data-utils-ts/organization-workflow-access'
export function revoke(plan:TestNetworkControllerWorkflowAssignment){
 const consent:OrganizationWorkflowConsentEntry={...plan.authorization,request:{method:'PUT',url:`Consent/${plan.authorization.resource.id}`}}
 const group:OrganizationWorkflowGroupEntry=plan.group
 const entries:readonly OrganizationWorkflowFlatEntry[]=[consent,group]
 // @ts-expect-error Actual Group workflow uses POST/PATCH, not PUT.
 const wrongGroup:OrganizationWorkflowGroupEntry={...group,request:{method:'PUT',url:`Group/${group.resource.id}`}}
 // @ts-expect-error Actual Consent manager rejects PATCH, even with a full resource.
 const wrongConsent:OrganizationWorkflowConsentEntry={...consent,request:{method:'PATCH',url:`Consent/${consent.resource.id}`}}
 return {entries,wrongGroup,wrongConsent}
}
