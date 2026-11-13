import {IndividualLogicalSections} from './individual-sections.js'
import {EncounterClaim as E,EncounterHistoryClaim as H,EncounterStatusR5 as S} from 'fhir-data-utils-ts/claims'
import {buildEncounterHistoryR5FlatEntry,type FlatClaimResourceEntry} from 'fhir-data-utils-ts'
import {buildFlatClaimResourceEntry} from 'fhir-data-utils-ts/flat-claim-resource-graph'
export {EncounterStatusR5} from 'fhir-data-utils-ts/claims'

export type PortalEncounterRecord=Readonly<{entry:FlatClaimResourceEntry;revision:number;allowedStatuses?:readonly S[];serviceLabel?:string}>
export type PortalEncounterSourceOutcome=S.OnHold|S.Completed
export type PortalEncounterService=Readonly<{reference:string;label:string;organizationReference:string;locationReference?:string;classToken:string}>
/** Browser intent only. The BFF resolves all service, provider and author identities. */
export type PortalEncounterRequest=
  | Readonly<{action:'create';operationId:string;serviceReference:string}>
  | Readonly<{action:'status';operationId:string;encounterReference:string;expectedRevision:number;status:S}>
  | Readonly<{action:'transfer';operationId:string;encounterReference:string;expectedRevision:number;destinationServiceReference:string;sourceOutcome:PortalEncounterSourceOutcome}>
export type PortalEncounterJourneyView=Readonly<{
  subjectIdentifier:string;encounters:readonly PortalEncounterRecord[];history:readonly PortalEncounterRecord[]
  services:readonly PortalEncounterService[];canManage:boolean
}>
export type PortalEncounterMutationResult=Readonly<{journey:PortalEncounterJourneyView;affectedEncounterReferences:readonly string[]}>

const transitions:Partial<Record<S,readonly S[]>>={
  [S.Planned]:[S.InProgress,S.Cancelled],
  [S.InProgress]:[S.OnHold,S.Discharged,S.Completed,S.Discontinued],
  [S.OnHold]:[S.InProgress,S.Completed,S.Discontinued],
  [S.Discharged]:[S.Completed],
}
/** This application's supported R5 transitions; these are policy, not a claim about every FHIR server. */
export function portalEncounterNextStatuses(status:string):readonly S[]{return transitions[status as S]??[]}

/** Shared minimal journey projection: no clinical detail, personnel directory or Group custody. */
export function projectPortalEncounterJourney(input:Readonly<{
  subjectIdentifier:string;resources:readonly PortalEncounterRecord[];services:readonly PortalEncounterService[]
  canManage:boolean;allowedStatuses?:readonly S[]
}>):PortalEncounterJourneyView{
  const encounterKeys=new Set<string>([E.Identifier,E.Subject,E.Patient,E.Status,E.ServiceType,E.ServiceProvider,E.Class,E.Appointment,E.PartOf,E.PeriodStart,E.PeriodEnd,E.ActualPeriodStart,E.ActualPeriodEnd,E.Location])
  const historyKeys=new Set<string>([H.Identifier,H.Encounter,H.Subject,H.Status,H.Class,H.ServiceType,H.ActualPeriodStart,H.ActualPeriodEnd,H.Location])
  const encounters:PortalEncounterRecord[]=[],history:PortalEncounterRecord[]=[]
  for(const row of input.resources){
    const entry=row.entry
    if(!entry||Object.keys(entry).some(key=>!['entryId','reference','resourceType','claims'].includes(key))||!Number.isInteger(row.revision)||row.revision<1)throw new TypeError('encounter_projection_invalid')
    if(!['Encounter','EncounterHistory'].includes(entry.resourceType))continue
    const owner=entry.resourceType==='Encounter'?(entry.claims[E.Subject]||entry.claims[E.Patient]):entry.claims[H.Subject]
    if(owner!==input.subjectIdentifier)continue
    const keys=entry.resourceType==='Encounter'?encounterKeys:historyKeys
    const claims=Object.fromEntries(Object.entries(entry.claims).filter(([key])=>keys.has(key)))
    const safe=buildFlatClaimResourceEntry({...entry,claims})
    if(entry.resourceType==='Encounter')encounters.push({entry:safe,revision:row.revision,allowedStatuses:input.canManage
      ?portalEncounterNextStatuses(claims[E.Status]).filter(status=>!input.allowedStatuses||input.allowedStatuses.includes(status)):[]})
    else history.push({entry:safe,revision:row.revision})
  }
  const visible=new Set(encounters.map(row=>row.entry.reference))
  return Object.freeze({subjectIdentifier:input.subjectIdentifier,canManage:input.canManage,services:input.services,
    encounters:Object.freeze(encounters),history:Object.freeze(history.filter(row=>visible.has(row.entry.claims[H.Encounter])).sort((a,b)=>(a.entry.claims[H.ActualPeriodStart]||'').localeCompare(b.entry.claims[H.ActualPeriodStart]||''))),
  })
}

