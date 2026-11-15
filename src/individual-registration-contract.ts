import {encodeMultibaseSha3} from 'antifraud-data-utils-ts/encoding'
import {normalizeUuid} from 'antifraud-data-utils-ts/organization-identity'
import {GatewayResponseEntryTypes} from './gateway-response-contract.js'

/** Confirmed subject organization; a public card alias is a separate identity. */
export type IndividualOrganizationBootstrapIdentity=Readonly<{
 organizationId:string;canonicalSubjectIdentifier:string;publicCardAlias:string;providerDid:string
}>
/** Registration Offer metadata, not recipient acceptance or controller authority. */
export type IndividualOrganizationBootstrapReceipt=Readonly<{
 identity:IndividualOrganizationBootstrapIdentity;offerId:string
}>
/** Network provider projection; pending intent does not establish delivery, acceptance, a card or controller authority. */
export type NetworkSubjectRegistrationResult=Readonly<{
 mode:'network';operationId:string;registration:IndividualOrganizationBootstrapReceipt
 controllerInvitation:Readonly<{status:'pending'}>
}>

function record(value:unknown):Record<string,unknown>{
 if(value===null||typeof value!=='object'||Array.isArray(value))throw new TypeError('individual_registration_receipt_invalid')
 const output:Record<string,unknown>=Object.create(null)
 for(const [key,descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))){
  if(!Object.hasOwn(descriptor,'value'))throw new TypeError('individual_registration_receipt_invalid')
  Object.defineProperty(output,key,{value:descriptor.value,enumerable:true})
 }
 return output
}
function text(value:unknown,max=2048):string{
 if(typeof value!=='string'||!value.trim()||value.length>max)throw new TypeError('individual_registration_receipt_binding_invalid')
 return value.trim()
}
function uuid(value:unknown):string{
 const normalized=normalizeUuid(text(value,64))
 if(!normalized)throw new TypeError('individual_registration_receipt_binding_invalid')
 return `${normalized.slice(0,8)}-${normalized.slice(8,12)}-${normalized.slice(12,16)}-${normalized.slice(16,20)}-${normalized.slice(20)}`
}
function claim(values:Record<string,unknown>,key:string):unknown{
 const contextual=key.replace(/^org\.schema\./u,'')
 const full=values[key],short=values[contextual]
 if(full!==undefined&&short!==undefined&&full!==short)throw new TypeError('individual_registration_receipt_binding_invalid')
 if(full!==undefined)return full
 return values['@context']==='org.schema'?short:undefined
}
/** Pure identity projection shared by provider-confirmed registration and directory rows; does not verify issuer authority. */
export function readIndividualOrganizationIdentity(input:Readonly<{organizationId:unknown;providerDid:unknown;canonicalSubjectIdentifier:unknown;publicCardAlias:unknown}>):IndividualOrganizationBootstrapIdentity{
 const organizationId=uuid(input.organizationId),providerDid=text(input.providerDid)
 if(!providerDid.startsWith('did:web:'))throw new TypeError('individual_registration_receipt_binding_invalid')
 const canonicalSubjectIdentifier=text(input.canonicalSubjectIdentifier)
 const bytes=Uint8Array.from(organizationId.replaceAll('-','').match(/../gu)!,pair=>Number.parseInt(pair,16))
 if(canonicalSubjectIdentifier!==`${providerDid}:individual:multibase:${encodeMultibaseSha3(bytes,384)}`)throw new TypeError('individual_registration_receipt_canonical_binding_invalid')
 const publicCardAlias=text(input.publicCardAlias)
 if(!publicCardAlias.startsWith('did:web:')||/[\s,]/u.test(publicCardAlias))throw new TypeError('individual_registration_receipt_binding_invalid')
 return {organizationId,canonicalSubjectIdentifier,publicCardAlias,providerDid}
}
function exact(value:unknown,allowed:readonly string[]):Record<string,unknown>{
 const snapshot=record(value),prototype=Object.getPrototypeOf(value)
 if((prototype!==null&&prototype!==Object.prototype)||Reflect.ownKeys(value as object).some(key=>typeof key!=='string'||!allowed.includes(key)))throw new TypeError('network_subject_registration_result_invalid')
 return snapshot
}

