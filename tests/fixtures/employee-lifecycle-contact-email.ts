// Flow contract: historical email records retain exact callable contact, licence and role/status fields.
import type {OrganizationEmployeeLifecycleRecord} from '../../src/employee-routing.js';
import {REPOSITORY_SAFE_EXAMPLES as safe} from '../../src/repository-privacy.js';
const record:OrganizationEmployeeLifecycleRecord={resourceId:safe.resourceUuid,email:safe.firstContactEmail,roleCode:'ISCO-08|2261',employeeDid:safe.didWeb,status:'active',license:{id:safe.resourceUuid,status:'active',maxDevices:2,activeDevices:1,devices:[{clientId:safe.resourceUuid,name:'Synthetic installation',status:'active',ownerContact:safe.firstContactEmail,ownerContactKind:'email'}]}};
const label:string=record.email;
void label;
