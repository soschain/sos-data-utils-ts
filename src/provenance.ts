// Copyright 2026 Connecting Solution & Applications Ltd under the Apache License, Version 2.0.
// Selectively migrated neutral contracts; source attribution is retained in NOTICE.
/** Browser-safe FHIR R5 Provenance flat-claim vocabulary and builders. */
import { normalizeUuid } from 'antifraud-data-utils-ts/organization-identity'

export const FhirR5ParticipationRoleTypeValueSet = 'http://hl7.org/fhir/ValueSet/participation-role-type' as const
export const FhirR5ProvenanceParticipantTypeSystem = 'http://terminology.hl7.org/CodeSystem/provenance-participant-type' as const
export const FhirR5ExtraSecurityRoleTypeSystem = 'http://terminology.hl7.org/CodeSystem/extra-security-role-type' as const
export const DicomControlledTerminologySystem = 'http://dicom.nema.org/resources/ontology/DCM' as const

/** Exact FHIR R5 ParticipationRoleType 5.0.0 expansion used by Provenance.agent.type. */
export const FhirR5ParticipationRoleTypeCodes = Object.freeze([
  'enterer', 'performer', 'author', 'verifier', 'legal', 'attester', 'informant',
  'custodian', 'assembler', 'composer', '110150', '110151', '110152', '110153',
  '110154', '110155', 'authserver', 'datacollector', 'dataprocessor', 'datasubject',
  'humanuser',
] as const)

export type FhirR5ParticipationRoleTypeCode = (typeof FhirR5ParticipationRoleTypeCodes)[number]

export type ProvenanceSearchParameterType = 'date' | 'reference' | 'token'
export type ProvenanceR5SearchParameter = Readonly<{ code: string; type: ProvenanceSearchParameterType; expression: string }>

/** Exact resource-specific FHIR R5 Provenance SearchParameters. */
export const ProvenanceR5SearchParameterCatalog: readonly ProvenanceR5SearchParameter[] = Object.freeze([
  { code: 'activity', type: 'token', expression: 'Provenance.activity' },
  { code: 'agent', type: 'reference', expression: 'Provenance.agent.who' },
  { code: 'agent-role', type: 'token', expression: 'Provenance.agent.role' },
  { code: 'agent-type', type: 'token', expression: 'Provenance.agent.type' },
  { code: 'based-on', type: 'reference', expression: 'Provenance.basedOn' },
  { code: 'encounter', type: 'reference', expression: 'Provenance.encounter' },
  { code: 'entity', type: 'reference', expression: 'Provenance.entity.what' },
  { code: 'location', type: 'reference', expression: 'Provenance.location' },
  { code: 'patient', type: 'reference', expression: 'Provenance.patient' },
  { code: 'recorded', type: 'date', expression: 'Provenance.recorded' },
  { code: 'signature-type', type: 'token', expression: 'Provenance.signature.type' },
  { code: 'target', type: 'reference', expression: 'Provenance.target' },
  { code: 'when', type: 'date', expression: 'Provenance.occurred.ofType(dateTime)' },
] as const)

const standardClaims = ProvenanceR5SearchParameterCatalog.map(parameter => `Provenance.${parameter.code}`)
const correlatedAgentClaims = FhirR5ParticipationRoleTypeCodes.map(code => `Provenance.agent-${code}-who`)

/** Standard search claims plus typed-agent correlation claims. */
export const ProvenanceFlatClaimCatalog: readonly string[] = Object.freeze([...standardClaims, ...correlatedAgentClaims])

export type ProvenanceR5FlatClaimsResource = Readonly<{
  resourceType: 'Provenance'
  id: string
  meta: Readonly<{ claims: Readonly<Record<string, readonly string[]>> }>
}>

/** Builds the FHIR PractitionerRole reference from the server-issued assignment UUID. */
export function buildPractitionerRoleReferenceFromAssignmentIdentifier(assignmentIdentifier: string): string {
  const compact = normalizeUuid(assignmentIdentifier)
  if (!compact) throw new TypeError('professional_assignment_identifier_invalid')
  const uuid = `${compact.slice(0, 8)}-${compact.slice(8, 12)}-${compact.slice(12, 16)}-${compact.slice(16, 20)}-${compact.slice(20)}`
  return `PractitionerRole/${uuid}`
}

