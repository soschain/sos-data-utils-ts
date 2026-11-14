// Flow contract: SOS role claims derive occupations from the cross-sector Antifraud catalog; controller authority stays distinct and catalog membership never grants access.
import assert from 'node:assert/strict'
import test from 'node:test'
import {Isco08Occupations, Isco08CodingSystem} from 'antifraud-data-utils-ts'
import {HealthcareActorRoles} from '../dist/healthcare-roles.js'
import * as catalog from '../dist/healthcare-roles.js'

test('derives dentistry and existing healthcare occupation claims from Antifraud',()=>{
  assert.equal(HealthcareActorRoles.Dentist,`ISCO-08|${Isco08Occupations.Dentist.code}`)
  assert.equal(HealthcareActorRoles.Veterinarian,`ISCO-08|${Isco08Occupations.Veterinarian.code}`)
  assert.equal(HealthcareActorRoles.MedicalDoctors,`ISCO-08|${Isco08Occupations.MedicalDoctors.code}`)
  assert.equal(HealthcareActorRoles.Physician,HealthcareActorRoles.GeneralistMedicalPractitioner)
  assert.equal(HealthcareActorRoles.Controller,'RESPRSN')
  assert.equal(Object.isFrozen(HealthcareActorRoles),true)
})

test('filters professional occupations by sector without confusing eligibility with authority',()=>{
  assert.equal(typeof catalog.getHealthcareProfessionalRolesBySector,'function')
  const human=Object.values(catalog.getHealthcareProfessionalRolesBySector('health-care'))
  const animal=Object.values(catalog.getHealthcareProfessionalRolesBySector('animal-care'))
  assert.equal(human.some(role=>role.claim===HealthcareActorRoles.Dentist),true)
  assert.equal(animal.some(role=>role.claim===HealthcareActorRoles.MedicalDoctors),false)
  assert.equal(animal.some(role=>role.claim===HealthcareActorRoles.Veterinarian),true)
  assert.deepEqual(catalog.getHealthcareProfessionalRolesBySector('unknown'),{})
  assert.deepEqual(catalog.getHealthcareProfessionalRolesBySector('__proto__'),{})
  assert.deepEqual(catalog.getHealthcareProfessionalRolesBySector('constructor'),{})
  assert.equal(human.some(role=>Object.hasOwn(role,'authorized')),false)
})

test('looks up dentistry without classifying controller or personal roles as occupations',()=>{
  assert.equal(typeof catalog.getHealthcareRoleByClaim,'function')
  const dentist=catalog.getHealthcareRoleByClaim(HealthcareActorRoles.Dentist)
  assert.equal(dentist.code,Isco08Occupations.Dentist.code)
  assert.equal(dentist.codingSystem,Isco08CodingSystem)
  assert.equal(dentist.family,catalog.HealthcareRoleFamilies.ProfessionalOccupationIsco08)
  const controller=catalog.getHealthcareRoleByClaim(HealthcareActorRoles.Controller)
  const oneself=catalog.getHealthcareRoleByClaim('ONESELF')
  assert.equal(controller.family,catalog.HealthcareRoleFamilies.LegalRepresentativeHl7)
  assert.equal(oneself.family,catalog.HealthcareRoleFamilies.PersonalRelationshipHl7)
  assert.equal(catalog.getHealthcareRoleByClaim(`ISCO-08|${Isco08Occupations.SecondaryEducationTeacher.code}`),undefined)
  assert.equal(Object.isFrozen(dentist),true)
  assert.equal(Object.hasOwn(dentist,'authorized'),false)
})

test('preserves role-code aliases and declared namespaces without prototype fallbacks',()=>{
  assert.equal(typeof catalog.getHealthcareRoleByClaim,'function')
  const dentist=catalog.getHealthcareRoleByClaim(HealthcareActorRoles.Dentist)
  for(const alias of [Isco08Occupations.Dentist.code,`${Isco08CodingSystem}|${Isco08Occupations.Dentist.code}`,`${catalog.ISCO08_CODING_SYSTEM}|${Isco08Occupations.Dentist.code}`]){
    assert.equal(catalog.getHealthcareRoleByClaim(alias),dentist)
  }
  assert.equal(catalog.HealthcareActorRoleCodes.Dentist,Isco08Occupations.Dentist.code)
  assert.equal(catalog.HealthcareActorRoleCodes.Controller,HealthcareActorRoles.Controller)
  assert.equal(catalog.HealthcareActorRoleCodes.PhysicianBroad,catalog.HealthcareActorRoleCodes.MedicalDoctors)
  for(const unknown of ['__proto__','constructor','toString','ISCO-08|999999','v3-RoleCode|UNKNOWN']){
    assert.equal(catalog.getHealthcareRoleByClaim(unknown),undefined)
    assert.equal(catalog.HealthcareAllRolesByClaim[unknown],undefined)
  }
})

test('keeps family catalogs immutable and resolves full HL7 identifiers',()=>{
  assert.equal(typeof catalog.getHealthcareRolesByFamily,'function')
  const professional=catalog.getHealthcareRolesByFamily(catalog.HealthcareRoleFamilies.ProfessionalOccupationIsco08)
  assert.equal(Object.values(professional).some(role=>role.code===HealthcareActorRoles.Controller),false)
  const controller=catalog.getHealthcareRoleByClaim('http://terminology.hl7.org/CodeSystem/v3-RoleCode|RESPRSN')
  assert.equal(controller.claim,'v3-RoleCode|RESPRSN')
  assert.equal(catalog.HealthcareAllRolesByClaim[controller.claim],controller)
  assert.equal(Object.isFrozen(professional),true)
  assert.deepEqual(Object.keys(catalog.getHealthcareRolesByFamily('__proto__')),[])
  assert.deepEqual(Object.keys(catalog.getHealthcareRolesByFamily('constructor')),[])
  assert.equal(catalog.getHealthcareRolesByFamily('__proto__').constructor,undefined)
  const personal=catalog.getHealthcareRolesByFamily(catalog.HealthcareRoleFamilies.PersonalRelationshipHl7)
  assert.equal(Object.values(personal)[0].code,'ONESELF')
})
