// Flow contract: pharmacy and administrative occupations are discoverable synthetic profiles; role selection grants no clinical writes, emergency access or controller authority.
import assert from 'node:assert/strict'
import test from 'node:test'
import { Isco08Occupations } from 'antifraud-data-utils-ts'
import { HealthcareActorRoles, getHealthcareRoleByClaim, getHealthcareProfessionalRolesBySector } from '../dist/healthcare-roles.js'
import {
  SoschainProfessionalDemoProfileIds,
  SoschainProfessionalDemoSectorIds,
  SOSCHAIN_PROFESSIONAL_DEMO_PROFILES,
  getSoschainDemoProfilesForSector,
} from '../dist/portal-access-profiles.data.js'
import { resolveProfessionalDemoCapabilities } from '../dist/professional-demo-capabilities.js'

const additions = [
  ['Pharmacist', 'Pharmacist', 'Pharmacist', 'pharmacist', '2262'],
  ['PharmacyTechnicianOrAssistant', 'PharmaceuticalTechnicianOrAssistant', 'PharmacyTechnician', 'pharmacy-technician', '3213'],
  ['AdministrativeAssistant', 'GeneralOfficeClerk', 'AdministrativeAssistant', 'administrative-assistant', '4110'],
]

for (const [roleName, occupationName, profileName, profileId, code] of additions) {
  test(`${profileId} projects the Antifraud occupation without controller authority`, () => {
    assert.equal(Isco08Occupations[occupationName]?.code, code)
    assert.equal(HealthcareActorRoles[roleName], `ISCO-08|${code}`)
    assert.notEqual(HealthcareActorRoles[roleName], HealthcareActorRoles.Controller)
    assert.equal(getHealthcareRoleByClaim(`ISCO-08|${code}`)?.code, code)
    assert.equal(SoschainProfessionalDemoProfileIds[profileName], profileId)
    const profiles = SOSCHAIN_PROFESSIONAL_DEMO_PROFILES.filter(profile => profile.id === profileId)
    assert.ok(profiles.length > 0)
    assert.ok(profiles.every(profile => profile.enabled && !profile.grantsAuthority && profile.roleClaim === `ISCO-08|${code}`))
  })

  test(`${profileId} does not acquire clinical authorship, break-glass or communications by selection`, () => {
    const capability = resolveProfessionalDemoCapabilities(profileId)
    assert.equal(capability.workflowFamily, 'administrative-read-only')
    assert.equal(capability.grantsRealAuthority, false)
    assert.equal(capability.clinicalWriteScope, 'none')
    assert.equal(capability.healthScope, 'none')
    assert.equal(capability.canRequestBreakGlass, false)
    assert.equal(capability.communicationLaunchSurface, 'none')
    assert.ok(capability.sections.every(section => section.mode === 'unavailable'))
  })
}

test('bounds pharmacy discovery to health-care and keeps administrative assistance available across existing Demo sectors', () => {
  for (const code of ['2262', '3213']) {
    assert.ok(Object.values(getHealthcareProfessionalRolesBySector('health-care')).some(role => role.code === code))
    assert.ok(!Object.values(getHealthcareProfessionalRolesBySector('animal-care')).some(role => role.code === code))
  }
  for (const sector of Object.values(SoschainProfessionalDemoSectorIds)) {
    const profiles = getSoschainDemoProfilesForSector(sector)
    assert.ok(profiles.some(profile => profile.id === 'administrative-assistant'), sector)
    assert.equal(profiles.some(profile => profile.id === 'pharmacist'), sector === SoschainProfessionalDemoSectorIds.HealthCare, sector)
    assert.equal(profiles.some(profile => profile.id === 'pharmacy-technician'), sector === SoschainProfessionalDemoSectorIds.HealthCare, sector)
  }
  for (const sector of ['health-care', 'health-tech', 'animal-care', 'animal-tech', 'health-lab', 'animal-lab', 'onehealth-lab', 'onehealth-tech']) {
    assert.ok(Object.values(getHealthcareProfessionalRolesBySector(sector)).some(role => role.code === '4110'), sector)
  }
})

test('publishes fifteen employee profiles with Controller remaining a separate authority', () => {
  const profileIds = Object.values(SoschainProfessionalDemoProfileIds)
  assert.equal(profileIds.length, 15)
  assert.equal(new Set(profileIds).size, 15)
  assert.equal(profileIds.includes('controller'), false)
  assert.equal(new Set(SOSCHAIN_PROFESSIONAL_DEMO_PROFILES.filter(profile => profile.enabled).map(profile => profile.id)).size, 15)
})
