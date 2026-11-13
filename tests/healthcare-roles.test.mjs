// Flow contract: SOS role claims derive occupations from the cross-sector Antifraud catalog; controller authority stays distinct and catalog membership never grants access.
import assert from 'node:assert/strict'
import test from 'node:test'
import {Isco08Occupations} from 'antifraud-data-utils-ts'
import {HealthcareActorRoles} from '../dist/healthcare-roles.js'

test('derives dentistry and existing healthcare occupation claims from Antifraud',()=>{
  assert.equal(HealthcareActorRoles.Dentist,`ISCO-08|${Isco08Occupations.Dentist.code}`)
  assert.equal(HealthcareActorRoles.Veterinarian,`ISCO-08|${Isco08Occupations.Veterinarian.code}`)
  assert.equal(HealthcareActorRoles.MedicalDoctors,`ISCO-08|${Isco08Occupations.MedicalDoctors.code}`)
  assert.equal(HealthcareActorRoles.Physician,HealthcareActorRoles.GeneralistMedicalPractitioner)
  assert.equal(HealthcareActorRoles.Controller,'RESPRSN')
  assert.equal(Object.isFrozen(HealthcareActorRoles),true)
})
