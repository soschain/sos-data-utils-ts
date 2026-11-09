/** One browser installation's subscription, obtained through the browser Push API. */
export type PortalPushSubscription=Readonly<{
  endpoint:string
  expirationTime:number|null
  keys:Readonly<{p256dh:string;auth:string}>
}>

/** No subject, caller, organization, email, phone, token, URL or media grant. */
export type PortalPushNotice=Readonly<{
  version:1
  tag:string
  state:'ringing'|'updated'
  occurredAt:string
}>

export function normalizePortalPushSubscription(input:unknown):PortalPushSubscription{
  try{
    const value=input as PortalPushSubscription
    const url=new URL(value.endpoint)
    if(typeof value.endpoint!=='string'||value.endpoint.length>2048||url.protocol!=='https:'||url.username||url.password||url.hash
      ||(value.expirationTime!==null&&(!Number.isFinite(value.expirationTime)||value.expirationTime<=0))
      ||!key(value.keys?.p256dh,65,4)||!key(value.keys?.auth,16))throw new Error()
    return Object.freeze({endpoint:url.href,expirationTime:value.expirationTime,keys:Object.freeze({p256dh:value.keys.p256dh,auth:value.keys.auth})})
  }catch{throw new TypeError('portal_push_subscription_invalid')}
}

export function normalizePortalPushNotice(input:unknown):PortalPushNotice{
  const value=input as PortalPushNotice
  if(!value||value.version!==1||typeof value.tag!=='string'||!/^[a-zA-Z0-9_-]{16,128}$/u.test(value.tag)
    ||!['ringing','updated'].includes(value.state)||typeof value.occurredAt!=='string'||!Number.isFinite(Date.parse(value.occurredAt)))throw new TypeError('portal_push_notice_invalid')
  return Object.freeze({version:1,tag:value.tag,state:value.state,occurredAt:new Date(value.occurredAt).toISOString()})
}

function key(value:unknown,length:number,firstByte?:number){
  if(typeof value!=='string'||!/^[a-zA-Z0-9_-]+$/u.test(value)||value.length!==Math.ceil(length*4/3))return false
  const bytes=atob(value.replaceAll('-','+').replaceAll('_','/'))
  return bytes.length===length&&(firstByte===undefined||bytes.charCodeAt(0)===firstByte)
    &&btoa(bytes).replaceAll('+','-').replaceAll('/','_').replaceAll('=','')===value
}
