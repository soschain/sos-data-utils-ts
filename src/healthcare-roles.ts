import {Isco08Occupations as Occupations, type Isco08Occupation} from 'antifraud-data-utils-ts'

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
