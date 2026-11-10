import {REPOSITORY_SAFE_EXAMPLES as safe} from './repository-privacy.js'

export type PortalDemoServiceDirectoryEntry=Readonly<{
  organization:Readonly<{reference:string;name:string;description:string;logoUrl:string}>
  place:Readonly<{
    reference:string;name:string;address:string;country:string;region:string;postalCode:string
    geo:Readonly<{latitude:number;longitude:number}>;openingHours:readonly string[];photoUrl:string
  }>
  service:Readonly<{reference:string;name:string;description:string;serviceType:string;emergency:boolean}>
  routing:Readonly<{departmentOrganizationReference:string;professionalGroupReference:string}>
}>

export type PortalDemoServiceSearch=Readonly<{country:string;region?:string;serviceType?:string}>

/** Governed synthetic public projection shared by both portals; it grants no clinical authority. */
export const PORTAL_DEMO_SERVICE_DIRECTORY:readonly PortalDemoServiceDirectoryEntry[]=Object.freeze([
  Object.freeze({
    organization:Object.freeze({
      reference:`Organization/${safe.demoOrganizationUuids.animalCare}`,
      name:safe.organizationLegalName,
      description:'Synthetic veterinary organization for cross-portal Demo journeys.',
      logoUrl:`${safe.httpsBaseUrl}/assets/demo-animal-care-logo.png`,
    }),
    place:Object.freeze({
      reference:`Location/${safe.organizationScopedResources.placeUuid}`,
      name:'Example Veterinary Centre',address:'100 Example Way',country:safe.countryIso2,region:'CA-BC',postalCode:'V0V 0V0',
      geo:Object.freeze({latitude:49.2827,longitude:-123.1207}),
      openingHours:Object.freeze(['Monday-Friday 08:00-20:00','Saturday-Sunday 09:00-17:00','Emergency requests 24 hours']),
      photoUrl:`${safe.httpsBaseUrl}/assets/demo-veterinary-centre.jpg`,
    }),
    service:Object.freeze({
      reference:`HealthcareService/${safe.organizationScopedResources.serviceUuid}`,
      name:'Emergency veterinary care',description:'Remote triage followed by clinic care when required.',
      serviceType:'emergency-veterinary-care',emergency:true,
    }),
    routing:Object.freeze({
      departmentOrganizationReference:`Organization/${safe.organizationScopedResources.departmentUuid}`,
      professionalGroupReference:`Group/${safe.organizationScopedResources.departmentUuid}`,
    }),
  }),
])

/** Required-country search used identically by Demo and Network directory adapters. */
export function searchPortalDemoServices(entries:readonly PortalDemoServiceDirectoryEntry[],query:PortalDemoServiceSearch):readonly PortalDemoServiceDirectoryEntry[]{
  const country=required(query.country,'portal_demo_service_country_required').toUpperCase()
  if(!/^[A-Z]{2}$/u.test(country))throw new TypeError('portal_demo_service_country_invalid')
  const region=query.region?.trim().toUpperCase()
  if(region&&!/^[A-Z]{2}-[A-Z0-9]{1,3}$/u.test(region))throw new TypeError('portal_demo_service_region_invalid')
  const serviceType=query.serviceType?.trim().toLowerCase()
  return Object.freeze(entries.filter(entry=>entry.place.country===country&&(!region||entry.place.region===region)&&(!serviceType||entry.service.serviceType.toLowerCase()===serviceType)))
}

function required(value:unknown,error:string):string{
  if(typeof value!=='string'||!value.trim())throw new TypeError(error)
  return value.trim()
}