/**
 * Deterministic claims-first plan; persistence and authorization belong to the provider.
 * A movement is not a discharge. Each changed Encounter has its own R5 history.
 * https://hl7.org/fhir/R5/encounterhistory.html
 */
export function planPortalEncounterChange(input:Readonly<{
  subjectIdentifier:string;source:FlatClaimResourceEntry;occurredAt:string;historyId:string
  status?:S;destination?:FlatClaimResourceEntry;destinationHistoryId?:string;sourceOutcome?:PortalEncounterSourceOutcome
}>):readonly FlatClaimResourceEntry[]{
  if(!/(?:Z|[+-]\d{2}:\d{2})$/u.test(input.occurredAt)||!Number.isFinite(Date.parse(input.occurredAt)))throw new TypeError('encounter_date_invalid')
  const source=validate(input.source,input.subjectIdentifier)
  const sourceStatus=input.destination?input.sourceOutcome:input.status
  if(!sourceStatus||!portalEncounterNextStatuses(source.claims[E.Status]).includes(sourceStatus))throw new TypeError('encounter_transition_invalid')
  if(input.destination&&sourceStatus!==S.OnHold&&sourceStatus!==S.Completed)throw new TypeError('encounter_transfer_outcome_invalid')
  const changed=withStatus(source,sourceStatus,input.occurredAt)
  const entries=[changed,history(changed,input.historyId,input.occurredAt)]
  if(input.destination){
    const destination=validate(input.destination,input.subjectIdentifier)
    if(destination.reference===source.reference)throw new TypeError('encounter_distinct_required')
    if(!source.claims[E.ServiceProvider]||source.claims[E.ServiceProvider]!==destination.claims[E.ServiceProvider])throw new TypeError('encounter_provider_mismatch')
    if(!portalEncounterNextStatuses(destination.claims[E.Status]).includes(S.InProgress))throw new TypeError('encounter_destination_transition_invalid')
    const root=source.claims[E.PartOf]||source.reference
    const next=withStatus(root===destination.reference?destination:{...destination,claims:{...destination.claims,[E.PartOf]:root}},S.InProgress,input.occurredAt)
    entries.push(next,history(next,input.destinationHistoryId||'',input.occurredAt))
  }
  return Object.freeze(entries)
}
function validate(entry:FlatClaimResourceEntry,subject:string):FlatClaimResourceEntry{
  if(entry?.resourceType!=='Encounter'||entry.reference!==`Encounter/${entry.entryId}`)throw new TypeError('encounter_resource_invalid')
  if((entry.claims[E.Subject]||entry.claims[E.Patient])!==subject)throw new TypeError('encounter_subject_mismatch')
  if(Object.keys(entry).some(key=>!['resourceType','entryId','reference','claims'].includes(key)))throw new TypeError('encounter_resource_invalid')
  return buildFlatClaimResourceEntry(entry)
}
function withStatus(entry:FlatClaimResourceEntry,status:S,at:string):FlatClaimResourceEntry{
  const claims:Record<string,string>={...entry.claims,[E.Status]:status}
  if(status===S.InProgress&&!claims[E.ActualPeriodStart])claims[E.ActualPeriodStart]=at
  if([S.Completed,S.Discharged,S.Discontinued].includes(status))claims[E.ActualPeriodEnd]=at
  return buildFlatClaimResourceEntry({...entry,claims})
}
function history(entry:FlatClaimResourceEntry,id:string,at:string):FlatClaimResourceEntry{
  const token=entry.claims[E.Class]||'',separator=token.lastIndexOf('|')
  if(separator<1)throw new TypeError('encounter_class_required')
  return buildEncounterHistoryR5FlatEntry({entryId:id,identifier:id,encounterReference:entry.reference,status:entry.claims[E.Status] as S,
    class:{system:token.slice(0,separator),code:token.slice(separator+1)},subjectReference:entry.claims[E.Subject]||entry.claims[E.Patient],
    serviceReference:entry.claims[E.ServiceType],locationReference:entry.claims[E.Location],actualPeriodStart:at,
  })
}

/** General Encounter read scope; no emergency-only Encounter filter is implied. */
export const PortalEncounterPermissionSection=IndividualLogicalSections.Encounters.attributeValue
