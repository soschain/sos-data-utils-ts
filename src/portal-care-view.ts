import {AppointmentClaim,AppointmentStatus,EncounterClaim,EncounterStatusR5} from 'fhir-data-utils-ts/claims'
import {buildFlatClaimResourceEntry,type FlatClaimResourceEntry} from 'fhir-data-utils-ts/flat-claim-resource-graph'
import {TaskClaim,TaskIntent,TaskStatus} from './task-artifact-schema.js'

/** Shared presentation contracts. Persist the independent flat resources, not these UI projections. */
export type PortalCareResourceKind='medication'|'appointment'|'task'|'behavior'|'encounter'
export type PortalCareResourceView=Readonly<{
  kind:PortalCareResourceKind;id:string;title:string;status?:string;revision?:number
  dateTime?:string;endDateTime?:string;location?:string;slotReference?:string
  actorReferences?:readonly string[];userSelected?:boolean;organizationReference?:string
  notificationEmail?:string;basedOnReference?:string;focusReference?:string
  reminderChannel?:'phone'|'push';remindAt?:string|null
  notes?:string;dose?:string;frequency?:string;language?:string
}>
export type PortalAppointmentSlotView=Readonly<{id:string;reference:string;scheduleReference:string;start:string;end:string;locationReference?:string}>
export type PortalAppointmentResponseAction='confirm'|'cancel'|'reschedule'
export type PortalCareNotificationView=Readonly<{
  id:string;text:string;resourceReference:string;resourceType:'Appointment'|'Encounter'|'Task'
  status:string;occurredAt:string;readAt?:string
}>
export type PortalCareViewStore=Readonly<{
  load:(subjectDid:string,kind:PortalCareResourceKind)=>Promise<PortalCareResourceView[]>
  save:(subjectDid:string,resource:PortalCareResourceView,mode:'create'|'update')=>Promise<PortalCareResourceView[]>
  respond?:(subjectDid:string,appointment:PortalCareResourceView,action:PortalAppointmentResponseAction,newSlot?:PortalAppointmentSlotView)=>Promise<PortalCareResourceView[]>
  loadSlots?:(subjectDid:string,appointment:PortalCareResourceView)=>Promise<PortalAppointmentSlotView[]>
  notifications?:(subjectDid:string)=>Promise<PortalCareNotificationView[]>
  acknowledge?:(subjectDid:string,id:string)=>Promise<void>
}>

/** Both providers project the same fields for the common viewer/editor. */
export function portalCareViewFromEntry(entry:FlatClaimResourceEntry,revision?:number):PortalCareResourceView{
  const c=entry.claims
  const kind=entry.resourceType==='Appointment'?'appointment':entry.resourceType==='Encounter'?'encounter':entry.resourceType==='Task'?'task':undefined
  if(!kind)throw new TypeError('portal_care_resource_type_invalid')
  const title=kind==='appointment'?c[AppointmentClaim.Description]||'Appointment':kind==='task'?c[TaskClaim.Description]||c[TaskClaim.BasedOnDisplay]||'Task':'Encounter'
  const dateTime=kind==='appointment'?c[AppointmentClaim.Start]||c[AppointmentClaim.Date]:kind==='encounter'?c[EncounterClaim.ActualPeriodStart]||c[EncounterClaim.PeriodStart]:c[TaskClaim.ScheduledAt]||c[TaskClaim.ExecutionPeriodStart]
  const endDateTime=kind==='appointment'?c[AppointmentClaim.End]:kind==='encounter'?c[EncounterClaim.ActualPeriodEnd]||c[EncounterClaim.PeriodEnd]:c[TaskClaim.AutoCloseAt]||c[TaskClaim.WindowEnd]
  const actors=kind==='appointment'?c[AppointmentClaim.ParticipantActor]:c[EncounterClaim.Participant]
  return {kind,id:entry.entryId,title,status:c[`${entry.resourceType}.status`],...(revision!==undefined?{revision}:{}),
    ...(dateTime?{dateTime}:{}),...(endDateTime?{endDateTime}:{}),
    ...(c[AppointmentClaim.Location]||c[EncounterClaim.Location]?{location:c[AppointmentClaim.Location]||c[EncounterClaim.Location]}:{}),
    ...(c[AppointmentClaim.Slot]?{slotReference:c[AppointmentClaim.Slot]}:{}),
    ...(actors?{actorReferences:actors.split(',').filter(Boolean)}:{}),
    ...(c[TaskClaim.Focus]||c[EncounterClaim.Appointment]?{focusReference:c[TaskClaim.Focus]||c[EncounterClaim.Appointment]}:{}),
    ...(c[TaskClaim.BasedOn]?{basedOnReference:c[TaskClaim.BasedOn]}:{}),
    ...(c[TaskClaim.Channel]==='push'||c[TaskClaim.Channel]==='phone'?{reminderChannel:c[TaskClaim.Channel] as 'push'|'phone'}:{}),
    ...(c[AppointmentClaim.NoteText]||c[TaskClaim.Note]?{notes:c[AppointmentClaim.NoteText]||c[TaskClaim.Note]}:{}),
    ...(c[EncounterClaim.ServiceProvider]?{organizationReference:c[EncounterClaim.ServiceProvider]}:{}),
  }
}

