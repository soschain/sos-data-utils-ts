import type {buildOrganizationDidWeb,buildProfessionalDidWeb,buildIndividualMemberDidWebFromPrivateIdentifiers} from './hosted-did.js';
import {REPOSITORY_SAFE_EXAMPLES as safe} from './repository-privacy.js';
import {SecureIdTypesIndividual} from './identity-identifiers.js';
import {DataspaceSectors} from './dataspace-sectors.js';
import {HealthcareActorRoles} from './healthcare-roles.js';
import {HL7_CODING_SYSTEM_V3_ROLE_CODE} from 'fhir-data-utils-ts';

type Vector<T>=Readonly<{name:string;input:Readonly<T>;expected:string}>;
function freezeVectors<T>(values:readonly Vector<T>[]):readonly Vector<T>[] {
 return Object.freeze(values.map(value=>Object.freeze({...value,input:Object.freeze(value.input)})));
}
const host=`did:web:${safe.domain}`,provider=`${host}:${safe.tenantId}:cds-${safe.countryIso2}:v1:${safe.sector}`;
const regionalJurisdiction=`${safe.secondaryCountryIso2}-MD`;
const professionalMember='zW1axxMnbjCP6R7KzzYF75hdp4FfJxM897EYvWK69rzuusT';

/** Recorded pre-migration values. No expected hash is computed by a DID builder. */
export const HOSTED_DID_FIXTURE_PROVENANCE=Object.freeze({
 personalConsumer:'https://github.com/Fundacion-UNID/connect-health-personal-next/blob/e4a3291b0fbc968168bfdf75b78da511a89b583c/src/lib/server/vetchain-profile-onboarding.ts',
 professionalCharacterization:'https://github.com/Fundacion-UNID/connect-health-professional-next/blob/5c7d43b/tests/organization-registration-identifier-owner.test.ts',
 expectedValues:'Recorded before consumer import migration; no expected hash is regenerated from the tested builders.',
});
export const HOSTED_ORGANIZATION_DID_VECTORS=freezeVectors<Parameters<typeof buildOrganizationDidWeb>[0]>([
 {name:'regional routing',input:{hostDidWeb:host,tenantId:safe.tenantId,jurisdiction:regionalJurisdiction,sector:DataspaceSectors.HealthTech},expected:`${host}:${safe.tenantId}:cds-${regionalJurisdiction}:v1:${DataspaceSectors.HealthTech}`},
 {name:'historical bare national identifier',input:{hostDidWeb:host,tenantId:safe.organizationBusinessNumber,jurisdiction:safe.countryIso2,sector:safe.sector},expected:`${host}:${safe.organizationBusinessNumber}:cds-${safe.countryIso2}:v1:${safe.sector}`},
 {name:'tenant case and surrounding whitespace',input:{hostDidWeb:host,tenantId:` ${safe.tenantId.toUpperCase()} `,jurisdiction:safe.countryIso2,sector:safe.sector},expected:`${host}:${safe.tenantId.toUpperCase()}:cds-${safe.countryIso2}:v1:${safe.sector}`},
 {name:'alternate tenant and explicit version',input:{hostDidWeb:host,tenantAlternateName:safe.tenantId,jurisdiction:safe.countryIso2,sector:safe.sector,version:'v2'},expected:`${host}:${safe.tenantId}:cds-${safe.countryIso2}:v2:${safe.sector}`},
 {name:'encoded authority port',input:{hostDidWeb:`${host}%3A8443`,tenantId:safe.tenantId,jurisdiction:safe.countryIso2,sector:safe.sector},expected:`${host}%3A8443:${safe.tenantId}:cds-${safe.countryIso2}:v1:${safe.sector}`},
] satisfies readonly Vector<Parameters<typeof buildOrganizationDidWeb>[0]>[]);
export const HOSTED_PROFESSIONAL_DID_VECTORS=freezeVectors<Parameters<typeof buildProfessionalDidWeb>[0]>([
 {name:'normalized reviewer contact',input:{organizationDidWeb:provider,email:` ${safe.individualEmail.toUpperCase()} `,role:` ${HealthcareActorRoles.Controller} `},expected:`${provider}:employee:${professionalMember}:${HealthcareActorRoles.Controller}`},
 {name:'clinical occupation role bytes',input:{organizationDidWeb:provider,email:safe.individualEmail,role:HealthcareActorRoles.Dentist},expected:`${provider}:employee:${professionalMember}:${HealthcareActorRoles.Dentist}`},
 {name:'device identity suffix',input:{organizationDidWeb:provider,email:safe.individualEmail,role:HealthcareActorRoles.Controller,deviceId:safe.resourceUuid},expected:`${provider}:employee:${professionalMember}:${HealthcareActorRoles.Controller}:${safe.resourceUuid}`},
 {name:'blank optional device',input:{organizationDidWeb:provider,email:safe.individualEmail,role:HealthcareActorRoles.Controller,deviceId:'   '},expected:`${provider}:employee:${professionalMember}:${HealthcareActorRoles.Controller}`},
] satisfies readonly Vector<Parameters<typeof buildProfessionalDidWeb>[0]>[]);

