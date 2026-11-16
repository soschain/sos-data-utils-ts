// Selective hosted identity contract reviewed from source revision 74479fa3fc8d8cbf92a9ff13dd626ccf8d6f2b1e.
// Copyright 2025-2026 Antifraud Services Inc. under Apache-2.0. Parsing and hashing never grant authority.
import {HL7_V2_0203_IDENTIFIER_CODES as C} from 'fhir-data-utils-ts/hl7-v2-0203-identifier-types'
export const SecureIdTypesIndividual=Object.freeze({Uuid:'UUID',Email:'EMAIL',Phone:'PHONE',DriverLicense:C.DriverLicense,CitizenshipCard:C.CitizenshipCard,NationalNumber:C.NationalNumber,PassportNumber:C.PassportNumber,JurisdictionalHealthNumber:C.JurisdictionalHealthNumber,WorkPermit:C.WorkPermit,StudyPermit:C.StudyPermit,HealthCard:C.HealthCard,MemberNumber:C.MemberNumber,SubscriberNumber:C.SubscriberNumber,DonorRecord:C.DonorRecord,PatientIdentifier:C.PatientIdentifier} as const)
export type SecureIdTypeIndividual=typeof SecureIdTypesIndividual[keyof typeof SecureIdTypesIndividual]
const codes=Object.entries(SecureIdTypesIndividual).filter(([key])=>!['Uuid','Email','Phone'].includes(key)).map(([,value])=>value) as readonly string[]
const prefix='org.hl7.terminology.CodeSystem.v2-0203'
/** Normalize a supported clinical identifier code without interpreting its private value. */
export function normalizeIndividualIdentifierType(type:string):string{
 const candidate=String(type).trim()
 const code=candidate.startsWith(prefix+'.')?candidate.slice(prefix.length+1):candidate.startsWith(prefix.toLowerCase()+'.')?candidate.slice(prefix.length+1):candidate
 if(!codes.includes(code))throw new Error('Unsupported individual identifier type: '+candidate)
 return prefix+'.'+code
}
