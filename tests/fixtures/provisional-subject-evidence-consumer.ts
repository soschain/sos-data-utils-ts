// Flow contract: pending evidence supports subjects without issued identifiers while preserving complete typed identifiers and explicit review methods when supplied.
import type {PendingSubjectEvidenceCommand,PendingSubjectEvidenceReceipt} from 'sos-data-utils-ts/provisional-subject-evidence'
import {IdentityEvidenceReviewMethods} from 'antifraud-data-utils-ts/identity-assurance'
import {REPOSITORY_SAFE_EXAMPLES as safe} from 'sos-data-utils-ts/repository-privacy'
const command:PendingSubjectEvidenceCommand={operationId:safe.resourceUuid,registrationId:safe.resourceUuid,verificationMethod:IdentityEvidenceReviewMethods.SupervisedRemote,subject:{},controller:{}}
// @ts-expect-error An explicit identifier must be complete.
const partial:PendingSubjectEvidenceCommand={...command,subject:{identifier:{system:'urn:synthetic:identifier'}}}
// @ts-expect-error A submitted review method does not invent a verification mode.
const automatic:PendingSubjectEvidenceCommand={...command,verificationMethod:'automatic'}
declare const receipt:PendingSubjectEvidenceReceipt
const pending:'pending'=receipt.status
// @ts-expect-error Uploading a file does not produce a signed credential.
const signed:'signed'=receipt.status
void [partial,automatic,pending,signed]
