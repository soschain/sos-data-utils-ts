import {Isco08Occupations as Occupations, Isco08CodingSystem, findIsco08Occupation, type Isco08Occupation} from 'antifraud-data-utils-ts'
import {DataspaceSectors as S} from './dataspace-sectors.js'
import {HL7_CODING_SYSTEM_V3_ROLE_CODE, HL7_PERSONAL_RELATIONSHIP_ROLES, HL7_V3_ROLE_CODE_LEGAL_REPRESENTATIVE, type Hl7RoleEntry} from 'fhir-data-utils-ts'
import {HealthcarePersonalRelationshipSelectionOrder} from './healthcare-relationship-selection.js'

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

type BareRoleCode<Role extends string> = Role extends `${string}|${infer Code}` ? Code : Role
const actorCodes = Object.fromEntries(Object.entries(HealthcareActorRoles).map(([name, value]) => [name, value.split('|').at(-1)!])) as {
  readonly [Key in keyof typeof HealthcareActorRoles]: BareRoleCode<typeof HealthcareActorRoles[Key]>
}
export const HealthcareActorRoleCodes = Object.freeze({
  ...actorCodes,
  /** @deprecated Prefer MedicalDoctors. */
  PhysicianBroad: actorCodes.MedicalDoctors,
})

/** SOS persisted claim namespace. External interoperability identifiers are profile-specific. */
export const ISCO08_CODING_SYSTEM = 'org.ilo.isco' as const
export const HealthcareRoleFamilies = Object.freeze({
  ProfessionalOccupationIsco08: 'professionalOccupationIsco08',
  PersonalRelationshipHl7: 'personalRelationshipHl7',
  LegalRepresentativeHl7: 'legalRepresentativeHl7',
} as const)
export type HealthcareRoleFamily = typeof HealthcareRoleFamilies[keyof typeof HealthcareRoleFamilies]
export type HealthcareActorRoleDescriptor = Readonly<{
  family: HealthcareRoleFamily
  codingSystem: string
  code: string
  claim: string
  i18nKey: `org.ilo.isco-08.${string}` | `org.hl7.terminology.CodeSystem.v3-RoleCode.${string}`
  titleEn: string
  definition?: string
}>

function freezeRoleMap(rows: Record<string, HealthcareActorRoleDescriptor>): Readonly<Record<string, HealthcareActorRoleDescriptor>> {
  return Object.freeze(Object.assign(Object.create(null) as Record<string, HealthcareActorRoleDescriptor>, rows))
}

const professionalRoles: Readonly<Record<string, HealthcareActorRoleDescriptor>> = freezeRoleMap(Object.fromEntries(
  [...new Set(Object.values(HealthcareActorRoles).filter(value => value !== HealthcareActorRoles.Controller))].map(value => {
    const code = value.split('|').at(-1)!
    const occupation = findIsco08Occupation(code)
    if (!occupation) throw new TypeError('healthcare_occupation_catalog_missing')
    return [code, Object.freeze({
      family: HealthcareRoleFamilies.ProfessionalOccupationIsco08,
      codingSystem: ISCO08_CODING_SYSTEM, code, claim: value,
      i18nKey: `org.ilo.isco-08.${code}` as const, titleEn: occupation.display,
    })]
  }),
))

function hl7Descriptor(entry: Hl7RoleEntry, family: HealthcareRoleFamily): HealthcareActorRoleDescriptor {
  return Object.freeze({
    family, codingSystem: entry.codingSystem, code: entry.code,
    claim: `v3-RoleCode|${entry.code}`,
    i18nKey: `org.hl7.terminology.CodeSystem.v3-RoleCode.${entry.code}`,
    titleEn: entry.display, definition: entry.definition,
  })
}
const personalByCode = new Map(HL7_PERSONAL_RELATIONSHIP_ROLES.map(entry => [entry.code, entry]))
const preferredPersonal = HealthcarePersonalRelationshipSelectionOrder.map(code => {
  const entry = personalByCode.get(code)
  if (!entry) throw new TypeError('healthcare_relationship_catalog_missing')
  return entry
})
const preferredCodes: ReadonlySet<string> = new Set(HealthcarePersonalRelationshipSelectionOrder)
const orderedPersonal = [...preferredPersonal, ...HL7_PERSONAL_RELATIONSHIP_ROLES.filter(entry => !preferredCodes.has(entry.code))]
export const HealthcareRolesByFamily = Object.freeze({
  [HealthcareRoleFamilies.ProfessionalOccupationIsco08]: professionalRoles,
  [HealthcareRoleFamilies.PersonalRelationshipHl7]: freezeRoleMap(Object.fromEntries(orderedPersonal.map(entry => [entry.code, hl7Descriptor(entry, HealthcareRoleFamilies.PersonalRelationshipHl7)]))),
  [HealthcareRoleFamilies.LegalRepresentativeHl7]: freezeRoleMap(Object.fromEntries(HL7_V3_ROLE_CODE_LEGAL_REPRESENTATIVE.map(entry => [entry.code, hl7Descriptor(entry, HealthcareRoleFamilies.LegalRepresentativeHl7)]))),
})
export const HealthcareAllRolesByClaim: Readonly<Record<string, HealthcareActorRoleDescriptor>> = freezeRoleMap(Object.fromEntries(
  Object.values(HealthcareRolesByFamily).flatMap(family => Object.values(family)).flatMap(entry => [[entry.claim, entry], [entry.code, entry]]),
))
const emptyRoles: Readonly<Record<string, HealthcareActorRoleDescriptor>> = freezeRoleMap({})

/** Metadata lookup only. Employment, proof and active licence checks remain with the consuming workflow. */
export function getHealthcareRolesByFamily(family: HealthcareRoleFamily): Readonly<Record<string, HealthcareActorRoleDescriptor>> {
  return Object.hasOwn(HealthcareRolesByFamily, family) ? HealthcareRolesByFamily[family] : emptyRoles
}

/** Accepts explicit standard and persisted namespaces without treating unknown strings as roles. */
export function getHealthcareRoleByClaim(claim: string): HealthcareActorRoleDescriptor | undefined {
  const normalized = String(claim ?? '').trim()
  if (Object.hasOwn(HealthcareAllRolesByClaim, normalized)) return HealthcareAllRolesByClaim[normalized]
  const [system, code, ...unexpected] = normalized.split('|')
  if (unexpected.length || !code || !Object.hasOwn(HealthcareAllRolesByClaim, code)) return undefined
  const descriptor = HealthcareAllRolesByClaim[code]
  const systems: readonly string[] = descriptor.family === HealthcareRoleFamilies.ProfessionalOccupationIsco08
    ? ['ISCO-08', ISCO08_CODING_SYSTEM, 'org.ilo.isco-08', Isco08CodingSystem]
    : ['v3-RoleCode', HL7_CODING_SYSTEM_V3_ROLE_CODE]
  return systems.includes(system) ? descriptor : undefined
}

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
    return [code,Object.freeze({code,claim,titleEn:occupation?.display??'Organization controller',codingSystem:occupation?ISCO08_CODING_SYSTEM:HL7_CODING_SYSTEM_V3_ROLE_CODE,i18nKey:occupation?`org.ilo.isco-08.${code}`:'org.hl7.terminology.CodeSystem.v3-RoleCode.RESPRSN'})]
  })))
}