const subjectMultibase='zG9MJU4Yjo8Y1E2bzGNuKiw3N9pvm7E3nCLYetSYdL6G5awoCgGSCzWw7PiFhZ8fMNYTh';
const emailMultibase='zG9JX6SSvfA51tRSSJ8L8hwvrRbcQVYo7wakuGxqK7wxKK7qdKZC5Dp9Gfd1MbfjUDdVS';
const phoneMultibase='zG9G85QohVw3g4zJHMDeQbjziiBudC8RNSYg1XQtKew6Sxu1PjYpCNnY1AH8Z3KbHQJjU';
const subjectDid=`${host}:individual:multibase:${subjectMultibase}`;
export const HOSTED_MEMBER_IDENTITY_GOLDENS=Object.freeze({
 providerDid:host,subjectId:safe.resourceUuid,ownerId:safe.resourceUuid,
 profileId:'vetchain-personal-actor:4kRYCEWrh-eXnVR-iO0KbvbTNUtEhZjr6MWizYq9D9M',
 authorizedSubjectDid:subjectDid,
 emailActorDid:`${subjectDid}:member:${emailMultibase}:${HealthcareActorRoles.Controller}`,
 phoneActorDid:`${subjectDid}:member:${phoneMultibase}:${HealthcareActorRoles.Controller}`,
});
const contacts=[
 {name:'email',type:SecureIdTypesIndividual.Email,value:safe.individualEmail,expected:HOSTED_MEMBER_IDENTITY_GOLDENS.emailActorDid},
 {name:'uppercase email',type:SecureIdTypesIndividual.Email,value:safe.individualEmail.toUpperCase(),expected:HOSTED_MEMBER_IDENTITY_GOLDENS.emailActorDid},
 {name:'mailto email',type:SecureIdTypesIndividual.Email,value:` MAILTO:${safe.individualEmail.toUpperCase()} `,expected:HOSTED_MEMBER_IDENTITY_GOLDENS.emailActorDid},
 {name:'telephone',type:SecureIdTypesIndividual.Phone,value:safe.phoneE164,expected:HOSTED_MEMBER_IDENTITY_GOLDENS.phoneActorDid},
 {name:'tel telephone',type:SecureIdTypesIndividual.Phone,value:`tel:${safe.phoneE164}`,expected:HOSTED_MEMBER_IDENTITY_GOLDENS.phoneActorDid},
 {name:'whitespace telephone',type:SecureIdTypesIndividual.Phone,value:` ${safe.phoneE164} `,expected:HOSTED_MEMBER_IDENTITY_GOLDENS.phoneActorDid},
] as const;
export const HOSTED_MEMBER_DID_VECTORS:readonly Vector<Parameters<typeof buildIndividualMemberDidWebFromPrivateIdentifiers>[0]>[]=Object.freeze(contacts.flatMap(contact=>[
 {name:'hyphenated UUID / '+contact.name,subject:safe.resourceUuid},
 {name:'hexadecimal UUID / '+contact.name,subject:safe.resourceUuid.replaceAll('-','').toUpperCase()},
].map(subject=>Object.freeze({name:subject.name,input:Object.freeze({providerDidWeb:host,secureIdTypeIndividual:SecureIdTypesIndividual.Uuid,privateIdValueIndividual:subject.subject,secureIdTypeMember:contact.type,privateIdValueMember:contact.value,roleType:HL7_CODING_SYSTEM_V3_ROLE_CODE,roleValue:HealthcareActorRoles.Controller}),expected:contact.expected}))));
