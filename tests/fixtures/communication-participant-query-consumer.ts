import {parseCommunicationParticipantSearchCriteria,buildCommunicationParticipantIndexAttributes,CommunicationParticipantPrefixes,CommunicationParticipantIndexNames,matchesCommunicationParticipantSearch,paginateCommunicationParticipantMatches,type CommunicationParticipantSearchCriteria} from 'sos-data-utils-ts'
import {parseCommunicationParticipantSearchCriteria as leaf} from 'sos-data-utils-ts/communication-participant-query'
import {REPOSITORY_SAFE_EXAMPLES as E} from 'sos-data-utils-ts/repository-privacy'
const criteria:CommunicationParticipantSearchCriteria=parseCommunicationParticipantSearchCriteria({actor:E.didWeb})
criteria.subjectActorIds=[E.didWeb];criteria.anySubject=false
criteria.claimSearchParams={...criteria.claimSearchParams};criteria.page=1
leaf({resourceType:'Parameters',parameter:[{name:'actor',valueString:E.didWeb}]})
const projection={subject:E.didWeb,sender:E.individualEmail,recipients:[E.phoneE164]}
buildCommunicationParticipantIndexAttributes(projection);matchesCommunicationParticipantSearch(projection,criteria)
const page:number[]=paginateCommunicationParticipantMatches([1,2],criteria)
const prefix:'tel:'=CommunicationParticipantPrefixes.Tel
const index:'Communication.subject'=CommunicationParticipantIndexNames.Subject
// @ts-expect-error Every compiled criterion has its six explicit any flags and token lists.
const incomplete:CommunicationParticipantSearchCriteria={page:1}
// @ts-expect-error The pure paginator preserves the record element type.
const invalid:string[]=paginateCommunicationParticipantMatches([1,2],criteria)
void [page,prefix,index,incomplete,invalid]
