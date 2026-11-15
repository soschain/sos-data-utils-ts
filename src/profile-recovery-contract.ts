import type {ActorContactInput} from 'antifraud-data-utils-ts/organization-identity'

/** Existing controller recovery classification, not a role or authorization grant. */
export type ProfileRecoveryControllerKind='individual-controller'|'organization-controller'
export type ProfileRecoveryIdentity=Readonly<{
 profileId:string
 ownerId:string
 controllerKind:ProfileRecoveryControllerKind
}>&ActorContactInput

type StoredIdentity=Readonly<{
 profileId:string
 ownerId:string
 controllerKind:ProfileRecoveryControllerKind
}>
type RecoveryMaterial=Readonly<{
 kmsKeyName:string
 encryptedServerShare:string
 seedFingerprint:string
 generation:number
 createdAt:string
 rotatedAt?:string
}>

/** Versioned email fields are retained byte-for-byte; phone is a distinct AAD/contact domain. */
export type ProfileRecoveryRecord=StoredIdentity&RecoveryMaterial&(
 Readonly<{version:'uhc-profile-recovery-v1';verifiedEmail:string;contactKind?:never;verifiedTelephone?:never}>
 |Readonly<{version:'sos-profile-recovery-v1';contactKind:'phone';verifiedTelephone:string;verifiedEmail?:never}>
)

/** Outbox data only. Delivery, recipients and recovery admission remain host responsibilities. */
export type ProfileRecoveryNotification=StoredIdentity&Readonly<{
 eventId:string
 generation:number
 recoveredAt:string
}>&(
 Readonly<{version:'uhc-profile-recovery-notification-v1';verifiedEmail:string;contactKind?:never;verifiedTelephone?:never}>
 |Readonly<{version:'sos-profile-recovery-notification-v1';contactKind:'phone';verifiedTelephone:string;verifiedEmail?:never}>
)
