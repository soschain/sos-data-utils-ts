// Flow contract: no professional creator, provisional registration, browser authority or raw file metadata is required to describe pending controller evidence.
import type {ControllerIdentityEvidenceCommand,ControllerIdentityEvidenceReceipt} from 'sos-data-utils-ts/controller-identity-evidence'
import {REPOSITORY_SAFE_EXAMPLES as safe} from 'sos-data-utils-ts/repository-privacy'
const command:ControllerIdentityEvidenceCommand={operationId:safe.resourceUuid,verificationMethod:'sripp',subject:{},controller:{}}
const receipt:ControllerIdentityEvidenceReceipt={evidenceId:safe.resourceUuid,operationId:command.operationId,status:'pending',files:[{fileId:safe.resourceUuid,slot:'relationship'}]}
// @ts-expect-error Selecting a document does not verify identity.
const verified:ControllerIdentityEvidenceReceipt={...receipt,status:'verified'}
// @ts-expect-error Protected download has an opaque ID, never a supplied external URL.
const publicUrl:ControllerIdentityEvidenceReceipt={...receipt,files:[{...receipt.files[0]!,url:safe.didWeb}]}
// @ts-expect-error Private filename is not a receipt field.
const fileName:string=receipt.files[0]!.fileName
void [command,receipt,verified,publicUrl,fileName]
