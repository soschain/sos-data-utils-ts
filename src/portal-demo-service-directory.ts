import {SOSCHAIN_DEMO_ORGANIZATIONS} from './portal-access-profiles.data.js'
import {REPOSITORY_SAFE_EXAMPLES as safe} from './repository-privacy.js'
import {bytesToBase58} from 'gdc-common-utils-ts/utils/base-convert'

export function formatPortalDemoOrganizationName(name:string,uuid:string):string{
  if(typeof uuid!=='string'||!(/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/iu.test(uuid)))throw new TypeError('demo_organization_uuid_invalid')
  if(typeof name!=='string'||!name.trim())throw new TypeError('demo_organization_name_invalid')
  const hex=uuid.replaceAll('-','')
  const encoded=bytesToBase58(Uint8Array.from(hex.match(/../gu)!,value=>parseInt(value,16)))
  return `${name.trim()} · ${encoded.slice(0,4)}…${encoded.slice(-4)}`
}

/** A template is presentation; an account-owned instance supplies identity. */
export function instantiatePortalDemoOrganization(templateUrn:string,uuid:string){
  const template=SOSCHAIN_DEMO_ORGANIZATIONS.find(item=>item.organizationUrn===templateUrn)
  if(!template)throw new TypeError('demo_organization_template_invalid')
  const directory=PORTAL_DEMO_SERVICE_DIRECTORY.find(item=>item.organization.reference===templateUrn.replace('urn:uuid:','Organization/'))
  const titleEn=formatPortalDemoOrganizationName(directory?.organization.name??template.titleEn,uuid)
  return Object.freeze({...template,templateOrganizationUrn:template.organizationUrn,organizationUrn:`urn:uuid:${uuid}` as const,
    organizationDomain:`${uuid}.${safe.domain}`,organizationDid:`did:web:${uuid}.${safe.domain}`,titleEn})
}

export function instantiatePortalDemoServiceDirectory(organization:Readonly<{organizationUrn:string;templateOrganizationUrn:string;titleEn:string}>):readonly PortalDemoServiceDirectoryEntry[]{
  const source=PORTAL_DEMO_SERVICE_DIRECTORY.find(item=>item.organization.reference===organization.templateOrganizationUrn.replace('urn:uuid:','Organization/'))
  if(!source)return Object.freeze([])
  const uuid=organization.organizationUrn.slice('urn:uuid:'.length)
  return Object.freeze([Object.freeze({...source,
    organization:Object.freeze({...source.organization,reference:`Organization/${uuid}`,name:organization.titleEn}),
    place:Object.freeze({...source.place,reference:`Location/${uuid}-emergency`,name:organization.titleEn}),
    service:Object.freeze({...source.service,reference:`HealthcareService/${uuid}-emergency`}),
    routing:Object.freeze({departmentOrganizationReference:`Organization/${uuid}`,professionalGroupReference:`Group/${uuid}`}),
  })])
}

export type PortalDemoServiceDirectoryEntry=Readonly<{
  sector?:string
  subjectKind?:'human'|'animal'
  demo?:boolean
  booking?:Readonly<{enabled:boolean;durationMinutes:number}>
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
    sector:'animal-care',
    organization:Object.freeze({
      reference:`Organization/${safe.demoOrganizationUuids.animalCare}`,
      name:SOSCHAIN_DEMO_ORGANIZATIONS.find(item=>item.sector==='animal-care')!.titleEn,
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
  Object.freeze({
    sector:'health-care',subjectKind:'human',demo:true,booking:Object.freeze({enabled:true,durationMinutes:30}),
    organization:Object.freeze({reference:`Organization/${safe.demoOrganizationUuids.healthCare}`,name:'Dentist Demo Clinic',
      description:'Synthetic dental clinic for trying appointments and emergency requests. No real clinic is contacted.',logoUrl:''}),
    place:Object.freeze({reference:`Location/${safe.demoOrganizationUuids.healthCare}-emergency`,name:'Dentist Demo Clinic',
      address:'Demo location',country:'ES',region:'ES-MD',postalCode:'28001',geo:Object.freeze({latitude:40.4168,longitude:-3.7038}),
      openingHours:Object.freeze(['Demo appointment slots daily','Demo emergency requests only']),photoUrl:''}),
    service:Object.freeze({reference:`HealthcareService/${safe.demoOrganizationUuids.healthCare}-emergency`,name:'Dental emergency Demo',
      description:'Try sending a dental emergency request to the Demo professional team. Acceptance is a separate step.',serviceType:'emergency-dental-care',emergency:true}),
    routing:Object.freeze({departmentOrganizationReference:`Organization/${safe.demoOrganizationUuids.healthCare}`,
      professionalGroupReference:`Group/${safe.demoOrganizationUuids.healthCare}`}),
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
