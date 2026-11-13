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
