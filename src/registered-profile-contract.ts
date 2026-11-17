import type {ActorKind} from 'antifraud-data-utils-ts/actor-kinds'
import type {CompositionAttesterMode} from 'fhir-data-utils-ts'
import type {ClinicalCreatorBinding} from './clinical-creator-contract.js'
import type {RouteContext} from './gateway-transport-contract.js'
import type {PinProtectedProfileSecret} from './server-profile-secret-contract.js'
import type {ClassicPublicJwk} from 'antifraud-data-utils-ts/cryptography'

/** Governed relationship semantics; a stored tag is not relationship evidence. */
export type RegisteredProfileActorMode='self'|'controller'|'member'
/** Persisted storage-policy labels; the runtime must still enforce the selected cryptographic profile. */
export type RegisteredProfileStoragePolicy='confidential-basic-v1'|'confidential-pqc-v1'
export type RegisteredProfileAttester=Readonly<{
 mode:CompositionAttesterMode
 party:Readonly<{reference:string}>
}>
/** Exact account and routed organization context supplied by the trusted host. */
export type RegisteredProfileBinding=Readonly<{
 ownerId:string
 profileId:string
 actorDid:string
 providerDid:string
 routeContext:RouteContext
}>
/**
 * Durable registered custody metadata. Existing field spellings and protected
 * envelope bytes remain unchanged. Missing optional keys/revision are retained
 * for reading historical records; they never authorize replacement enrollment.
 */
export type RegisteredProfileRecord=RegisteredProfileBinding&Readonly<{
 walletKeyDerivationId?:string
 actorKind:ActorKind
 actorMode:RegisteredProfileActorMode
 profileDid:string
 allowedSubjectDids:string[]
 clientId:string
 clientInstanceId?:string
 attester?:RegisteredProfileAttester
 clinicalCreatorBinding?:ClinicalCreatorBinding
 deviceDid:string
 publicJwks:Record<string,unknown>[]
 storagePublicJwk?:Record<string,unknown>
 confidentialStorageProfile?:RegisteredProfileStoragePolicy
 protectedWalletSeed:PinProtectedProfileSecret
 protectedVpToken?:PinProtectedProfileSecret
 failedUnlocks:number
 lockedUntil?:string
 createdAt:string
 updatedAt:string
 /** Exact server-verified Organization identifier claim, never synthesized from route fields. */
 tenantIssuer?:string
 /** Absent on historical records; runtimes interpret absence as revision zero. */
 credentialRevision?:number
}>
/** A directory-returned subject assignment, not an independent grant of access. */
export type RegisteredProfileAuthorizedSubject=Readonly<{
 subjectDid:string
 transportSubjectDid?:string
 actorMode:RegisteredProfileActorMode
 attester?:RegisteredProfileAttester
}>
/** Host-only ephemeral custody; no seed or bearer appears as plaintext in persistence. */
export type RegisteredProfileSessionRecord=Readonly<{
 sessionId:string
 ownerId:string
 profileId:string
 subjectDid?:string
 selectedSubjectDid?:string
 scopes:string[]
 authorizedSubjectDids?:string[]
 authorizedSubjects?:RegisteredProfileAuthorizedSubject[]
 actorMode?:RegisteredProfileActorMode
 attester?:RegisteredProfileAttester
 sealedUnlockedWalletSeed:string
 sealedUnlockedVpToken?:string
 sealedAccessToken?:string
 expiresAt:string
 credentialRevision?:number
}>

/** Existing sealed BFF wallet-session row; no plaintext seed or bearer is stored. */
export type SealedProfileWalletSessionRecord=Readonly<{
 id:string
 ownerId:string
 profileId:string
 sealedWalletSeed:string
 expiresAt:string
 /** Historical absence is revision zero; a newer profile revision makes it stale. */
 credentialRevision?:number
}>

/** Fixed wire/signing profiles, selected by an admitted server use case rather than browser policy. */
export const StoredProfileSignatureProfiles=Object.freeze({
 IndividualIdentityPresentation:'individual-identity-presentation-v1',
 OrganizationActorDetachedCredential:'organization-actor-detached-credential-v1',
} as const)

/** One signature request; this contract grants no role, relationship, licence or SMART access. */
export type StoredProfileSignatureCommand=
 |Readonly<{
  profile:typeof StoredProfileSignatureProfiles.IndividualIdentityPresentation
  subjectDid:string
  claims:Readonly<Record<string,unknown>>
 }>
 |Readonly<{
  profile:typeof StoredProfileSignatureProfiles.OrganizationActorDetachedCredential
  /** Detached signing retains these exact bytes without JSON reserialization. */
  payload:string|Uint8Array
 }>

/** Signature and sanitized public material only; no ciphertext, token or seed is returned. */
export type StoredProfileSignatureResult=Readonly<{
 jws:string
 verificationMethod:string
 publicJwk:Readonly<ClassicPublicJwk&{crv:'P-384';alg:'ES384';use:'sig';kid:string}>
}>
