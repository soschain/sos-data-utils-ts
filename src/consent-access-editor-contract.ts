import {Format} from './bff-wire-contract.js'
import {PermissionTemplateOperationCodes,PermissionTemplateTargetKinds} from './permission-templates.js'
import type {BundleEntry,BundleJsonApi,BundleRequest} from './bundle-contract.js'
import type {HealthcareCanonicalSectionFamily} from './healthcare-sections.js'
import type {HealthcareRoleFamily} from './healthcare-roles.js'

/** Operational claims context; native FHIR JSON is an explicit projection boundary. */
export const CommunicationClaimsContext=Format.FHIR_API
export const BundleEntryClaimsContext=Format.FHIR_API
export const ConsentEditorEntryType='Consent-edit-request-v1.0' as const
export const ConsentEditorScopeCodes=PermissionTemplateOperationCodes
export const ConsentEditorTargetKinds=PermissionTemplateTargetKinds
export type ConsentEditorScopeCode=typeof ConsentEditorScopeCodes[keyof typeof ConsentEditorScopeCodes]
export type ConsentEditorTargetKind=typeof ConsentEditorTargetKinds[keyof typeof ConsentEditorTargetKinds]
export type ConsentEditorClassifiedScope=Readonly<{code:ConsentEditorScopeCode;display?:string}>
export type ConsentEditorClassifiedTarget=Readonly<{
  target:Readonly<{kind:ConsentEditorTargetKind;code:string;display?:string;sectionFamily?:HealthcareCanonicalSectionFamily}>
  scopes:readonly ConsentEditorClassifiedScope[]
}>
export type ConsentEditorClassifiedActorRole=Readonly<{codingSystem:string;code:string;display?:string}>
export type ConsentEditorClassifiedRoleKind=HealthcareRoleFamily
export type ConsentEditorClassifiedRole=ConsentEditorClassifiedActorRole & Readonly<{kind?:ConsentEditorClassifiedRoleKind;definition?:string}>
export type ConsentEditorClassifiedRoles=Readonly<{
  professional:readonly ConsentEditorClassifiedRole[];relationship:readonly ConsentEditorClassifiedRole[]
  legalRepresentative:readonly ConsentEditorClassifiedRole[];other:readonly ConsentEditorClassifiedRole[]
}>
export type ConsentEditorClassifiedDepartment=Readonly<{code:string;display?:string}>
export type ConsentEditorClassifiedLocation=Readonly<{code:string;display?:string}>
export type ConsentEditorClassifiedOrganization=Readonly<{
  domain:string;display?:string;departments:readonly ConsentEditorClassifiedDepartment[];locations:readonly ConsentEditorClassifiedLocation[]
}>
export type ConsentEditorClassifiedJurisdiction=Readonly<{code:string;display?:string}>
export type ConsentEditorClassifiedUser=Readonly<{email?:string;phone?:string;role?:ConsentEditorClassifiedActorRole}>
export type ConsentEditorClassifiedActors=Readonly<{
  jurisdictions:readonly ConsentEditorClassifiedJurisdiction[];organizations:readonly ConsentEditorClassifiedOrganization[];users:readonly ConsentEditorClassifiedUser[]
}>
export type ConsentEditorClassifiedPurpose=Readonly<{code:string;display?:string}>

/** Editable metadata only: status, evidence, approval and effective authority remain separate. */
export type ConsentViewModel=Readonly<{
  fullUrl?:string;identifier:string;subject:string;decision:string;classifiedActors:ConsentEditorClassifiedActors
  classifiedRoles:ConsentEditorClassifiedRoles;classifiedPurposes:readonly ConsentEditorClassifiedPurpose[];classifiedTargets:readonly ConsentEditorClassifiedTarget[]
}>
export type ActiveEntrySelection=Readonly<{position?:number;index?:number;fullUrl?:string}>
export type UpsertClaimsResourceEntryInput<Claims extends object=Record<string,unknown>>=Readonly<{
  claims:Claims;type?:string;fullUrl?:string;request?:BundleRequest
}>
export type CommunicationAttachedBundleSessionOptions=Readonly<{
  communicationClaims?:Record<string,unknown>;initialBundle?:BundleJsonApi<BundleEntry>
}>
