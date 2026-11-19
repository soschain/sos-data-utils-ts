// Selective wire compatibility with the established licence/employee helpers; no transport or authority evaluation.
import { SchemaOrgIndividualProductClaim as Product, SchemaOrgOfferClaim as Offer, SchemaOrgPersonClaim as Person } from 'antifraud-data-utils-ts/schema-org-claims'
import { DeviceAppTypes, DeviceUserClasses, type DeviceAppType, type DeviceUserClass, type LicenseStatus } from './device-license-contract.js'
import {isIsco08CodingSystem} from 'antifraud-data-utils-ts'
import {HL7_CODING_SYSTEM_V3_ROLE_CODE} from 'fhir-data-utils-ts'

/** Commercial request metadata, independent from consent and runtime device admission. */
export const LicenseClaimContext = Object.freeze({SchemaOrg:'org.schema'} as const)
export const LicenseCategories = Object.freeze({Professional:'professional',Individual:'individual'} as const)
export const LicenseCommercialSearchOperation = Object.freeze({Offer:'Offer:Search',Order:'Order:Search'} as const)
export const LicenseEntryTypes = Object.freeze({Issue:'License-issue-request-v1.0',Purchase:'License-purchase-request-v1.0',Search:'License-search-request-v1.0'} as const)
export const LicenseEntryOperations = Object.freeze({Issue:'IndividualProduct:Issue',Purchase:'IndividualProduct:Purchase',Search:'IndividualProduct:Search'} as const)
/** Seat-pool routing only; neither code membership nor consent/employment authority. */
export const LicenseRoleKinds=Object.freeze({IndividualMember:'individual-member',Professional:'professional',Unsupported:'unsupported'} as const)
export type LicenseRoleKind=typeof LicenseRoleKinds[keyof typeof LicenseRoleKinds]
export interface LicenseIssueInput {
 role:string; email?:string; telephone?:string; userClass?:DeviceUserClass; type?:DeviceAppType;
 ownerOrganizationId?:string; subjectDid?:string; subjectId?:string; relatedPersonId?:string; invitationId?:string;
 additionalClaims?:LicenseClaims
}
export type LicenseClaims = Record<string,unknown>
export interface LicensePurchaseInput {
 quantity:number; userClass?:DeviceUserClass; type?:DeviceAppType; serialNumbers?:readonly string[];
 price?:number; priceCurrency?:string; ownerOrganizationId?:string; additionalClaims?:LicenseClaims
}
export interface LicenseSearchInput {
 serialNumbers?:readonly string[]; userClass?:DeviceUserClass; type?:DeviceAppType; email?:string; role?:string;
 status?:LicenseStatus; subjectId?:string; ownerOrganizationId?:string; additionalClaims?:LicenseClaims
}
const text=(value:unknown)=>String(value||'').trim()
/** Compatibility aliases classify the namespace even when the code is not in a curated catalog. */
export function classifyLicenseRole(role:unknown):LicenseRoleKind {
 const system=text(role).toLowerCase().split('|',1)[0]||''
 if(isIsco08CodingSystem(system)||system==='isco'||system.endsWith('/isco-08'))return LicenseRoleKinds.Professional
 if(system===HL7_CODING_SYSTEM_V3_ROLE_CODE.toLowerCase()||system==='v3-rolecode'||system==='org.hl7.v3.rolecode'||system.endsWith('/v3-rolecode'))return LicenseRoleKinds.IndividualMember
 return LicenseRoleKinds.Unsupported
}
/** Recipient claims and operational bindings remain separate; the runtime must authorize every command. */
export function buildLicenseIssueClaims(input:LicenseIssueInput):LicenseClaims {
 const email=text(input.email),telephone=text(input.telephone)
 if(!email&&!telephone)throw new Error('License issue requires an email or telephone recipient.')
 if(telephone&&!/^\+[1-9]\d{6,14}$/.test(telephone))throw new Error('License issue telephone must use an international ITU format beginning with +.')
 const userClass=input.userClass||DeviceUserClasses.Employee
 if(userClass===DeviceUserClasses.Individual){
  const kind=classifyLicenseRole(input.role)
  if(kind===LicenseRoleKinds.Professional)throw new Error('ISCO professional roles do not consume individual-member licenses.')
  if(kind!==LicenseRoleKinds.IndividualMember)throw new Error('Individual-member licenses require a FHIR v3-RoleCode role.')
 }
 return {'@context':LicenseClaimContext.SchemaOrg,...input.additionalClaims,
  ...(email?{[Person.Email]:email}:{}),...(telephone?{[Person.Telephone]:telephone}:{}),
  [Person.OccupationIdentifierValue]:input.role.trim(),[Product.Category]:mapLicenseCategoryFromUserClass(userClass),[Product.AdditionalType]:input.type||DeviceAppTypes.Mobile}
}
export function buildLicenseIssueEntry(input:LicenseIssueInput){
 return {type:LicenseEntryTypes.Issue,request:{method:'POST' as const},meta:{
  ...(text(input.ownerOrganizationId)?{ownerOrganizationId:text(input.ownerOrganizationId)}:{}),
  ...(text(input.subjectDid)?{subjectDid:text(input.subjectDid)}:{}),
  ...(text(input.subjectId)?{subjectId:text(input.subjectId)}:{}),
  ...(text(input.relatedPersonId)?{relatedPersonId:text(input.relatedPersonId)}:{}),
  ...(text(input.invitationId)?{invitationId:text(input.invitationId)}:{}),
 },resource:{meta:{claims:{...buildLicenseIssueClaims(input),'@type':LicenseEntryOperations.Issue}}}}
}
export function mapLicenseCategoryFromUserClass(value:DeviceUserClass=DeviceUserClasses.Employee){return value===DeviceUserClasses.Individual?LicenseCategories.Individual:LicenseCategories.Professional}
export function serializeLicenseSerialNumbers(values?:readonly string[]):string|undefined{return values?.map(text).filter(Boolean).join(',')||undefined}
export function buildLicensePurchaseClaims(input:LicensePurchaseInput):LicenseClaims {
 const claims:LicenseClaims={'@context':LicenseClaimContext.SchemaOrg,...input.additionalClaims,
  [Product.Category]:mapLicenseCategoryFromUserClass(input.userClass),[Product.AdditionalType]:input.type||DeviceAppTypes.Mobile,[Offer.EligibleQuantityValue]:input.quantity}
 const serials=serializeLicenseSerialNumbers(input.serialNumbers)
 if(serials)claims[Offer.SerialNumber]=serials
 if(typeof input.price==='number'&&Number.isFinite(input.price)&&input.price>=0)claims[Offer.Price]=input.price
 if(typeof input.priceCurrency==='string'&&input.priceCurrency.trim())claims[Offer.PriceCurrency]=input.priceCurrency.trim().toUpperCase()
 return claims
}
export function buildLicensePurchaseEntry(input:LicensePurchaseInput){return {type:LicenseEntryTypes.Purchase,request:{method:'POST' as const},meta:{...(text(input.ownerOrganizationId)?{ownerOrganizationId:text(input.ownerOrganizationId)}:{})},resource:{meta:{claims:{...buildLicensePurchaseClaims(input),'@type':LicenseEntryOperations.Purchase}}}}}
export function buildLicenseSearchEntry(input:LicenseSearchInput){
 const claims:LicenseClaims={'@context':LicenseClaimContext.SchemaOrg,...input.additionalClaims}
 if(input.serialNumbers?.length)claims[Offer.SerialNumber]=serializeLicenseSerialNumbers(input.serialNumbers)
 if(input.userClass)claims[Product.Category]=mapLicenseCategoryFromUserClass(input.userClass)
 if(input.type)claims[Product.AdditionalType]=input.type
 if(text(input.email))claims[Person.Email]=text(input.email)
 if(text(input.role))claims[Person.OccupationIdentifierValue]=text(input.role)
 return {type:LicenseEntryTypes.Search,request:{method:'POST' as const},meta:{...(input.status?{status:input.status}:{}),...(text(input.subjectId)?{subjectId:text(input.subjectId)}:{}),...(text(input.ownerOrganizationId)?{ownerOrganizationId:text(input.ownerOrganizationId)}:{})},resource:{meta:{claims:{...claims,'@type':LicenseEntryOperations.Search}}}}
}