/** Returns the correlated agent reference claim for one official participation type. */
export function provenanceAgentClaim(code: FhirR5ParticipationRoleTypeCode | string): string {
  if (!(FhirR5ParticipationRoleTypeCodes as readonly string[]).includes(code)) throw new TypeError('participation_role_type_invalid')
  return `Provenance.agent-${code}-who`
}

/** Returns the system-qualified FHIR token for one official participation type. */
export function participationRoleTypeToken(code: FhirR5ParticipationRoleTypeCode): string {
  const system = /^11015[0-5]$/.test(code)
    ? DicomControlledTerminologySystem
    : ['authserver', 'datacollector', 'dataprocessor', 'datasubject', 'humanuser'].includes(code)
      ? FhirR5ExtraSecurityRoleTypeSystem
      : FhirR5ProvenanceParticipantTypeSystem
  return `${system}|${code}`
}

/** Validates a claims-only Provenance resource and rejects nested/native fields. */
export function normalizeProvenanceR5FlatClaimsResource(candidate: unknown): ProvenanceR5FlatClaimsResource {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) throw new TypeError('provenance_flat_resource_invalid')
  const input = candidate as Record<string, unknown>
  if (input.resourceType !== 'Provenance' || typeof input.id !== 'string' || !input.id.trim()) throw new TypeError('provenance_flat_resource_invalid')
  if (Object.keys(input).some(key => !['resourceType', 'id', 'meta'].includes(key))) throw new TypeError('provenance_flat_resource_invalid')
  const meta = input.meta
  if (!meta || typeof meta !== 'object' || Array.isArray(meta) || Object.keys(meta).some(key => key !== 'claims')) throw new TypeError('provenance_flat_resource_invalid')
  const claims = (meta as Record<string, unknown>).claims
  if (!claims || typeof claims !== 'object' || Array.isArray(claims)) throw new TypeError('provenance_flat_resource_invalid')
  const normalized: Record<string, readonly string[]> = {}
  for (const [name, rawValue] of Object.entries(claims as Record<string, unknown>)) {
    if (!ProvenanceFlatClaimCatalog.includes(name)) throw new TypeError('provenance_flat_claim_invalid')
    const values = (Array.isArray(rawValue) ? rawValue : [rawValue]).map(value => String(value).trim()).filter(Boolean)
    if (!values.length) throw new TypeError('provenance_flat_claim_value_invalid')
    normalized[name] = Object.freeze(values)
  }
  return Object.freeze({ resourceType: 'Provenance', id: input.id.trim(), meta: Object.freeze({ claims: Object.freeze(normalized) }) })
}

/** Builds provenance for creation or update of a ResearchStudy with correlated typed agents. */
export function buildResearchStudyProvenanceResource(input: Readonly<{
  id: string
  researchStudyReference: string
  recorded: string
  agents: readonly Readonly<{ type: FhirR5ParticipationRoleTypeCode; who: string }>[]
}>): ProvenanceR5FlatClaimsResource {
  if (!input.researchStudyReference.startsWith('ResearchStudy/')) throw new TypeError('research_study_reference_invalid')
  const recorded = new Date(input.recorded)
  if (!Number.isFinite(recorded.getTime()) || recorded.toISOString() !== input.recorded) throw new TypeError('recorded_instant_invalid')
  if (!input.agents.length) throw new TypeError('provenance_agent_required')
  const claims: Record<string, string[]> = {
    'Provenance.target': [input.researchStudyReference],
    'Provenance.recorded': [input.recorded],
    'Provenance.agent': [],
    'Provenance.agent-type': [],
  }
  for (const agent of input.agents) {
    const who = String(agent.who || '').trim()
    if (!who) throw new TypeError('provenance_agent_who_required')
    claims['Provenance.agent'].push(who)
    claims['Provenance.agent-type'].push(participationRoleTypeToken(agent.type))
    const correlatedClaim = provenanceAgentClaim(agent.type)
    ;(claims[correlatedClaim] ||= []).push(who)
  }
  return normalizeProvenanceR5FlatClaimsResource({ resourceType: 'Provenance', id: input.id, meta: { claims } })
}
