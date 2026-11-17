import {CommunicationClaim,ResourceTypesFhirR4} from 'fhir-data-utils-ts'

/** Application index tokens; matching never authenticates a participant or grants access. */
export const CommunicationParticipantPrefixes=Object.freeze({
  Did:'did:',Email:'email:',Mailto:'mailto:',Tel:'tel:',Phone:'phone:',Wildcard:'*',
} as const)
export const CommunicationParticipantIndexNames=Object.freeze({
  Subject:CommunicationClaim.Subject,
  Participant:'Communication.participant-token',
  Sender:'Communication.sender-token',
  Recipient:'Communication.recipient-token',
} as const)

export type CommunicationParticipantProjection={
  subject?:unknown;sender?:unknown;recipients?:unknown;from?:unknown;to?:unknown
  sent?:unknown;category?:unknown;topic?:unknown
}
export type CommunicationParticipantIndexedAttribute={name:string;value:string;unique?:boolean}
/** Mutable because the authorized caller may narrow the parsed criteria before searching. */
export type CommunicationParticipantSearchCriteria={
  subjectActorIds:string[];anySubject:boolean
  actorIds:string[];anyActor:boolean
  senderActorIds:string[];anySender:boolean
  recipientActorIds:string[];anyRecipient:boolean
  userActorIds:string[];anyUser:boolean
  targetActorIds:string[];anyTarget:boolean
  claimSearchParams:Record<string,string[]>
  periodStart?:string;periodEnd?:string;page:number;count?:number
}

const controls=['subject','actor','sender','recipient','user','target'] as const
const searchKeys=[...controls,'period-start','period-end','page','count','sent-from','sent-to'] as const
const prefixes=CommunicationParticipantPrefixes
function record(value:unknown):value is Record<string,unknown>{return value!==null&&typeof value==='object'}
function flatStrings(value:unknown):string[]{
  if(Array.isArray(value))return value.flatMap(flatStrings)
  const text=String(value||'').trim()
  return text?text.split(',').map(item=>item.trim()).filter(Boolean):[]
}
function telephone(value:unknown):string{
  const text=String(value||'').trim(),digits=text.replace(/[^0-9]/gu,'')
  return digits?prefixes.Tel+(text.startsWith('+')?'+':'')+digits:''
}
function participant(value:unknown):string{
  const text=String(value||'').trim(),lower=text.toLowerCase()
  if(!text||text===prefixes.Wildcard)return text
  if(lower.startsWith(prefixes.Did))return prefixes.Did+text.slice(prefixes.Did.length)
  for(const prefix of [prefixes.Mailto,prefixes.Email])if(lower.startsWith(prefix)){
    const email=text.slice(prefix.length).trim().toLowerCase()
    return email?prefixes.Email+email:''
  }
  if(/^[^@\s]+@[^@\s]+\.[^@\s]+$/u.test(text))return prefixes.Email+lower
  for(const prefix of [prefixes.Phone,prefixes.Tel])if(lower.startsWith(prefix))return telephone(text.slice(prefix.length))
  if(/^[+()0-9.\-\s]{6,}$/u.test(text))return telephone(text)
  return text
}
const scalarList=(value:unknown)=>[...new Set(flatStrings(value))]
const participantList=(value:unknown)=>[...new Set(flatStrings(value).map(participant).filter(Boolean))]
const participantClaim=(key:string)=>key===CommunicationClaim.Subject||key===CommunicationClaim.Sender||key===CommunicationClaim.Recipient
const isControl=(key:string)=>controls.some(control=>control===key)
const valuesFor=(key:string,value:unknown)=>isControl(key)||participantClaim(key)?participantList(value):scalarList(value)
const hasWildcard=(values:readonly string[])=>values.includes(prefixes.Wildcard)
const withoutWildcard=(values:readonly string[])=>values.filter(value=>value!==prefixes.Wildcard)
function dateText(value:unknown):string|undefined{return String(value||'').trim()||undefined}
function firstDate(...values:unknown[]):string|undefined{
  for(const value of values){const text=dateText(value);if(text)return text}
  return undefined
}
function positive(value:unknown):number|undefined{
  const number=typeof value==='number'?value:Number(String(value||'').trim())
  return Number.isInteger(number)&&number>0?number:undefined
}

function flatQuery(input:unknown):Record<string,string[]>{
  // Null prototype prevents names such as constructor or __proto__ resolving inherited values.
  const result:Record<string,string[]>=Object.create(null)
  for(const key of searchKeys)result[key]=[]
  if(!record(input))return result
  if(input.resourceType===ResourceTypesFhirR4.Parameters&&Array.isArray(input.parameter)){
    for(const parameter of input.parameter){
      if(!record(parameter))continue
      const name=String(parameter.name||'').trim();if(!name)continue
      const reference=record(parameter.valueReference)?parameter.valueReference.reference:undefined
      const code=record(parameter.valueCoding)?parameter.valueCoding.code:undefined
      const raw=parameter.valueString??parameter.valueUri??parameter.valueCode??reference??code??parameter.valueInteger??parameter.valueDecimal
      result[name]??=[]
      result[name].push(...valuesFor(name,raw))
    }
  }else for(const [key,value] of Object.entries(input))result[key]=valuesFor(key,value)
  for(const key of searchKeys)result[key]=[...new Set(result[key].filter(Boolean))]
  return result
}

