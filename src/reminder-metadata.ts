/** Explicit reminder policy vocabulary. Creating or decoding it does not establish caller authority. */
export const ReminderActorKinds = Object.freeze({Controller:'controller',Caregiver:'caregiver',Professional:'professional',RelatedPerson:'related-person',Assistant:'assistant'} as const)
export const ReminderChannels = Object.freeze({Phone:'phone',Email:'email',WhatsApp:'whatsapp',Push:'push',Alexa:'alexa'} as const)
export const ReminderEntityKinds = Object.freeze({Item:'reminder-item',Plan:'reminder-plan',DispatchWindow:'dispatch-window',DispatchAttempt:'dispatch-attempt',Outcome:'reminder-outcome'} as const)
export const ReminderActions = Object.freeze({Create:'create',Update:'update',Read:'read',Execute:'execute'} as const)
export const ReminderPermissionMetadataPrefix = 'uhc-reminder-permission' as const
export type ReminderActorKind = typeof ReminderActorKinds[keyof typeof ReminderActorKinds]
export type ReminderChannel = typeof ReminderChannels[keyof typeof ReminderChannels]
export type ReminderEntityKind = typeof ReminderEntityKinds[keyof typeof ReminderEntityKinds]
export type ReminderAction = typeof ReminderActions[keyof typeof ReminderActions]
export type ReminderPermissionRule = Readonly<{actorKind:ReminderActorKind;actorId?:string;decision:'allow'|'deny';actions:readonly ReminderAction[];entities:readonly ReminderEntityKind[];channels?:readonly ReminderChannel[];purpose?:string}>
export type ReminderPermissionBundle = Readonly<{subject:string;purpose?:string;requiredSections:readonly string[];requiredResourceTypes:readonly string[];groupedBy:readonly string[];note?:string;rules:readonly ReminderPermissionRule[]}>
export type ReminderPermissionBundleInput = Readonly<{subject:string;purpose?:string;requiredSections?:readonly string[];requiredResourceTypes?:readonly string[];groupedBy?:readonly string[];note?:string;rules?:readonly ReminderPermissionRule[]}>
const prefix=ReminderPermissionMetadataPrefix
const optional=(value:unknown):string|undefined=>{if(value===undefined)return undefined;if(typeof value!=='string')throw new TypeError('reminder_metadata_text_invalid');return value.trim()||undefined}
const required=(value:unknown):string=>{const result=optional(value);if(!result)throw new TypeError('reminder_metadata_text_required');return result}
const list=(values:unknown):string[]=>{if(values===undefined)return [];if(!Array.isArray(values)||!values.every(value=>typeof value==='string'))throw new TypeError('reminder_metadata_list_invalid');return [...new Set(values.map(value=>value.trim()).filter(Boolean))]}
const allowed=(value:string,values:Readonly<Record<string,string>>):void=>{if(!Object.values(values).includes(value))throw new TypeError('reminder_metadata_enum_invalid')}
function rule(input:ReminderPermissionRule):ReminderPermissionRule{
 if(!input||typeof input!=='object'||!['allow','deny'].includes(input.decision))throw new TypeError('reminder_metadata_decision_invalid')
 allowed(input.actorKind,ReminderActorKinds)
 const actions=list(input.actions),entities=list(input.entities),channels=list(input.channels)
 if(!actions.length||!entities.length)throw new TypeError('reminder_metadata_rule_scope_required')
 for(const value of actions)allowed(value,ReminderActions)
 for(const value of entities)allowed(value,ReminderEntityKinds)
 for(const value of channels)allowed(value,ReminderChannels)
 return Object.freeze({actorKind:input.actorKind,actorId:optional(input.actorId),decision:input.decision,
  actions:Object.freeze(actions) as readonly ReminderAction[],entities:Object.freeze(entities) as readonly ReminderEntityKind[],
  channels:Object.freeze(channels) as readonly ReminderChannel[],purpose:optional(input.purpose)})
}
/** Copies and validates descriptors; no rule is inferred when the list is empty. */
export function createReminderPermissionBundle(input:ReminderPermissionBundleInput):ReminderPermissionBundle{
 if(!input||typeof input!=='object'||(input.rules!==undefined&&!Array.isArray(input.rules)))throw new TypeError('reminder_metadata_bundle_invalid')
 return Object.freeze({subject:required(input.subject),purpose:optional(input.purpose),requiredSections:Object.freeze(list(input.requiredSections)),
  requiredResourceTypes:Object.freeze(list(input.requiredResourceTypes)),groupedBy:Object.freeze(list(input.groupedBy)),note:optional(input.note),rules:Object.freeze((input.rules??[]).map(rule))})
}
/** Retains the established persisted metadata field names during owner migration. */
export function encodeReminderPermissionBundle(input:ReminderPermissionBundleInput):Record<string,string>{
 const bundle=createReminderPermissionBundle(input)
 const claims:Record<string,string>={[`${prefix}-subject`]:bundle.subject,[`${prefix}-required-sections`]:bundle.requiredSections.join(','),[`${prefix}-required-resource-types`]:bundle.requiredResourceTypes.join(','),[`${prefix}-rules-count`]:String(bundle.rules.length)}
 if(bundle.purpose)claims[`${prefix}-purpose`]=bundle.purpose
 if(bundle.groupedBy.length)claims[`${prefix}-grouped-by`]=bundle.groupedBy.join(',')
 if(bundle.note)claims[`${prefix}-note`]=bundle.note
 bundle.rules.forEach((entry,index)=>{const base=`${prefix}-rule-${index}`;claims[`${base}-actor-kind`]=entry.actorKind;claims[`${base}-decision`]=entry.decision;claims[`${base}-actions`]=entry.actions.join(',');claims[`${base}-entities`]=entry.entities.join(',');if(entry.actorId)claims[`${base}-actor-id`]=entry.actorId;if(entry.channels?.length)claims[`${base}-channels`]=entry.channels.join(',');if(entry.purpose)claims[`${base}-purpose`]=entry.purpose})
 return claims
}
/** Missing or malformed metadata is not converted into an allow rule. */
export function decodeReminderPermissionBundle(claims:Record<string,unknown>|undefined):ReminderPermissionBundle|undefined{
 if(!claims||typeof claims!=='object'||Array.isArray(claims))return undefined
 const read=(key:string)=>Object.hasOwn(claims,key)?claims[key]:undefined
 const csv=(key:string)=>optional(read(key))?.split(',').map(value=>value.trim()).filter(Boolean)??[]
 try{
  const subject=required(read(`${prefix}-subject`)),count=read(`${prefix}-rules-count`)
  if(typeof count!=='string'||!/^(0|[1-9]\d*)$/u.test(count)||!Number.isSafeInteger(Number(count))||Number(count)>Object.keys(claims).length)return undefined
  const rules:ReminderPermissionRule[]=[]
  for(let index=0;index<Number(count);index++){
   const base=`${prefix}-rule-${index}`
   rules.push({actorKind:required(read(`${base}-actor-kind`)) as ReminderActorKind,actorId:optional(read(`${base}-actor-id`)),decision:required(read(`${base}-decision`)) as 'allow'|'deny',actions:csv(`${base}-actions`) as ReminderAction[],entities:csv(`${base}-entities`) as ReminderEntityKind[],channels:csv(`${base}-channels`) as ReminderChannel[],purpose:optional(read(`${base}-purpose`))})
  }
  return createReminderPermissionBundle({subject,purpose:optional(read(`${prefix}-purpose`)),requiredSections:csv(`${prefix}-required-sections`),requiredResourceTypes:csv(`${prefix}-required-resource-types`),groupedBy:csv(`${prefix}-grouped-by`),note:optional(read(`${prefix}-note`)),rules})
 }catch{return undefined}
}
