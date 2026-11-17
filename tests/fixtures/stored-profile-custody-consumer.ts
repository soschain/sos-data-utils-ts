// Flow contract: fixed signing commands retain existing profile/session binding and public-only results without introducing wallet algorithms, private keys or persisted envelope rewrites.
import {StoredProfileSignatureProfiles} from '../../dist/index.js'
import type {SealedProfileWalletSessionRecord,StoredProfileSignatureCommand,StoredProfileSignatureResult} from '../../dist/registered-profile-contract.js'
import {REPOSITORY_SAFE_EXAMPLES as safe} from '../../dist/repository-privacy.js'

const session:SealedProfileWalletSessionRecord={id:'synthetic-session-digest',ownerId:'synthetic-owner',profileId:'synthetic-profile',sealedWalletSeed:'synthetic-ciphertext',expiresAt:'2099-01-01T00:00:00Z'}
const presentation:StoredProfileSignatureCommand={profile:StoredProfileSignatureProfiles.IndividualIdentityPresentation,subjectDid:safe.subjectCardProviders.animalIndexDid,claims:{iss:safe.didWeb}}
const detached:StoredProfileSignatureCommand={profile:StoredProfileSignatureProfiles.OrganizationActorDetachedCredential,payload:new Uint8Array([1,2])}
declare const result:StoredProfileSignatureResult
const signature:string=result.jws
const curve:'P-384'=result.publicJwk.crv
// @ts-expect-error A presentation command requires the exact selected subject.
const missingSubject:StoredProfileSignatureCommand={profile:StoredProfileSignatureProfiles.IndividualIdentityPresentation,claims:{}}
// @ts-expect-error The API does not accept arbitrary algorithm/purpose overrides.
const arbitrary:StoredProfileSignatureCommand={profile:StoredProfileSignatureProfiles.OrganizationActorDetachedCredential,payload:'synthetic',algorithm:'ES256K'}
// @ts-expect-error Private JWK material is not part of the public result.
result.publicJwk.d
// @ts-expect-error Raw tokens/seeds are not exposed in a signature result.
result.walletSeed
void[session,presentation,detached,signature,curve,missingSubject,arbitrary]