/** Accepts flat search fields or native FHIR Parameters; leaves authorization and query narrowing to callers. */
export function parseCommunicationParticipantSearchCriteria(input?:unknown):CommunicationParticipantSearchCriteria{
  const flat=flatQuery(input)
  // Object.fromEntries preserves ordinary JSON records while defining hostile names as own data properties.
  const claimSearchParams=Object.fromEntries(Object.entries(flat)
    .filter(([key,values])=>!searchKeys.some(control=>control===key)&&values.length>0)
    .map(([key,values])=>[key,[...new Set(values)]]))
  return {
    subjectActorIds:withoutWildcard(flat.subject),anySubject:hasWildcard(flat.subject),
    actorIds:withoutWildcard(flat.actor),anyActor:hasWildcard(flat.actor),
    senderActorIds:withoutWildcard(flat.sender),anySender:hasWildcard(flat.sender),
    recipientActorIds:withoutWildcard(flat.recipient),anyRecipient:hasWildcard(flat.recipient),
    userActorIds:withoutWildcard(flat.user),anyUser:hasWildcard(flat.user),
    targetActorIds:withoutWildcard(flat.target),anyTarget:hasWildcard(flat.target),
    claimSearchParams,periodStart:firstDate(flat['period-start'][0],flat['sent-from'][0]),
    periodEnd:firstDate(flat['period-end'][0],flat['sent-to'][0]),
    page:positive(flat.page[0])||1,count:positive(flat.count[0]),
  }
}

export function buildCommunicationParticipantIndexAttributes(projection:CommunicationParticipantProjection):CommunicationParticipantIndexedAttribute[]{
  const subjects=participantList(projection.subject),senders=participantList(projection.sender??projection.from),recipients=participantList(projection.recipients??projection.to)
  const groups:readonly [string,readonly string[],boolean][]=[
    [CommunicationParticipantIndexNames.Subject,subjects,true],
    [CommunicationParticipantIndexNames.Sender,senders,false],
    [CommunicationParticipantIndexNames.Recipient,recipients,false],
    [CommunicationParticipantIndexNames.Participant,[...new Set([...senders,...recipients])],false],
  ]
  const seen=new Set<string>(),attributes:CommunicationParticipantIndexedAttribute[]=[]
  for(const [name,values,unique] of groups)for(const value of values){
    const identity=name+'\u0000'+value
    if(!seen.has(identity)){seen.add(identity);attributes.push({name,value,unique})}
  }
  return attributes
}

function matches(actual:readonly string[],expected:readonly string[],any:boolean):boolean{
  if(any||!expected.length)return true
  return actual.length>0&&expected.some(value=>actual.includes(value))
}
export function matchesCommunicationParticipantSearch(projection:CommunicationParticipantProjection,criteria:CommunicationParticipantSearchCriteria):boolean{
  const subjects=participantList(projection.subject),senders=participantList(projection.sender??projection.from),recipients=participantList(projection.recipients??projection.to)
  const participants=[...new Set([...senders,...recipients])]
  if(!matches(subjects,criteria.subjectActorIds,criteria.anySubject)
    ||!matches(participants,criteria.actorIds,criteria.anyActor)
    ||!matches(senders,criteria.senderActorIds,criteria.anySender)
    ||!matches(recipients,criteria.recipientActorIds,criteria.anyRecipient)
    ||!matches(participants,criteria.userActorIds,criteria.anyUser)
    ||!matches(participants,criteria.targetActorIds,criteria.anyTarget))return false
  const index:Record<string,string[]>=Object.create(null)
  Object.assign(index,{[CommunicationClaim.Subject]:subjects,[CommunicationClaim.Sender]:senders,
    [CommunicationClaim.Recipient]:recipients,[CommunicationClaim.Category]:scalarList(projection.category),
    [CommunicationClaim.Topic]:scalarList(projection.topic)})
  for(const [key,expected] of Object.entries(criteria.claimSearchParams)){
    const actual=Object.hasOwn(index,key)?index[key]:[]
    if(!matches(actual,withoutWildcard(expected),hasWildcard(expected)))return false
  }
  const sent=dateText(projection.sent)
  return !criteria.periodStart&&!criteria.periodEnd
    ||Boolean(sent&&(!criteria.periodStart||sent>=criteria.periodStart)&&(!criteria.periodEnd||sent<=criteria.periodEnd))
}

export function paginateCommunicationParticipantMatches<T>(records:readonly T[],criteria:Pick<CommunicationParticipantSearchCriteria,'page'|'count'>):T[]{
  const page=positive(criteria.page)||1,count=positive(criteria.count)
  return count?records.slice((page-1)*count,page*count):[...records]
}
