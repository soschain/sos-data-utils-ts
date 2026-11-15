// Flow contract: phone workforce records keep telephone separate from email and retain independently registered device contact metadata.
import type {OrganizationEmployeeLifecycleRecord} from '../../src/employee-routing.js';
import {REPOSITORY_SAFE_EXAMPLES as safe} from '../../src/repository-privacy.js';
const record:OrganizationEmployeeLifecycleRecord={resourceId:safe.resourceUuid,contactKind:'phone',telephone:safe.phoneE164,roleCode:'ISCO-08|2261',employeeDid:safe.didWeb,status:'active',license:{id:safe.resourceUuid,status:'active',maxDevices:2,activeDevices:1,devices:[{clientId:safe.resourceUuid,name:'Synthetic installation',status:'active',ownerContact:safe.phoneE164,ownerContactKind:'phone'}]}};
const label:string=record.telephone;
const absent:undefined=record.email;
void label;void absent;