/** Whitelisted form fields update a flat resource while retaining fields the form does not edit. */
export function portalCareEntryFromView(view:PortalCareResourceView,subjectReference:string,previous?:FlatClaimResourceEntry):FlatClaimResourceEntry{
  const type=view.kind==='appointment'?'Appointment':view.kind==='encounter'?'Encounter':view.kind==='task'?'Task':undefined
  if(!type||!view.id?.trim()||!view.title?.trim()||!subjectReference?.trim())throw new TypeError('portal_care_resource_invalid')
  if(previous&&(previous.resourceType!==type||previous.entryId!==view.id))throw new TypeError('portal_care_resource_identity_mismatch')
  if(previous){
    const c=previous.claims,owner=type==='Task'?(c[TaskClaim.For]||c[TaskClaim.Subject]):type==='Encounter'?(c[EncounterClaim.Subject]||c[EncounterClaim.Patient]):c[AppointmentClaim.Patient]||c['Appointment.subject'];
    if(owner&&owner.replace(/^(?:Patient|Organization)\//u,'')!==subjectReference.replace(/^(?:Patient|Organization)\//u,''))throw new TypeError('portal_care_subject_mismatch')
  }
  const claims:Record<string,string>={...previous?.claims,[`${type}.identifier`]:view.id}
  if(type==='Appointment'){
    Object.assign(claims,{[AppointmentClaim.Patient]:subjectReference,[AppointmentClaim.Description]:view.title,[AppointmentClaim.Status]:view.status||claims[AppointmentClaim.Status]||AppointmentStatus.Booked})
    assignOptional(claims,AppointmentClaim.Start,view.dateTime)
    assignOptional(claims,AppointmentClaim.End,view.endDateTime)
    assignOptional(claims,AppointmentClaim.Location,view.location)
    assignOptional(claims,AppointmentClaim.NoteText,view.notes)
    if(view.actorReferences)claims[AppointmentClaim.ParticipantActor]=view.actorReferences.join(',')
    if(view.slotReference)claims[AppointmentClaim.Slot]=view.slotReference
  }else if(type==='Task'){
    Object.assign(claims,{[TaskClaim.For]:subjectReference,[TaskClaim.Description]:view.title,[TaskClaim.Status]:view.status||claims[TaskClaim.Status]||TaskStatus.Requested,
      [TaskClaim.Intent]:claims[TaskClaim.Intent]||TaskIntent.Plan,[TaskClaim.Channel]:view.reminderChannel||claims[TaskClaim.Channel]||'push'})
    assignOptional(claims,TaskClaim.ScheduledAt,view.dateTime)
    assignOptional(claims,TaskClaim.AutoCloseAt,view.endDateTime)
    assignOptional(claims,TaskClaim.Note,view.notes)
    if(view.basedOnReference)claims[TaskClaim.BasedOn]=view.basedOnReference
    if(view.focusReference)claims[TaskClaim.Focus]=view.focusReference
  }else{
    Object.assign(claims,{[EncounterClaim.Subject]:subjectReference,[EncounterClaim.Status]:view.status||claims[EncounterClaim.Status]||EncounterStatusR5.Planned})
    assignOptional(claims,EncounterClaim.PeriodStart,view.dateTime)
    assignOptional(claims,EncounterClaim.PeriodEnd,view.endDateTime)
    if(view.organizationReference)claims[EncounterClaim.ServiceProvider]=view.organizationReference
    if(view.actorReferences)claims[EncounterClaim.Participant]=view.actorReferences.join(',')
    if(view.focusReference)claims[EncounterClaim.Appointment]=view.focusReference
  }
  for(const value of [view.dateTime,view.endDateTime])if(value!==undefined&&!Number.isFinite(Date.parse(value)))throw new TypeError('portal_care_date_invalid')
  if(view.dateTime&&view.endDateTime&&Date.parse(view.endDateTime)<Date.parse(view.dateTime))throw new TypeError('portal_care_period_invalid')
  return buildFlatClaimResourceEntry({entryId:view.id,resourceType:type,claims})
}
function assignOptional(claims:Record<string,string>,key:string,value:string|undefined){if(value)claims[key]=value;else delete claims[key]}