/** Validates a projected provider result directly; it does not synthesize a GW response or verify authority. */
export function assertNetworkSubjectRegistrationResult(
 value:unknown,
 binding?:Readonly<{expectedOperationId?:string;expectedProviderDid?:string}>,
):asserts value is NetworkSubjectRegistrationResult{
 const result=exact(value,['mode','operationId','registration','controllerInvitation'])
 if(result.mode!=='network'||typeof result.operationId!=='string'||uuid(result.operationId)!==result.operationId)throw new TypeError('network_subject_registration_result_invalid')
 const registration=exact(result.registration,['identity','offerId']),rawIdentity=exact(registration.identity,['organizationId','canonicalSubjectIdentifier','publicCardAlias','providerDid'])
 const identity=readIndividualOrganizationIdentity({organizationId:rawIdentity.organizationId,providerDid:rawIdentity.providerDid,canonicalSubjectIdentifier:rawIdentity.canonicalSubjectIdentifier,publicCardAlias:rawIdentity.publicCardAlias})
 const didWeb=/^did:web:[^:\s/?#,]+(?::[^:\s/?#,]+)*$/u
 if(!didWeb.test(identity.providerDid)||!didWeb.test(identity.publicCardAlias))throw new TypeError('network_subject_registration_result_invalid')
 for(const key of Object.keys(identity) as (keyof IndividualOrganizationBootstrapIdentity)[])if(rawIdentity[key]!==identity[key])throw new TypeError('network_subject_registration_result_invalid')
 if(registration.offerId!==text(registration.offerId,512)||exact(result.controllerInvitation,['status']).status!=='pending')throw new TypeError('network_subject_registration_result_invalid')
 if(binding!==undefined){
  const expected=exact(binding,['expectedOperationId','expectedProviderDid'])
  if((expected.expectedOperationId!==undefined&&uuid(expected.expectedOperationId)!==result.operationId)||(expected.expectedProviderDid!==undefined&&text(expected.expectedProviderDid)!==identity.providerDid))throw new TypeError('network_subject_registration_result_binding_invalid')
 }
}

/**
 * Reads the current GW Family-registration-offer Organization profile.
 * Organization.did is the canonical hosted subject DID; sameAs remains its
 * public card alias. The existing profile hashes the canonical sixteen UUID
 * bytes with the shared AF SHA3-384 multihash primitive. This checks response
 * binding only; it neither verifies an issuer proof nor grants authorization.
 */
export function readIndividualOrganizationBootstrapReceipt(
 response:unknown,
 binding:Readonly<{requestedOrganizationId:string;expectedProviderDid:string}>,
):IndividualOrganizationBootstrapReceipt{
 const expected=record(binding),organizationId=uuid(expected.requestedOrganizationId),providerDid=text(expected.expectedProviderDid)
 if(!providerDid.startsWith('did:web:'))throw new TypeError('individual_registration_receipt_binding_invalid')
 const root=record(response),body=root.body===undefined?root:record(root.body)
 if(body.resourceType!=='Bundle'||!Array.isArray(body.data))throw new TypeError('individual_registration_receipt_invalid')
 const candidates=body.data.map(record).filter(row=>row.type===GatewayResponseEntryTypes.FamilyRegistrationOffer)
 if(candidates.length!==1)throw new TypeError('individual_registration_receipt_invalid')
 const row=candidates[0]!,status=record(row.response).status,resource=record(row.resource)
 if((status!=='200'&&status!=='201')||resource.resourceType!=='Organization'||uuid(resource.id)!==organizationId)throw new TypeError('individual_registration_receipt_binding_invalid')
 const values=record(record(resource.meta).claims)
 if(text(claim(values,'org.schema.Offer.offeredBy'))!==providerDid)throw new TypeError('individual_registration_receipt_binding_invalid')
 const identity=readIndividualOrganizationIdentity({organizationId,providerDid,canonicalSubjectIdentifier:claim(values,'org.schema.Organization.did'),publicCardAlias:claim(values,'org.schema.Organization.sameAs')})
 return {identity,offerId:text(claim(values,'org.schema.Offer.identifier'),512)}
}
