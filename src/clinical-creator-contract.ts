import type { CompositionAttesterMode } from 'fhir-data-utils-ts'

/** SOS clinical creator profile categories, not a FHIR role code system. */
export const FhirIpsCreatorKinds = Object.freeze({
  IndividualSubject: 'individual-subject',
  IndividualMember: 'individual-member',
  Professional: 'professional',
} as const)
export type FhirIpsCreatorKind = typeof FhirIpsCreatorKinds[keyof typeof FhirIpsCreatorKinds]

/** Registered channel aliases are lookup data, never authentication evidence by themselves. */
export type ClinicalCreatorChannelAliases = Readonly<{
  actorDids?: readonly string[]
  verifiedContactIdentifiers?: readonly string[]
  dcrClientIds?: readonly string[]
  keyIds?: readonly string[]
}>

/** Durable person/assignment/owner binding. Historical authorIdentifier identifies
 * the RelatedPerson/PractitionerRole assignment used as attester, not the person
 * or the document author. Stable contacts and operational channel IDs are aliases.
 */
export type ClinicalCreatorBinding = ClinicalCreatorChannelAliases & Readonly<{
  kind: FhirIpsCreatorKind
  actorIdentifier: string
  authorIdentifier: string
  ownerIdentifier: string
  role: string
}>

/** High-level normalization input; implementations reject mismatched preferred
 * and historical assignment identifiers and require at least one of them.
 */
export type ClinicalCreatorBindingInput = ClinicalCreatorChannelAliases & Readonly<{
  kind: FhirIpsCreatorKind
  actorIdentifier: string
  assignmentIdentifier?: string
  /** @deprecated Use assignmentIdentifier for new input; persisted binding spelling remains unchanged. */
  authorIdentifier?: string
  ownerIdentifier: string
  role: string
}>

/** Caller-verified channel evidence. This type does not verify its own contents. */
export type AuthenticatedClinicalCreatorEvidence = Readonly<{
  actorDid?: string
  verifiedContactIdentifiers?: readonly string[]
  dcrClientId?: string
  keyId?: string
}>

/** Permission actor is the concrete assignment UUID plus its separately governed role. */
export type ClinicalCreatorPermissionActor = Readonly<{
  actorIdentifier: string
  actorRole: string
}>

export type FhirIpsCreatorBundleEntry = Readonly<{
  fullUrl: string
  resource: Readonly<Record<string, unknown>>
}>
type FhirIpsCreatorBase = Readonly<{ actorIdentifier: string; authorIdentifier: string }>
export type FhirIpsCreatorAuthorInput = FhirIpsCreatorBase & (
  | Readonly<{ kind: typeof FhirIpsCreatorKinds.IndividualSubject; subjectReference: string }>
  | Readonly<{ kind: typeof FhirIpsCreatorKinds.IndividualMember; subjectReference: string; role: string }>
  | Readonly<{ kind: typeof FhirIpsCreatorKinds.Professional; organizationReference: string; role: string }>
)
/** Historical role-as-author projection; new callers should use provenance. */
export type FhirIpsCreatorAuthor = Readonly<{
  authorReference: string
  entries: readonly FhirIpsCreatorBundleEntry[]
}>
export type FhirIpsCreatorProvenanceInput = FhirIpsCreatorAuthorInput & Readonly<{
  compositionAuthorReference?: string
  attesterMode?: CompositionAttesterMode
  attestedAt?: string
}>
/** Source authorship remains separate from the person/assignment attesting it. */
export type FhirIpsCreatorProvenance = Readonly<{
  authorReference: string
  attesters: readonly Readonly<{
    mode: CompositionAttesterMode
    party: Readonly<{ reference: string }>
    time?: string
  }>[]
  entries: readonly FhirIpsCreatorBundleEntry[]
}>

/** Narrow update-policy outcome, never an authenticated grant or delete permission. */
export const ClinicalResourceReplacementDecision = Object.freeze({
  AllowOrganizationSuccessor: 'allow-organization-successor',
  Deny: 'deny',
} as const)
export type ClinicalResourceReplacementDecisionValue = typeof ClinicalResourceReplacementDecision[keyof typeof ClinicalResourceReplacementDecision]
export type ClinicalResourceVersionIdentity = Readonly<{
  resourceId: string
  authorOwnerIdentifier: string
  documentDate: string
}>
export type ClinicalResourceReplacementInput = Readonly<{
  existing: ClinicalResourceVersionIdentity
  incoming: ClinicalResourceVersionIdentity
}>
/** Descriptive ownership resolved from an imported document graph, not verified authority. */
export type ClinicalDocumentAuthorOrganization = Readonly<{
  authorReference: string
  organizationReference: string
  documentDate: string
}>
