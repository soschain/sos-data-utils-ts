import {encodeMultibaseSha3} from 'antifraud-data-utils-ts/encoding'
import {REPOSITORY_SAFE_EXAMPLES as safe} from './repository-privacy.js'
import type {NetworkSubjectRegistrationResult} from './individual-registration-contract.js'

const bytes=Uint8Array.from(safe.resourceUuid.replaceAll('-','').match(/../gu)!,value=>Number.parseInt(value,16))

/** Governed synthetic contract fixture for tests/examples only; never a selected provider, fallback identity or issued card. */
export const NETWORK_SUBJECT_REGISTRATION_EXAMPLE:NetworkSubjectRegistrationResult=Object.freeze({
 mode:'network',operationId:safe.resourceUuid,
 registration:Object.freeze({identity:Object.freeze({organizationId:safe.resourceUuid,canonicalSubjectIdentifier:`${safe.didWeb}:individual:multibase:${encodeMultibaseSha3(bytes,384)}`,publicCardAlias:`${safe.didWeb}:card:synthetic-subject`,providerDid:safe.didWeb}),offerId:'synthetic-registration-offer'}),
 controllerInvitation:Object.freeze({status:'pending'}),
})
