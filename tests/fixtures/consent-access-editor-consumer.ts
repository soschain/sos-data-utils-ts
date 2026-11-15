// Flow contract: editor view models separate actor identity, occupation and permission targets; none is authorization evidence.
import type {ConsentEditorClassifiedActors,ConsentEditorClassifiedRole,ConsentEditorClassifiedRoles,ConsentViewModel} from 'sos-data-utils-ts/consent-access-editor-contract'
import {ConsentEditorScopeCodes,ConsentEditorTargetKinds} from 'sos-data-utils-ts/consent-access-editor-contract'
import {HealthcareActorRoles,HealthcareRoleFamilies} from 'sos-data-utils-ts/healthcare-roles'
import {REPOSITORY_SAFE_EXAMPLES as SAFE} from 'sos-data-utils-ts/repository-privacy'
const role:ConsentEditorClassifiedRole={kind:HealthcareRoleFamilies.ProfessionalOccupationIsco08,codingSystem:'ISCO-08',code:HealthcareActorRoles.Dentist.split('|')[1]!}
const actors:ConsentEditorClassifiedActors={jurisdictions:[],organizations:[],users:[{email:SAFE.individualEmail}]}
const roles:ConsentEditorClassifiedRoles={professional:[role],relationship:[],legalRepresentative:[],other:[]}
const view:ConsentViewModel={identifier:SAFE.resourceUuid,subject:SAFE.didWeb,decision:'permit',classifiedActors:actors,classifiedRoles:roles,classifiedPurposes:[],classifiedTargets:[{target:{kind:ConsentEditorTargetKinds.ResourceType,code:'Composition'},scopes:[{code:ConsentEditorScopeCodes.Read}]}]}
// @ts-expect-error Every classified role retains its coding-system identity.
const missingSystem:ConsentEditorClassifiedRole={code:role.code}
// @ts-expect-error A file or browser tab selection is not an editor scope.
const invalidScope:ConsentViewModel={...view,classifiedTargets:[{target:{kind:ConsentEditorTargetKinds.ResourceType,code:'Composition'},scopes:[{code:'activate'}]}]}
void [view,missingSystem,invalidScope]
