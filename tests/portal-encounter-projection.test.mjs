// Flow contract: the same confirmed journey projection serves Professional and delegated Personal readers without leaking participants, internal Groups, diagnoses, foreign subjects or browser-supplied mutation authority.
import test from 'node:test'
import assert from 'node:assert/strict'
import * as data from '../dist/index.js'
import {EncounterClaim as E,EncounterStatusR5 as S} from 'fhir-data-utils-ts/claims'
import {FHIR_ENCOUNTER_TRANSFER_TEST_DATA as f} from 'fhir-data-utils-ts/data'
import {buildFlatClaimResourceEntry} from 'fhir-data-utils-ts/flat-claim-resource-graph'
const entry=buildFlatClaimResourceEntry({resourceType:'Encounter',entryId:f.source.id,claims:{
  [E.Identifier]:f.source.identifier,[E.Subject]:f.subjectReference,[E.Status]:S.Planned,[E.ServiceProvider]:f.senderReference,
  [E.ServiceType]:f.source.serviceReference,[E.Participant]:f.senderReference.replace('Organization/','Practitioner/'),[E.Diagnosis]:f.indexRecipientReference,
}})
const input={subjectIdentifier:f.subjectReference,resources:[{entry,revision:1}],services:[],canManage:false}
test('a read-only journey strips internal and clinical details while retaining the actual stage',()=>{
  const before=structuredClone(entry),view=data.projectPortalEncounterJourney(input)
  assert.equal(view.encounters.length,1)
  assert.equal(view.encounters[0].entry.claims[E.Status],S.Planned)
  assert.equal(view.encounters[0].entry.claims[E.Participant],undefined)
  assert.equal(view.encounters[0].entry.claims[E.Diagnosis],undefined)
  assert.deepEqual(view.encounters[0].allowedStatuses,[])
  assert.deepEqual(entry,before)
})
test('configured writer status options are bounded by the actual current state',()=>{
  const view=data.projectPortalEncounterJourney({...input,canManage:true,allowedStatuses:[S.InProgress,S.Completed]})
  assert.deepEqual(view.encounters[0].allowedStatuses,[S.InProgress])
})
test('foreign subjects are excluded and nested native resource state is rejected',()=>{
  assert.equal(data.projectPortalEncounterJourney({...input,subjectIdentifier:f.indexRecipientReference}).encounters.length,0)
  assert.throws(()=>data.projectPortalEncounterJourney({...input,resources:[{entry:{...entry,resource:{resourceType:'Encounter'}},revision:1}]}),/projection/)
})
