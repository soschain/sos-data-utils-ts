// Flow contract: canonical Encounter transitions and transfers retain the exact subject/provider, independent resource identities and immutable R5 history; no browser DTO grants authority.
import test from 'node:test'
import assert from 'node:assert/strict'
import * as data from '../dist/index.js'
import {FHIR_ENCOUNTER_TRANSFER_TEST_DATA as f} from 'fhir-data-utils-ts/data'
import {EncounterClaim as E,EncounterHistoryClaim as H,EncounterStatusR5 as S} from 'fhir-data-utils-ts/claims'
import {buildFlatClaimResourceEntry} from 'fhir-data-utils-ts/flat-claim-resource-graph'

function encounter(which,status=S.InProgress){return buildFlatClaimResourceEntry({resourceType:'Encounter',entryId:which.id,claims:{
  [E.Identifier]:which.identifier,[E.Subject]:f.subjectReference,[E.Status]:status,
  [E.Class]:`${f.class.system}|${f.class.code}`,[E.ServiceProvider]:f.senderReference,[E.ServiceType]:which.serviceReference,[E.Location]:which.locationReference,
}})}
const source=encounter(f.source),destination=encounter(f.destination,S.Planned)
const input={subjectIdentifier:f.subjectReference,source,occurredAt:f.occurredAt,historyId:f.sourceHistory.id}

test('status transitions create one canonical immutable history alongside the updated Encounter',()=>{
  const before=structuredClone(source)
  const entries=data.planPortalEncounterChange({...input,status:S.OnHold})
  assert.deepEqual(entries.map(x=>x.resourceType),['Encounter','EncounterHistory'])
  assert.equal(entries[0].claims[E.Status],S.OnHold)
  assert.equal(entries[1].claims[H.Encounter],source.reference)
  assert.equal(entries[1].claims[H.Subject],f.subjectReference)
  assert.equal(entries[1].claims[H.ActualPeriodStart],f.occurredAt)
  assert.deepEqual(source,before)
})
test('temporary and definitive transfers update both stages and both histories without inferring discharge',()=>{
  for(const sourceOutcome of [S.OnHold,S.Completed]){
    const entries=data.planPortalEncounterChange({...input,destination,sourceOutcome,destinationHistoryId:f.destinationHistory.id})
    assert.equal(entries.length,4)
    assert.equal(entries[0].claims[E.Status],sourceOutcome)
    assert.equal(entries[2].claims[E.Status],S.InProgress)
    assert.equal(entries[2].claims[E.PartOf],source.reference)
    assert.ok(entries.every(x=>x.claims[E.Subject]===f.subjectReference||x.claims[H.Subject]===f.subjectReference))
    assert.ok(entries.every(x=>x.claims[E.Status]!==S.Discharged))
  }
})
test('terminal reactivation, wrong subjects, other providers and self transfers fail closed',()=>{
  assert.throws(()=>data.planPortalEncounterChange({...input,source:encounter(f.source,S.Completed),status:S.InProgress}),/transition/)
  assert.throws(()=>data.planPortalEncounterChange({...input,subjectIdentifier:f.indexRecipientReference,status:S.OnHold}),/subject/)
  assert.throws(()=>data.planPortalEncounterChange({...input,destination:{...destination,claims:{...destination.claims,[E.ServiceProvider]:f.indexRecipientReference}},sourceOutcome:S.OnHold,destinationHistoryId:f.destinationHistory.id}),/provider/)
  assert.throws(()=>data.planPortalEncounterChange({...input,destination:source,sourceOutcome:S.Completed,destinationHistoryId:f.destinationHistory.id}),/distinct/)
})
test('missing timezone, invalid statuses and malformed references are rejected',()=>{
  assert.throws(()=>data.planPortalEncounterChange({...input,occurredAt:f.invalidOccurredAtWithoutTimezone,status:S.OnHold}),/date/)
  assert.throws(()=>data.planPortalEncounterChange({...input,status:'invented-status'}),/transition/)
  assert.throws(()=>data.planPortalEncounterChange({...input,source:{...source,reference:f.senderReference},status:S.OnHold}),/encounter/)
})
