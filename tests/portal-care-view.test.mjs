// Flow contract: Demo and Network share one care presentation projection without persisting UI DTOs, losing unseen claims, changing ownership or accepting invalid periods.
import test from 'node:test'
import assert from 'node:assert/strict'
import {portalCareViewFromEntry,portalCareEntryFromView} from '../dist/portal-care-view.js'
import {createPortalDemoCareEntries} from '../dist/portal-demo-care-fixtures.js'
import {REPOSITORY_SAFE_EXAMPLES as examples} from '../dist/repository-privacy.js'
import {AppointmentClaim,EncounterClaim,EncounterStatusR5} from 'fhir-data-utils-ts/claims'
import {TaskClaim} from '../dist/task-artifact-schema.js'

const subject=examples.didWeb
const entries=createPortalDemoCareEntries({subjectReference:subject,idPrefix:examples.resourceUuid,now:Date.UTC(2030,0,1)})

test('both providers project the same resources and retain their independent references',()=>{
  const views=entries.map(entry=>portalCareViewFromEntry(entry,1))
  assert.deepEqual(views.map(view=>view.kind),['appointment','encounter','task'])
  assert.equal(views[2].focusReference,entries[0].reference)
  assert.equal(views[1].focusReference,entries[0].reference)
  assert.ok(views.every(view=>view.revision===1))
  for(let i=0;i<entries.length;i++)assert.deepEqual(portalCareEntryFromView(views[i],subject,entries[i]),entries[i])
})

test('editing a Task preserves ownership, focus and fields not edited by the form',()=>{
  const entry={...entries[2],claims:{...entries[2].claims,[TaskClaim.Requester]:examples.didWeb+':requester'}}
  const original=structuredClone(entry)
  const updated=portalCareEntryFromView({...portalCareViewFromEntry(entry),title:'Updated task'},subject,entry)
  assert.equal(updated.claims[TaskClaim.Requester],entry.claims[TaskClaim.Requester])
  assert.equal(updated.claims[TaskClaim.Focus],entries[0].reference)
  assert.equal(updated.claims[TaskClaim.Description],'Updated task')
  assert.deepEqual(entry,original)
})

test('Encounter lifecycle projections retain participant, service and Appointment traceability',()=>{
  const entry={...entries[1],claims:{...entries[1].claims,[EncounterClaim.Participant]:examples.didWeb+':professional',[EncounterClaim.ServiceProvider]:examples.didWeb+':organization'}}
  const updated=portalCareEntryFromView({...portalCareViewFromEntry(entry),status:EncounterStatusR5.InProgress},subject,entry)
  assert.equal(updated.claims[EncounterClaim.Participant],entry.claims[EncounterClaim.Participant])
  assert.equal(updated.claims[EncounterClaim.ServiceProvider],entry.claims[EncounterClaim.ServiceProvider])
  assert.equal(updated.claims[EncounterClaim.Appointment],entries[0].reference)
  assert.equal(portalCareViewFromEntry(updated).title,portalCareViewFromEntry(entry).title)
})

test('identity changes, foreign-subject edits and invalid periods fail before persistence',()=>{
  const view=portalCareViewFromEntry(entries[0])
  for(const invalid of [{id:view.id+'-other'},{dateTime:'not-a-date'},{endDateTime:new Date(Date.UTC(2029,0,1)).toISOString()}])
    assert.throws(()=>portalCareEntryFromView({...view,...invalid},subject,entries[0]),TypeError)
  assert.throws(()=>portalCareEntryFromView(view,subject+':other',entries[0]),/subject/)
  assert.equal(entries[0].claims[AppointmentClaim.Patient],subject)
})

test('the existing Task.note wire field survives form edits and readback',()=>{
  const entry=portalCareEntryFromView({...portalCareViewFromEntry(entries[2]),notes:'Reminder instructions'},subject,entries[2])
  // The literal is the established Network wire field being retained by this contract.
  assert.equal(entry.claims['Task.note'],'Reminder instructions')
  assert.equal(portalCareViewFromEntry(entry).notes,'Reminder instructions')
})
