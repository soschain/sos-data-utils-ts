// Flow contract: participant query/index helpers preserve recorded wire normalization, criteria, pagination and index ordering while retaining hostile own-key filters and never granting authorization.
import assert from 'node:assert/strict'
import test from 'node:test'
import {readFileSync} from 'node:fs'
import {spawnSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'
import {REPOSITORY_SAFE_EXAMPLES as E} from '../dist/repository-privacy.js'
const api=()=>import('../dist/communication-participant-query.js')
const fixture=()=>JSON.parse(readFileSync(new URL('./fixtures/communication-participant-recorded-wire.json',import.meta.url),'utf8'))
const plain=value=>JSON.parse(JSON.stringify(value))
for(const operation of ['index','parse','match','page'])test('participant '+operation+' preserves all recorded ordinary wire vectors',async()=>{
 const p=await api()
 const rows=fixture().rows.filter(row=>row.operation===operation)
 assert.equal(rows.length,{index:8,parse:18,match:12,page:4}[operation])
 for(const row of rows){
  const before=structuredClone(row.input)
  const result=operation==='index'?p.buildCommunicationParticipantIndexAttributes(row.input):operation==='parse'?p.parseCommunicationParticipantSearchCriteria(row.input):operation==='match'?p.matchesCommunicationParticipantSearch(row.input.projection,row.input.criteria):p.paginateCommunicationParticipantMatches(row.input.records,row.input.criteria)
  assert.deepEqual(plain(result),row.output);assert.deepEqual(row.input,before)
  if(operation==='page')assert.notEqual(result,row.input.records)
 }
 if(operation==='match'){
  for(const [tokens,flag] of [['subjectActorIds','anySubject'],['actorIds','anyActor'],['senderActorIds','anySender'],['recipientActorIds','anyRecipient'],['userActorIds','anyUser'],['targetActorIds','anyTarget']]){
   const criteria=p.parseCommunicationParticipantSearchCriteria({})
   criteria[tokens]=['absent-participant'];criteria[flag]=true
   assert.equal(p.matchesCommunicationParticipantSearch({},criteria),true,flag)
   criteria[flag]=false
   assert.equal(p.matchesCommunicationParticipantSearch({},criteria),false,flag)
  }
  // The compatibility contract compares lexical strings; it does not impose date parsing.
  const criteria=p.parseCommunicationParticipantSearchCriteria({'period-start':'alpha','period-end':'omega'})
  for(const sent of ['alpha','middle','omega'])assert.equal(p.matchesCommunicationParticipantSearch({sent},criteria),true)
  assert.equal(p.matchesCommunicationParticipantSearch({sent:'zeta'},criteria),false)
 }
})
test('own __proto__ filters survive parsing and cannot disappear into an unconditional match',async()=>{
 assert.equal(fixture().prototypeBaseline.ownProtoFilterDropped,true)
 assert.equal(fixture().prototypeBaseline.ownProtoMatched,true)
 const p=await api(),input=JSON.parse('{"__proto__":"must-not-match"}'),before=structuredClone(input)
 const criteria=p.parseCommunicationParticipantSearchCriteria(input)
 assert.equal(Object.hasOwn(criteria.claimSearchParams,'__proto__'),true)
 assert.deepEqual(criteria.claimSearchParams.__proto__,['must-not-match'])
 assert.equal(p.matchesCommunicationParticipantSearch({subject:E.didWeb},criteria),false)
 const parameters={resourceType:'Parameters',parameter:[{name:'__proto__',valueString:'must-not-match'}]}
 assert.deepEqual(p.parseCommunicationParticipantSearchCriteria(parameters).claimSearchParams.__proto__,['must-not-match'])
 assert.deepEqual(input,before);assert.equal(Object.prototype['must-not-match'],undefined)
})
test('an own constructor filter never resolves an inherited function, matches or crashes',async()=>{
 assert.equal(fixture().prototypeBaseline.constructorThrows,true)
 const p=await api()
 for(const input of [JSON.parse('{"constructor":"must-not-match"}'),{resourceType:'Parameters',parameter:[{name:'constructor',valueString:'must-not-match'}]}]){
  const criteria=p.parseCommunicationParticipantSearchCriteria(input)
  assert.deepEqual(criteria.claimSearchParams.constructor,['must-not-match'])
  assert.equal(p.matchesCommunicationParticipantSearch({subject:E.didWeb},criteria),false)
 }
})
test('only six required runtime exports are public, with exact prefixes/index names and mutable typed criteria',async()=>{
 const p=await api(),root=await import('../dist/index.js'),leaf=await import('sos-data-utils-ts/communication-participant-query'),f=fixture()
 assert.equal(f.rows.length,42)
 assert.deepEqual(p.CommunicationParticipantPrefixes,f.prefixes);assert.deepEqual(p.CommunicationParticipantIndexNames,f.indexNames)
 assert.equal(Object.isFrozen(p.CommunicationParticipantPrefixes),true);assert.equal(Object.isFrozen(p.CommunicationParticipantIndexNames),true)
 const names=['buildCommunicationParticipantIndexAttributes','CommunicationParticipantIndexNames','matchesCommunicationParticipantSearch','paginateCommunicationParticipantMatches','parseCommunicationParticipantSearchCriteria','CommunicationParticipantPrefixes']
 assert.deepEqual(Object.keys(p).sort(),names.sort());for(const name of names){assert.equal(root[name],p[name]);assert.equal(leaf[name],p[name])}
 const result=spawnSync(process.execPath,[fileURLToPath(new URL('../node_modules/typescript/bin/tsc',import.meta.url)),'--noEmit','--strict','--skipLibCheck','--module','NodeNext','--moduleResolution','NodeNext','--target','ES2022',fileURLToPath(new URL('./fixtures/communication-participant-query-consumer.ts',import.meta.url))],{encoding:'utf8'})
 assert.equal(result.status,0,result.stdout+result.stderr)
})
