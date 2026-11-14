// Flow contract: registration keeps subject-kind constraints and pending controller authority explicit in public consumer types.
import type {SubjectRegistrationCommand,ProvisionalSubjectRegistrationReceipt} from 'sos-data-utils-ts/provisional-subject-registration'
import {REPOSITORY_SAFE_EXAMPLES as safe} from 'sos-data-utils-ts/repository-privacy'
declare const command:SubjectRegistrationCommand
if(command.subject.kind==='animal'){
 const taxonomy:string=command.subject.ncbiTaxonomyId
 void taxonomy
}
const human:SubjectRegistrationCommand={operationId:safe.resourceUuid,subject:{kind:'human',alternateName:'Dependent subject'},controller:{legalName:'Proposed controller',contact:{kind:'email',value:safe.individualEmail},relationship:'RESPRSN'}}
// @ts-expect-error Animal creation requires taxonomy.
const missingTaxonomy:SubjectRegistrationCommand={...human,subject:{kind:'animal',alternateName:'Subject'}}
// @ts-expect-error Human creation does not accept taxonomy.
const animalFieldOnHuman:SubjectRegistrationCommand={...human,subject:{kind:'human',alternateName:'Subject',ncbiTaxonomyId:'9615'}}
declare const receipt:ProvisionalSubjectRegistrationReceipt
const pending:'pending'=receipt.controllerInvitation.status
const provisional:'provisional'=receipt.status
void [missingTaxonomy,animalFieldOnHuman,pending,provisional]
