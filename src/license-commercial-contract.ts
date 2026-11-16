// Selective wire compatibility with the established licence/employee helpers; no transport or authority evaluation.
import { SchemaOrgIndividualProductClaim as Product, SchemaOrgOfferClaim as Offer, SchemaOrgPersonClaim as Person } from 'antifraud-data-utils-ts/schema-org-claims'
import { DeviceAppTypes, DeviceUserClasses, type DeviceAppType, type DeviceUserClass, type LicenseStatus } from './device-license-contract.js'

/** Commercial request metadata, independent from consent and runtime device admission. */
export const LicenseClaimContext = Object.freeze({SchemaOrg:'org.schema'} as const)
export const LicenseCategories = Object.freeze({Professional:'professional',Individual:'individual'} as const)
export const LicenseCommercialSearchOperation = Object.freeze({Offer:'Offer:Search',Order:'Order:Search'} as const)
export const LicenseEntryTypes = Object.freeze({Purchase:'License-purchase-request-v1.0',Search:'License-search-request-v1.0'} as const)
export const LicenseEntryOperations = Object.freeze({Purchase:'IndividualProduct:Purchase',Search:'IndividualProduct:Search'} as const)
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
