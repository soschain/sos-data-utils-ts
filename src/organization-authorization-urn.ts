import {encodeBase58btc} from 'antifraud-data-utils-ts/encoding'

export type OrganizationAuthorizationUrnCdsInput=Readonly<{jurisdiction:string;version?:string;identifierType:string;identifierValue:string}>
/** Stable legal identity independent of host routing. */
export function buildOrganizationAuthorizationUrnCds(input:OrganizationAuthorizationUrnCdsInput):string{
  const jurisdiction=String(input.jurisdiction??'').trim().toLowerCase()
  const version=String(input.version??'v1').trim().toLowerCase()
  const type=String(input.identifierType??'').trim().toLowerCase()
  const value=String(input.identifierValue??'').trim()
  if(!/^[a-z]{2}(?:-[a-z0-9]{2,3})?$/u.test(jurisdiction)||!/^v[1-9][0-9]*$/u.test(version)||! type||!/^[a-z][a-z0-9-]*$/u.test(type)||!value||value.includes(':'))throw new TypeError('organization_authorization_identity_invalid')
  return `urn:cds-${jurisdiction}:${version}:organization:${type}:${value}`
}
/** Encodes all 16 UUID bytes, never the printable UUID or a contact hash. */
export function buildOrganizationEmployeeAuthorizationUrnCds(input:Readonly<{organizationUrn:string;employeeUuid:string;roleCode:string}>):string{
  const organization=String(input.organizationUrn??'').trim()
  const uuid=String(input.employeeUuid??'').trim().replace(/^urn:uuid:/iu,'')
  const role=String(input.roleCode??'').trim()
  if(!/^urn:cds-[a-z]{2}(?:-[a-z0-9]{2,3})?:v[1-9][0-9]*:organization:[a-z][a-z0-9-]*:[^:]+$/u.test(organization)||!/^\d+$/u.test(role)||!/^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/iu.test(uuid))throw new TypeError('employee_authorization_identity_invalid')
  const hex=uuid.replaceAll('-','')
  const bytes=Uint8Array.from(hex.match(/../gu)!,value=>Number.parseInt(value,16))
  return `${organization}:member:${encodeBase58btc(bytes)}:${role}`
}

// Legacy ledger grammar reviewed from source revision
// 74479fa3fc8d8cbf92a9ff13dd626ccf8d6f2b1e; Apache-2.0 Antifraud Services Inc.
export type OrganizationAuthorizationUrnInput=Readonly<{identifierType:string;identifierValue:string}>
/** Readable historical ledger identity. New identities use the jurisdiction-qualified CDS grammar. */
export function buildOrganizationAuthorizationUrn(input:OrganizationAuthorizationUrnInput):string{
 const identifierType=String(input.identifierType||'').trim().toLowerCase()
 const identifierValue=String(input.identifierValue||'').trim()
 if(!identifierType||!identifierValue)throw new Error('Organization authorization URN requires identifierType and identifierValue.')
 return `urn:org:${identifierType}:${identifierValue}`
}
/** Normalize the historical TYPE|VALUE or urn:org form without rewriting official-value bytes. */
export function normalizeOrganizationAuthorizationUrn(input:string):string{
 const normalized=String(input||'').trim()
 if(!normalized)throw new Error('Organization authorization identifier cannot be empty.')
 if(normalized.toLowerCase().startsWith('urn:org:')){
  const parts=normalized.split(':')
  return buildOrganizationAuthorizationUrn({identifierType:String(parts[2]||'').trim(),identifierValue:parts.slice(3).join(':').trim()})
 }
 const legacyMatch=normalized.match(/^([^|:]+)\|(.+)$/)
 if(legacyMatch)return buildOrganizationAuthorizationUrn({identifierType:legacyMatch[1]!,identifierValue:legacyMatch[2]!})
 throw new Error('Unsupported organization authorization identifier format.')
}
