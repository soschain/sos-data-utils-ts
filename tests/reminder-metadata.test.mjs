// Flow contract: reminder metadata roundtrips explicit actor/action/entity/channel rules and group/purpose descriptors; malformed or absent metadata never becomes a permission grant.
import assert from 'node:assert/strict'
import test from 'node:test'
import * as data from '../dist/index.js'
import {REPOSITORY_SAFE_EXAMPLES as SAFE} from '../dist/repository-privacy.js'

const fixture=()=>({subject:SAFE.didWeb,purpose:'reminder-delivery',requiredSections:['appointments'],requiredResourceTypes:['Task'],groupedBy:['subject','channel'],note:'Explicit reminder policy',rules:[{actorKind:'assistant',actorId:'voice-assistant',decision:'allow',actions:['execute'],entities:['dispatch-window'],channels:['phone'],purpose:'reminder-delivery'}]})

test('preserves the existing reminder metadata wire names and explicit rules',()=>{
 assert.equal(typeof data.createReminderPermissionBundle,'function')
 const input=fixture(),snapshot=structuredClone(input)
 const bundle=data.createReminderPermissionBundle(input)
 const encoded=data.encodeReminderPermissionBundle(bundle)
 assert.equal(encoded['uhc-reminder-permission-subject'],SAFE.didWeb)
 assert.equal(encoded['uhc-reminder-permission-rule-0-decision'],'allow')
 assert.deepEqual(data.decodeReminderPermissionBundle(encoded),bundle)
 assert.deepEqual(input,snapshot)
})

test('normalizes descriptor lists without losing denied actors, purpose or group metadata',()=>{
 const input=fixture();input.groupedBy=['subject','subject','channel'];input.rules.push({...input.rules[0],actorId:SAFE.firstContactIdentifier,decision:'deny'})
 const decoded=data.decodeReminderPermissionBundle(data.encodeReminderPermissionBundle(input))
 assert.deepEqual(decoded.groupedBy,['subject','channel'])
 assert.equal(decoded.rules[1].decision,'deny')
 assert.equal(decoded.rules[1].purpose,input.purpose)
})

test('rejects malformed decisions, unknown rule fields and inconsistent counts',()=>{
 const valid=data.encodeReminderPermissionBundle(fixture())
 for(const override of [
  {'uhc-reminder-permission-rule-0-decision':'unexpected'},
  {'uhc-reminder-permission-rule-0-actor-kind':'unknown'},
  {'uhc-reminder-permission-rule-0-actions':'unsupported'},
  {'uhc-reminder-permission-rule-0-entities':'unsupported'},
  {'uhc-reminder-permission-rule-0-channels':'unsupported'},
  {'uhc-reminder-permission-rules-count':'1000000000'},
  {'uhc-reminder-permission-rules-count':'1garbage'},
 ])assert.equal(data.decodeReminderPermissionBundle({...valid,...override}),undefined)
 assert.equal(data.decodeReminderPermissionBundle(undefined),undefined)
 assert.equal(data.decodeReminderPermissionBundle({}),undefined)
 assert.throws(()=>data.createReminderPermissionBundle({...fixture(),rules:[{...fixture().rules[0],decision:'unexpected'}]}))
})
