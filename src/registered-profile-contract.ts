import type {ActorKind} from 'antifraud-data-utils-ts/actor-kinds'
import type {CompositionAttesterMode} from 'fhir-data-utils-ts'
import type {ClinicalCreatorBinding} from './clinical-creator-contract.js'
import type {RouteContext} from './gateway-transport-contract.js'
import type {PinProtectedProfileSecret} from './server-profile-secret-contract.js'

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
