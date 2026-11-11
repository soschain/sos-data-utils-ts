import {FHIR_ENCOUNTER_TRANSFER_TEST_DATA} from 'fhir-data-utils-ts/data'
import {PORTAL_DEMO_SERVICE_DIRECTORY} from './portal-demo-service-directory.js'
import type {PortalEncounterService} from './portal-encounter-journey.js'

/** Synthetic provider configuration; a service selection never grants professional access. */
export function createPortalDemoEncounterServices(organizationReference:string):readonly PortalEncounterService[]{
  if(typeof organizationReference!=='string'||!/^Organization\/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/iu.test(organizationReference))throw new TypeError('demo_encounter_organization_invalid')
  const id=organizationReference.slice('Organization/'.length)
  const legacy=PORTAL_DEMO_SERVICE_DIRECTORY.find(item=>item.organization.reference===organizationReference)
  const klass=FHIR_ENCOUNTER_TRANSFER_TEST_DATA.class
  return Object.freeze([
    {reference:legacy?.service.reference||`HealthcareService/${id}-emergency`,label:legacy?.service.name||'Emergency service',locationReference:legacy?.place.reference||`Location/${id}-emergency`},
    {reference:`HealthcareService/${id}-assessment`,label:'Assessment service',locationReference:`Location/${id}-assessment`},
    {reference:`HealthcareService/${id}-continuing`,label:'Continuing care',locationReference:`Location/${id}-continuing`},
  ].map(service=>Object.freeze({...service,organizationReference,classToken:`${klass.system}|${klass.code}`})))
}
