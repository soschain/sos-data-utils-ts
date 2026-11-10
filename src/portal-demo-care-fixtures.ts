import {AppointmentClaim, AppointmentStatus, EncounterClaim, EncounterStatusR5} from 'fhir-data-utils-ts/claims'
import {buildFlatClaimResourceEntry, type FlatClaimResourceEntry} from 'fhir-data-utils-ts/flat-claim-resource-graph'
import {TaskClaim, TaskIntent, TaskStatus} from './task-artifact-schema.js'

/** Synthetic examples use the same independent flat resource graph as Network providers. */
export function createPortalDemoCareEntries(input: Readonly<{
  subjectReference: string
  idPrefix: string
  now: number
}>): readonly FlatClaimResourceEntry[] {
  const subject=input.subjectReference.trim()
  if(!subject||subject.length>1024||/\s/u.test(subject)||!/^[a-zA-Z0-9_-]{1,100}$/u.test(input.idPrefix)
    ||!Number.isFinite(input.now)||input.now<0)throw new TypeError('portal_demo_care_seed_invalid')
  const appointmentId=`${input.idPrefix}-appointment`
  const start=new Date(input.now+60*60*1000).toISOString()
  return Object.freeze([
    buildFlatClaimResourceEntry({entryId:appointmentId,resourceType:'Appointment',claims:{
      [AppointmentClaim.Identifier]:appointmentId,
      [AppointmentClaim.Patient]:subject,
      [AppointmentClaim.Status]:AppointmentStatus.Booked,
      [AppointmentClaim.Description]:'Blood donation appointment',
      [AppointmentClaim.Start]:start,
      [AppointmentClaim.End]:new Date(input.now+90*60*1000).toISOString(),
    }}),
    buildFlatClaimResourceEntry({entryId:`${input.idPrefix}-encounter`,resourceType:'Encounter',claims:{
      [EncounterClaim.Identifier]:`${input.idPrefix}-encounter`,
      [EncounterClaim.Subject]:subject,
      [EncounterClaim.Status]:EncounterStatusR5.Planned,
      [EncounterClaim.Appointment]:`Appointment/${appointmentId}`,
      [EncounterClaim.PeriodStart]:start,
    }}),
    buildFlatClaimResourceEntry({entryId:`${input.idPrefix}-task`,resourceType:'Task',claims:{
      [TaskClaim.Identifier]:`${input.idPrefix}-task`,
      [TaskClaim.For]:subject,
      [TaskClaim.Status]:TaskStatus.Requested,
      [TaskClaim.Intent]:TaskIntent.Plan,
      [TaskClaim.Description]:'Confirm the blood donation appointment',
      [TaskClaim.Focus]:`Appointment/${appointmentId}`,
      [TaskClaim.ScheduledAt]:new Date(input.now+60*1000).toISOString(),
      [TaskClaim.AutoCloseAt]:new Date(input.now+90*60*1000).toISOString(),
      [TaskClaim.Channel]:'push',
    }}),
  ])
}
