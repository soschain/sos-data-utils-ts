// Flow contract: a legacy stored profile needs no invented key, revision or tenant issuer; its required PIN envelope and account/route bindings remain strongly typed.
import type {RegisteredProfileBinding,RegisteredProfileRecord,RegisteredProfileSessionRecord} from '../../src/registered-profile-contract.js'
import type {PinProtectedProfileSecret} from '../../src/server-profile-secret-contract.js'
import {REPOSITORY_SAFE_EXAMPLES as safe} from '../../src/repository-privacy.js'
declare const protectedWalletSeed:PinProtectedProfileSecret
const binding:RegisteredProfileBinding={ownerId:'synthetic-owner',profileId:'synthetic-profile',actorDid:safe.didWeb,providerDid:safe.didWeb,routeContext:{tenantId:safe.tenantId,jurisdiction:safe.countryIso2,sector:'health-tech'}}
const legacy:RegisteredProfileRecord={...binding,actorKind:'organization_employee',actorMode:'member',profileDid:safe.didWeb,allowedSubjectDids:[],clientId:'synthetic-client',deviceDid:safe.didWeb,publicJwks:[],protectedWalletSeed,failedUnlocks:0,createdAt:'2026-01-01T00:00:00Z',updatedAt:'2026-01-01T00:00:00Z'}
const session:RegisteredProfileSessionRecord={sessionId:'synthetic-session',ownerId:binding.ownerId,profileId:binding.profileId,scopes:[],sealedUnlockedWalletSeed:'synthetic-host-envelope',expiresAt:'2026-01-01T00:05:00Z'}
const revised:RegisteredProfileRecord={...legacy,credentialRevision:1}
// @ts-expect-error Raw seed strings cannot replace the PIN-and-host envelope.
const plaintext:RegisteredProfileRecord={...legacy,protectedWalletSeed:'synthetic-plaintext'}
// @ts-expect-error Each session is bound to an account and profile, not just a browser token.
const ownerless:RegisteredProfileSessionRecord={sessionId:'synthetic-session',profileId:binding.profileId,scopes:[],sealedUnlockedWalletSeed:'synthetic-host-envelope',expiresAt:'2026-01-01T00:05:00Z'}
void [session,revised,plaintext,ownerless]
