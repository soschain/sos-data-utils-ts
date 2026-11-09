// Flow contract: external call push carries only an opaque update reference and state; browser subscriptions have bounded HTTPS endpoints and exact P-256/auth keys, never card or recipient authority.
import assert from 'node:assert/strict'
import test from 'node:test'
import {normalizePortalPushSubscription,normalizePortalPushNotice} from '../dist/portal-push.js'
import {REPOSITORY_SAFE_EXAMPLES as safe} from '../dist/repository-privacy.js'
const subscription={endpoint:`${safe.httpsBaseUrl}/push/subscription`,expirationTime:null,keys:{p256dh:Buffer.concat([Buffer.from([4]),Buffer.alloc(64,1)]).toString('base64url'),auth:Buffer.alloc(16,2).toString('base64url')}}
test('normalizes a bounded browser subscription independently of any subject or actor',()=>{
  assert.deepEqual(normalizePortalPushSubscription({...subscription,actorIdentifier:safe.didWeb}),subscription)
  for(const value of [{...subscription,endpoint:'http://localhost/push'},{...subscription,endpoint:`${safe.httpsBaseUrl}/push#fragment`},{...subscription,keys:{...subscription.keys,auth:'short'}},{...subscription,expirationTime:0}])assert.throws(()=>normalizePortalPushSubscription(value),/portal_push_subscription_invalid/)
})
test('strips protected context and accepts only opaque content-free call notices',()=>{
  const notice={version:1,tag:safe.resourceUuid,state:'ringing',occurredAt:new Date().toISOString()}
  assert.deepEqual(normalizePortalPushNotice({...notice,subject:safe.didWeb,body:'private context',url:safe.httpsBaseUrl}),notice)
  assert.throws(()=>normalizePortalPushNotice({...notice,tag:safe.didWeb}),/portal_push_notice_invalid/)
  assert.throws(()=>normalizePortalPushNotice({...notice,state:'unknown'}),/portal_push_notice_invalid/)
})
