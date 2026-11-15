// Flow contract: verified phone recovery is never serialized into a legacy email field.
import type {ProfileRecoveryIdentity,ProfileRecoveryRecord,ProfileRecoveryNotification} from 'sos-data-utils-ts/profile-recovery-contract';
import {REPOSITORY_SAFE_EXAMPLES as SAFE} from 'sos-data-utils-ts/repository-privacy';
const identity:ProfileRecoveryIdentity={profileId:SAFE.resourceUuid,ownerId:'synthetic-recovery-owner',controllerKind:'organization-controller',contactKind:'phone',contact:SAFE.phoneE164};
const record:ProfileRecoveryRecord={version:'sos-profile-recovery-v1',profileId:identity.profileId,ownerId:identity.ownerId,controllerKind:identity.controllerKind,contactKind:'phone',verifiedTelephone:SAFE.phoneE164,kmsKeyName:'synthetic-key',encryptedServerShare:'synthetic-ciphertext',seedFingerprint:'synthetic-fingerprint',generation:1,createdAt:'2026-11-15T00:00:00.000Z'};
const notification:ProfileRecoveryNotification={version:'sos-profile-recovery-notification-v1',profileId:identity.profileId,ownerId:identity.ownerId,controllerKind:identity.controllerKind,contactKind:'phone',verifiedTelephone:SAFE.phoneE164,eventId:'synthetic-event',generation:2,recoveredAt:'2026-11-15T00:00:00.000Z'};
// @ts-expect-error A phone record cannot also present an email identity.
const mixed:ProfileRecoveryRecord={...record,verifiedEmail:SAFE.firstContactEmail};
// @ts-expect-error The stored version determines which explicit contact branch is permitted.
const wrongVersion:ProfileRecoveryRecord={...record,version:'uhc-profile-recovery-v1'};
// @ts-expect-error Only the existing governed controller kinds can describe recovery storage.
const unsupported:ProfileRecoveryIdentity={...identity,controllerKind:'employee'};
void [identity,record,notification,mixed,wrongVersion,unsupported];
