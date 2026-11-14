import {ClaimConsent as C, RelatedPersonClaim as R} from 'fhir-data-utils-ts'
import type {OperationOutcome} from 'fhir-data-utils-ts'

export type BundleRequest={method:'GET'|'POST'|'PUT'|'PATCH'|'DELETE';url:string;ifMatch?:string}
export type BundleResponse={status:string;[key:string]:any}
export type BundleEntry={
  id?:string;fullUrl?:string;type:string
  resource?:{resourceType?:string;id?:string;meta?:{claims?:Record<string,any>;[key:string]:any};[key:string]:any}
  meta?:{claims?:Record<string,any>;[key:string]:any}
  request?:BundleRequest
  response?:BundleResponse
}
/** Required operation view of an SOS batch entry, not native FHIR JSON. */
export type BundleEntryRequest=BundleEntry&{request:BundleRequest}
/** Terminal per-entry result; HTTP success does not imply all entries succeeded. */
export type BundleEntryResponse=BundleEntry&{response:BundleResponse}
/** Preserve the original entry metadata so callers can correlate its failure. */
export type ErrorEntry=Pick<BundleEntry,'id'|'type'|'meta'>&{response:{status:string;outcome:OperationOutcome}}
export interface BundleJsonApi<T=BundleEntry>{
  resourceType:'Bundle';type:string;data:T[];id?:string;total?:number
  meta?:{claims?:Record<string,any>;[key:string]:any}
}
export const BundleOperations=Object.freeze({create:'create',update:'update',delete:'delete',search:'search',purge:'purge'} as const)
export const BundleTypes=Object.freeze({batch:'batch',document:'document',collection:'collection',transaction:'transaction'} as const)
export const BundleEditableResourceTypes=Object.freeze({consent:'Consent',relatedPerson:'RelatedPerson'} as const)
const list=(values:readonly string[])=>[...new Set(values.map(value=>String(value).trim()).filter(Boolean))].join(',')

/** One claims-first staged entry; it never submits, authorizes or selects a provider. */
export class BundleEntryEditor {
  constructor(private readonly entry:BundleEntry){}
  private get resource(){return this.entry.resource!}
  private get claims(){return this.resource.meta!.claims!}
  private key(consent:string,related:string){return this.resource.resourceType==='Consent'?consent:related}
  setClaim(key:string,value:unknown):this {if(value===undefined)delete this.claims[key];else Object.defineProperty(this.claims,key,{value:structuredClone(value),enumerable:true,writable:true,configurable:true});return this}
  removeClaim(key:string):this{delete this.claims[key];return this}
  getClaim(key:string):unknown{return structuredClone(this.claims[key])}
  setResourceId(id?:string|null):this{if(id)this.resource.id=id.trim();else delete this.resource.id;return this}
  getResourceId():string|undefined{return this.resource.id}
  setFullUrl(value?:string|null):this{if(value)this.entry.fullUrl=value.trim();else delete this.entry.fullUrl;return this}
  setIdentifier(value:string):this{return this.setClaim(this.key(C.identifier,R.Identifier),value).setResourceId(value).setFullUrl(value)}
  setSubject(value:string):this{return this.setClaim(this.key(C.subject,R.Patient),value)}
  setStatus(value:string):this{return this.setClaim(C.status,value)}
  setDecision(value:string):this{return this.setClaim(C.decision,value)}
  setActorIdentifierList(values:readonly string[]):this{return this.setClaim(this.key(C.actorIdentifier,R.ActorIdentifier),list(values))}
  setActorRoleList(values:readonly string[]):this{return this.setClaim(C.actorRole,list(values))}
  setPurposeList(values:readonly string[]):this{return this.setClaim(C.purpose,list(values))}
  setSectionList(values:readonly string[]):this{return this.setClaim(C.action,list(values))}
  setResourceTypeList(values:readonly string[]):this{return this.setClaim(C.resourceType,list(values))}
  setDate(value:string):this{return this.setClaim(C.date,value)}
  setName(value:string):this{return this.setClaim(R.Name,value)}
  setRelationship(value:string):this{return this.setClaim(R.Relationship,value)}
  setRelatedEntityType(value:string):this{return this.setClaim(R.RelatedEntityType,value)}
  setActive(value:boolean):this{return this.setClaim(R.Active,value)}
  create():this{this.entry.request={method:'POST',url:this.resource.resourceType!};return this}
  update():this{
    if(!this.resource.id)throw new TypeError('bundle_update_id_required')
    this.entry.request={method:'PUT',url:`${this.resource.resourceType}/${this.resource.id}`}
    return this
  }
  ifMatch(version:string):this{
    if(!this.entry.request||!version.trim())throw new TypeError('bundle_version_required')
    this.entry.request.ifMatch=/^(?:W\/)?".*"$/u.test(version)?version:`W/"${version}"`
    return this
  }
}

/** SOS batch authoring contract, distinct from native FHIR projection and transport. */
export class BundleEditor {
  private entries:BundleEntry[]=[]
  private operation?:string
  private type:string=BundleTypes.batch
  private resourceType?:string
  setBundleOperation(value:string):this{this.operation=value;return this}
  setBundleType(value:string):this{this.type=value;return this}
  setAllowedResourceType(value:string):this{this.resourceType=value;return this}
  newEntryAs(resourceType:string,id:string):BundleEntryEditor{return this.newEntry(id,resourceType)}
  newEntry(id:string,resourceType=this.resourceType):BundleEntryEditor{
    if(!this.operation||!this.resourceType)throw new TypeError('bundle_scope_required')
    if(resourceType!==this.resourceType)throw new TypeError('bundle_resource_type_mismatch')
    if(!id.trim())throw new TypeError('bundle_entry_id_required')
    const entry:BundleEntry={type:resourceType,fullUrl:id,resource:{resourceType,id,meta:{claims:{}}}}
    this.entries.push(entry)
    return new BundleEntryEditor(entry)
  }
  build():{resourceType:'Bundle';type:string;entry:BundleEntry[]}{return {resourceType:'Bundle',type:this.type,entry:structuredClone(this.entries)}}
  buildJsonApi():BundleJsonApi<BundleEntry>{return {resourceType:'Bundle',type:this.type,data:structuredClone(this.entries)}}
}

/** Reads both operational data arrays and explicit native Bundle entry arrays. */
export class BundleReader {
  private readonly entries:BundleEntry[]
  private readonly type?:string
  constructor(input:Record<string,unknown>){
    if(input.resourceType!=='Bundle')throw new TypeError('fhir_bundle_required')
    this.type=typeof input.type==='string'?input.type:undefined
    const entries=input.data??input.entry??[]
    if(!Array.isArray(entries))throw new TypeError('bundle_entries_required')
    this.entries=structuredClone(entries) as BundleEntry[]
  }
  getEntries():BundleEntry[]{return structuredClone(this.entries)}
  getBundleType():string|undefined{return this.type}
  getEntryClaimsByArrayIndex(index:number):Record<string,any>{
    const entry=this.entries[index]
    if(!entry)throw new RangeError('bundle_entry_index_invalid')
    return structuredClone(entry.resource?.meta?.claims??entry.meta?.claims??{})
  }
}
