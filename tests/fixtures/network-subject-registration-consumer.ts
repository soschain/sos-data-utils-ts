import {assertNetworkSubjectRegistrationResult,type NetworkSubjectRegistrationResult} from 'sos-data-utils-ts/individual-registration-contract'
import {assertNetworkSubjectRegistrationResult as rootAssertion} from 'sos-data-utils-ts'

declare const response:unknown
assertNetworkSubjectRegistrationResult(response)
const result:NetworkSubjectRegistrationResult=response
const mode:'network'=result.mode
const pending:'pending'=result.controllerInvitation.status
const canonical:string=result.registration.identity.canonicalSubjectIdentifier
const publicAlias:string=result.registration.identity.publicCardAlias
const equivalent:typeof assertNetworkSubjectRegistrationResult=rootAssertion
// @ts-expect-error Registration does not establish accepted responsibility.
const accepted:'accepted'=result.controllerInvitation.status
// @ts-expect-error A proposed controller actor is not inferred from registration.
const actor=result.registration.identity.controllerActorDid
void [mode,pending,canonical,publicAlias,equivalent,accepted,actor]
