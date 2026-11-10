// Flow contract: shared synthetic care examples produce subject-bound flat Appointment, Encounter and Task entries with future timing, independent identities and no real delivery channel.
import assert from 'node:assert/strict'
import test from 'node:test'
import {createPortalDemoCareEntries} from '../dist/portal-demo-care-fixtures.js'
import {REPOSITORY_SAFE_EXAMPLES} from '../dist/repository-privacy.js'
import {AppointmentClaim, EncounterClaim} from 'fhir-data-utils-ts/claims'
import {TaskClaim, TaskStatus} from '../dist/task-artifact-schema.js'

const subject=REPOSITORY_SAFE_EXAMPLES.didWeb
// The fixed clock is the timing boundary under test, not an operational date.
const now=Date.UTC(2030,0,1)
const input={subjectReference:subject,idPrefix:REPOSITORY_SAFE_EXAMPLES.resourceUuid,now}

test('all three resources belong to the selected subject and remain independent flat entries',()=>{
  const entries=createPortalDemoCareEntries(input)
  assert.deepEqual(entries.map(entry=>entry.resourceType),['Appointment','Encounter','Task'])
  assert.equal(new Set(entries.map(entry=>entry.reference)).size,3)
  const [appointment,encounter,task]=entries
  assert.equal(appointment.claims[AppointmentClaim.Patient],subject)
  assert.equal(encounter.claims[EncounterClaim.Subject],subject)
  assert.equal(task.claims[TaskClaim.For],subject)
  assert.equal(task.claims[TaskClaim.Focus],appointment.reference)
  assert.equal(task.claims[TaskClaim.Status],TaskStatus.Requested)
  for(const entry of entries){
    assert.equal(entry.reference,`${entry.resourceType}/${entry.entryId}`)
    assert.equal(entry.resource,undefined)
    assert.ok(Object.entries(entry.claims).every(([key,value])=>key.startsWith(entry.resourceType+'.')&&typeof value==='string'))
  }
})

test('timings are fresh for each seeded workspace and never request a real phone delivery',()=>{
  const first=createPortalDemoCareEntries(input)
  const later=createPortalDemoCareEntries({...input,now:now+86_400_000})
  assert.ok(Date.parse(first[0].claims[AppointmentClaim.Start])>now)
  assert.ok(Date.parse(first[2].claims[TaskClaim.ScheduledAt])>now)
  assert.equal(Date.parse(later[2].claims[TaskClaim.ScheduledAt])-Date.parse(first[2].claims[TaskClaim.ScheduledAt]),86_400_000)
  assert.equal(first[2].claims[TaskClaim.Channel],'push')
  assert.ok(!JSON.stringify(first).includes('phone-call'))
  assert.deepEqual(first,createPortalDemoCareEntries(input))
})

test('invalid ownership, IDs and clocks fail before a seed is returned',()=>{
  for(const invalid of [{subjectReference:''},{idPrefix:'../invalid'},{now:NaN}])assert.throws(()=>createPortalDemoCareEntries({...input,...invalid}),TypeError)
})
