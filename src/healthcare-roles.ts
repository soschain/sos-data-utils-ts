import {Isco08Occupations as Occupations, findIsco08Occupation, type Isco08Occupation} from 'antifraud-data-utils-ts'
import {DataspaceSectors as S} from './dataspace-sectors.js'
import {HL7_CODING_SYSTEM_V3_ROLE_CODE} from 'fhir-data-utils-ts'

const claim = <T extends Isco08Occupation>(occupation:T):`ISCO-08|${T['code']}` => `ISCO-08|${occupation.code}`

/** SOS occupation-claim projection; selection is neither employment evidence nor authorization. */
export const HealthcareActorRoles = Object.freeze({
  Controller:'RESPRSN',
  MedicalDoctors:claim(Occupations.MedicalDoctors),
  GeneralistMedicalPractitioner:claim(Occupations.GeneralistMedicalPractitioner),
  SpecialistMedicalPractitioner:claim(Occupations.SpecialistMedicalPractitioner),
  /** @deprecated Use GeneralistMedicalPractitioner. */
  Physician:claim(Occupations.GeneralistMedicalPractitioner),
  Dentist:claim(Occupations.Dentist),
  NursingProfessional:claim(Occupations.NursingProfessional),
  MidwiferyProfessional:claim(Occupations.MidwiferyProfessional),
  Paramedic:claim(Occupations.ParamedicalPractitioner),
  Veterinarian:claim(Occupations.Veterinarian),
  LifeScienceTechnician:claim(Occupations.LifeScienceTechnician),
  MedicalAndPathologyLaboratoryTechnician:claim(Occupations.MedicalAndPathologyLaboratoryTechnician),
  VeterinaryTechnicianOrAssistant:claim(Occupations.VeterinaryTechnicianOrAssistant),
  Receptionist:claim(Occupations.Receptionist),
  MedicalSecretary:claim(Occupations.MedicalSecretary),
} as const)

const R=HealthcareActorRoles
const clinical=[R.Controller,R.MedicalDoctors,R.GeneralistMedicalPractitioner,R.SpecialistMedicalPractitioner]
const admin=[R.Receptionist,R.MedicalSecretary]
const veterinary=[R.Controller,R.Veterinarian,R.VeterinaryTechnicianOrAssistant,R.Receptionist]
const technical=[R.Controller,R.Receptionist]
const bySector:Readonly<Record<string,readonly string[]>>=Object.freeze({
  [S.HealthCare]:Object.freeze([...clinical,R.Dentist,R.NursingProfessional,R.MidwiferyProfessional,R.Paramedic,...admin]),
  [S.HealthResearch]:Object.freeze([...clinical,...admin]),
  [S.HealthLab]:Object.freeze([R.Controller,R.MedicalDoctors,R.SpecialistMedicalPractitioner,R.MedicalAndPathologyLaboratoryTechnician,...admin]),
  [S.HealthTech]:Object.freeze(technical),[S.HealthInsurance]:Object.freeze(technical),
  [S.AnimalCare]:Object.freeze(veterinary),[S.AnimalResearch]:Object.freeze(veterinary),
  [S.AnimalLab]:Object.freeze([...veterinary,R.LifeScienceTechnician]),
  [S.AnimalInsurance]:Object.freeze(technical),[S.AnimalTech]:Object.freeze(technical),
  [S.OneHealthResearch]:Object.freeze([...clinical,R.Veterinarian,R.VeterinaryTechnicianOrAssistant,...admin]),
  [S.OneHealthLab]:Object.freeze([R.Controller,R.MedicalDoctors,R.SpecialistMedicalPractitioner,R.Veterinarian,R.LifeScienceTechnician,R.MedicalAndPathologyLaboratoryTechnician,R.VeterinaryTechnicianOrAssistant,...admin]),
  [S.OneHealthTech]:Object.freeze(technical),
})
export type HealthcareProfessionalRoleDescriptor=Readonly<{code:string;claim:string;titleEn:string;codingSystem:string;i18nKey:string}>

/** Eligible discovery roles only; contact proof, employment, licensing and access remain independent checks. */
export function getHealthcareProfessionalRolesBySector(sector:string):Readonly<Record<string,HealthcareProfessionalRoleDescriptor>>{
  return Object.freeze(Object.fromEntries((Object.hasOwn(bySector,sector)?bySector[sector]:[]).map(claim=>{
    const code=claim.split('|').at(-1)!
    const occupation=findIsco08Occupation(code)
    return [code,Object.freeze({code,claim,titleEn:occupation?.display??'Organization controller',codingSystem:occupation?.system??HL7_CODING_SYSTEM_V3_ROLE_CODE,i18nKey:occupation?`org.ilo.isco-08.${code}`:'org.hl7.terminology.CodeSystem.v3-RoleCode.RESPRSN'})]
  })))
}
