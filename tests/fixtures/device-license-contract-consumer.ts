// Flow contract: a legacy single-device seat and a multi-installation phone-invited seat remain independently typed; no OIDC registration object substitutes for a persisted license.
import {
  DeviceUserClasses, DeviceAppTypes, DeviceBindingStatuses, LicenseStatuses,
  type DeviceInfo, type DeviceBinding, type DeviceRestrictions, type DeviceLicense,
  type DeviceAppType, type DeviceUserClass, type DeviceBindingStatus, type LicenseStatus,
} from '../../dist/device-license-contract.js';
import { REPOSITORY_SAFE_EXAMPLES as governed } from '../../dist/repository-privacy.js';

const device: DeviceInfo = {clientInstanceId:governed.resourceUuid,os:'browser',osVersion:'1',manufacturer:'Synthetic',model:'Synthetic'};
const binding: DeviceBinding = {clientId:governed.resourceUuid,clientInstanceId:device.clientInstanceId,status:DeviceBindingStatuses.Active,deviceInfo:device,activatedAt:1,revokedAt:2};
const restrictions: DeviceRestrictions = {manufacturer:'^Synthetic$',model:'^Synthetic$'};
const legacy: DeviceLicense = {
  id:governed.resourceUuid,tenantId:governed.resourceUuid,orderId:governed.resourceUuid,
  userClass:DeviceUserClasses.Employee,type:DeviceAppTypes.Web,status:LicenseStatuses.Available,
  plan:'trial',renewalCycle:null,reactivationEnabled:true,exp:2,
};
const assigned: DeviceLicense = {...legacy,
  ownerOrganizationId:governed.resourceUuid,authorizedSubjectDid:governed.resourceUuid,
  activationCode:governed.resourceUuid,userCategory:'admin',issuedAt:1,activatedAt:1,
  subjectId:governed.resourceUuid,issuedToEmail:governed.individualEmail,issuedToPhone:governed.phoneE164,
  issuedToRole:'ISCO-08|2261',invitationId:governed.resourceUuid,relatedPersonId:governed.resourceUuid,
  deviceId:governed.resourceUuid,maxDevices:2,deviceBindings:[binding],activatedBy:governed.resourceUuid,
  deviceRestrictions:restrictions,deviceInfo:device,renewalCycle:'12m',status:LicenseStatuses.Active,
};
const kind: DeviceAppType = assigned.type;
const user: DeviceUserClass = assigned.userClass;
const bound: DeviceBindingStatus = binding.status;
const state: LicenseStatus = assigned.status;
// @ts-expect-error A concrete installation cannot have a seat lifecycle status.
const invalidBinding: DeviceBinding = {...binding,status:'inactive'};
// @ts-expect-error Revocation belongs to an installation, not the seat status union.
const invalidSeat: DeviceLicense = {...legacy,status:'revoked'};
// @ts-expect-error Epoch timestamps remain numeric seconds, not serialized date strings.
const invalidTime: DeviceLicense = {...legacy,activatedAt:'1'};
// @ts-expect-error A persisted installation requires a stable client-instance identifier.
const missingInstallation: DeviceInfo = {os:'browser'};
// @ts-expect-error Explicit undefined is not a stored optional owner binding.
const undefinedOwner: DeviceLicense = {...legacy,ownerOrganizationId:undefined};
void [kind,user,bound,state,invalidBinding,invalidSeat,invalidTime,missingInstallation,undefinedOwner];
