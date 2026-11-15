/**
 * Persisted SOS seat and installation contracts. These values describe stored
 * records; they neither authorize a device nor perform a lifecycle transition.
 * Compatibility evidence (read-only original source):
 * https://github.com/Global-DataCare/gdc-common-utils-ts/blob/f4031b221216cacd9917d1d20c5ff0b03bed7045/src/models/device-license.ts
 * https://github.com/Global-DataCare/gdc-common-utils-ts/blob/f4031b221216cacd9917d1d20c5ff0b03bed7045/src/constants/device.ts
 * https://github.com/Global-DataCare/gdc-common-utils-ts/blob/f4031b221216cacd9917d1d20c5ff0b03bed7045/src/utils/license.ts
 */
export const DeviceUserClasses = Object.freeze({Employee:'employee',Individual:'individual'} as const);
export type DeviceUserClass = typeof DeviceUserClasses[keyof typeof DeviceUserClasses];
export const DeviceAppTypes = Object.freeze({Mobile:'mobile',Web:'web'} as const);
export type DeviceAppType = typeof DeviceAppTypes[keyof typeof DeviceAppTypes];
export const DeviceBindingStatuses = Object.freeze({Active:'active',Revoked:'revoked'} as const);
export type DeviceBindingStatus = typeof DeviceBindingStatuses[keyof typeof DeviceBindingStatuses];
export const LicenseStatuses = Object.freeze({Available:'available',Issued:'issued',Active:'active',Inactive:'inactive'} as const);
export type LicenseStatus = typeof LicenseStatuses[keyof typeof LicenseStatuses];

/** Client-supplied installation fingerprint, separate from an OIDC client registration. */
export interface DeviceInfo {
  clientInstanceId:string;
  os?:string;
  osVersion?:string;
  manufacturer?:string;
  model?:string;
}

/** One concrete DCR installation; timestamps are numeric Unix epoch seconds. */
export interface DeviceBinding {
  clientId:string;
  clientInstanceId:string;
  status:DeviceBindingStatus;
  deviceInfo:DeviceInfo;
  activatedAt:number;
  revokedAt?:number;
}

/** Optional regular-expression restrictions evaluated by the owning runtime. */
export interface DeviceRestrictions {
  manufacturer?:string;
  model?:string;
}

/**
 * A persisted licensed seat. Pool ownership, invited member, contact identifier,
 * accessible subject and concrete installations remain separate fields.
 * Numeric timestamps retain Unix epoch seconds. Optional legacy fields stay
 * optional; runtime admission validates employee categories and seat capacity.
 */
export interface DeviceLicense {
  id:string;
  tenantId:string;
  ownerOrganizationId?:string;
  authorizedSubjectDid?:string;
  orderId:string;
  activationCode?:string;
  userClass:DeviceUserClass;
  userCategory?:string;
  type:DeviceAppType;
  status:LicenseStatus;
  plan:string;
  renewalCycle:'1m'|'12m'|null;
  reactivationEnabled:boolean;
  issuedAt?:number;
  activatedAt?:number;
  exp:number;
  subjectId?:string;
  issuedToEmail?:string;
  issuedToPhone?:string;
  issuedToRole?:string;
  invitationId?:string;
  relatedPersonId?:string;
  deviceId?:string;
  maxDevices?:number;
  deviceBindings?:DeviceBinding[];
  activatedBy?:string;
  deviceRestrictions?:DeviceRestrictions;
  deviceInfo?:DeviceInfo;
}
