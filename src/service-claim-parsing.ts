import {isKnownServiceCapability,parseServiceCapabilityTokens} from './service-capabilities.js'

/** Read service categories without interpreting them as access authority. */
export function parseServiceCategories(value:unknown):string[]{
  if(Array.isArray(value))return [...new Set(value.flatMap(parseServiceCategories))]
  return typeof value==='string'?[...new Set(value.split(',').map(item=>item.trim()).filter(Boolean))]:[]
}

/** Normalize the serviceType field, preserving provider-defined extension tokens. */
export function parseServiceTypeCsv(value:unknown):string[]{
  return Array.isArray(value)?[...new Set(value.flatMap(parseServiceTypeCsv))]:parseServiceCapabilityTokens(value)
}

/** additionalType contributes only known service capabilities, not organization roles. */
export function parseServiceTypeClaims(serviceType:unknown,additionalType?:unknown):string[]{
  const additional=(value:unknown):string[]=>Array.isArray(value)
    ?value.flatMap(additional):parseServiceCapabilityTokens(value).filter(isKnownServiceCapability)
  return [...new Set([...parseServiceTypeCsv(serviceType),...additional(additionalType)])]
}
