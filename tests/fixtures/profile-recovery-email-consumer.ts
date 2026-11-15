// Flow contract: existing email recovery storage fields and notification versions remain source compatible.
import type {ProfileRecoveryIdentity,ProfileRecoveryRecord,ProfileRecoveryNotification} from 'sos-data-utils-ts/profile-recovery-contract';
import {REPOSITORY_SAFE_EXAMPLES as SAFE} from 'sos-data-utils-ts/repository-privacy';
const identity:ProfileRecoveryIdentity={profileId:SAFE.resourceUuid,ownerId:'synthetic-recovery-owner',controllerKind:'organization-controller',contactKind:'email',contact:SAFE.firstContactEmail};
const record:ProfileRecoveryRecord={version:'uhc-profile-recovery-v1',profileId:identity.profileId,ownerId:identity.ownerId,controllerKind:identity.controllerKind,verifiedEmail:SAFE.firstContactEmail,kmsKeyName:'synthetic-key',encryptedServerShare:'synthetic-ciphertext',seedFingerprint:'synthetic-fingerprint',generation:1,createdAt:'2026-11-15T00:00:00.000Z'};
const notification:ProfileRecoveryNotification={version:'uhc-profile-recovery-notification-v1',profileId:identity.profileId,ownerId:identity.ownerId,controllerKind:identity.controllerKind,verifiedEmail:SAFE.firstContactEmail,eventId:'synthetic-event',generation:2,recoveredAt:'2026-11-15T00:00:00.000Z'};
// @ts-expect-error A wire record is not proof of a recovery secret or current profile custody.
const secret:string=record.walletSeed;
void [identity,record,notification,secret];
