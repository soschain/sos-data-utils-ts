// Flow contract: one fixed-profile stored-session signature command uses public-only output types, preserves historical v1 envelope framing and does not turn profile possession into domain authority.
import assert from 'node:assert/strict'
import test from 'node:test'
import {spawnSync} from 'node:child_process'
import {resolve} from 'node:path'
import * as owned from '../dist/registered-profile-contract.js'
import {PROFILE_SECRET_ENVELOPE_VERSION} from '../dist/server-profile-secret-contract.js'

test('exports exactly the two fixed signing profiles as an immutable owned catalog',()=>{
 assert.deepEqual(owned.StoredProfileSignatureProfiles,{IndividualIdentityPresentation:'individual-identity-presentation-v1',OrganizationActorDetachedCredential:'organization-actor-detached-credential-v1'})
 assert.equal(Object.isFrozen(owned.StoredProfileSignatureProfiles),true)
})
test('the public DTO consumer retains historical rows and rejects missing subject/private/arbitrary signing fields',()=>{
 const result=spawnSync(process.execPath,[resolve('node_modules/typescript/bin/tsc'),'--noEmit','--strict','--module','NodeNext','--moduleResolution','NodeNext','--target','ES2022','tests/fixtures/stored-profile-custody-consumer.ts'],{encoding:'utf8'})
 assert.equal(result.status,0,result.stdout+result.stderr)
})
test('retains the existing persisted PIN/host envelope marker',()=>{
 assert.equal(PROFILE_SECRET_ENVELOPE_VERSION,'gdc-pin-host-envelope-v1')
})
