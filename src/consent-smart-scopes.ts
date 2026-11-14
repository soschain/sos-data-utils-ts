import { FHIR_IPS_DOCUMENT_CODE, type ConsentRule } from 'fhir-data-utils-ts'
import type { ConsentActorDescriptor, EffectiveAccessEvaluation } from './consent-access.js'
import { evaluateConsentCoverage } from './consent-coverage.js'
import { HealthcareSummarySections } from './healthcare-sections.js'

/** SOS gateway scope profile, not a general SMART authorization implementation. */
export type ScopeSmartCompositionAccessOptions = {
  subjectDid: string
  sections?: string | string[]
  accessVerb?: 'r' | 'rs' | 'cruds'
}
/** @deprecated Use ScopeSmartCompositionAccessOptions. */
export type SmartCompositionReadScopeOptions = ScopeSmartCompositionAccessOptions
export type DeriveGrantedSmartScopesInput = Readonly<{
  requestedScopes: string | readonly string[]
  actor: ConsentActorDescriptor
  actorRole?: string
  purpose?: string
  now?: string | Date
  availableSections?: readonly string[]
}>
export type GrantedSmartScopesDecision = 'granted' | 'partial' | 'denied'
export type GrantedSmartScopesResult = Readonly<{
  subject: string
  decision: GrantedSmartScopesDecision
  grantedScopes: string[]
  deniedScopes: string[]
  grantedSections: string[]
  deniedSections: string[]
  evaluations: EffectiveAccessEvaluation[]
}>
const unique = (values: readonly string[]) => [...new Set(values)]

/** Builds a transport value only; it neither evaluates Consent nor grants access. */
export function buildScopeSmartCompositionAccess(options: ScopeSmartCompositionAccessOptions): string {
  const subject = String(options.subjectDid || '').trim()
  if (!subject) throw new Error('Composition scope requires a subject.')
  const sections = (Array.isArray(options.sections) ? options.sections : [options.sections ?? `LOINC|${FHIR_IPS_DOCUMENT_CODE}`])
    .map(section => section.trim()).filter(Boolean)
  const query = new URLSearchParams({ subject })
  if (sections.length) query.set('section', sections.join(','))
  return `organization/Composition.${options.accessVerb ?? 'rs'}?${query}`
}
/** @deprecated Use buildScopeSmartCompositionAccess. */
export const buildSmartCompositionReadScope = buildScopeSmartCompositionAccess

/** Pure requested/consented intersection. The trusted caller authenticates actors and signs grants. */
export function deriveGrantedSmartScopes(rules: readonly ConsentRule[], input: DeriveGrantedSmartScopesInput): GrantedSmartScopesResult {
  const requested = (typeof input.requestedScopes === 'string' ? [input.requestedScopes] : input.requestedScopes)
    .map(value => value.trim()).filter(Boolean)
  if (!requested.length) throw new Error('At least one Composition scope is required.')
  const available = unique((input.availableSections?.length ? input.availableSections : Object.values(HealthcareSummarySections).map(section => `LOINC|${section.code}`))
    .map(value => value.trim()).filter(Boolean))
  const parsed = requested.map(raw => {
    const question = raw.indexOf('?')
    const head = question < 0 ? raw : raw.slice(0, question)
    const query = new URLSearchParams(question < 0 ? '' : raw.slice(question + 1))
    const subject = (query.get('subject') ?? '').trim()
    if (!subject) throw new Error('Every Composition scope must pin one subject.')
    const verb = /^organization\/Composition\.(r|rs)$/.exec(head)?.[1] as 'r' | 'rs' | undefined
    const filters = [...query.keys()]
    const validFilters = filters.every(key => key === 'subject' || key === 'section') && unique(filters).length === filters.length
    const sectionTokens = (query.get('section') ?? '').split(',').map(value => value.trim()).filter(Boolean)
    const sections = unique(!sectionTokens.length || sectionTokens.includes('*') ? available : sectionTokens)
    return { raw, subject, verb, sections, supported: Boolean(verb && validFilters && sections.length) }
  })
  const subjects = unique(parsed.map(scope => scope.subject))
  if (subjects.length !== 1) throw new Error('Composition scopes must share one subject.')
  const subject = subjects[0]
  const grantedScopes: string[] = [], deniedScopes: string[] = [], grantedSections: string[] = [], deniedSections: string[] = []
  const evaluations: EffectiveAccessEvaluation[] = []
  for (const scope of parsed) {
    if (!scope.supported) {
      deniedScopes.push(scope.raw)
      deniedSections.push(...scope.sections)
      continue
    }
    const granted: string[] = []
    for (const section of scope.sections) {
      const evaluation = evaluateConsentCoverage([...rules], { subject, actor: input.actor, actorRole: input.actorRole, purpose: input.purpose, now: input.now, sections: [section], resourceTypes: ['Composition'] })
      evaluations.push(evaluation)
      if (evaluation.allowed) { granted.push(section); grantedSections.push(section) }
      else deniedSections.push(section)
    }
    if (granted.length) grantedScopes.push(buildScopeSmartCompositionAccess({ subjectDid: subject, sections: granted, accessVerb: scope.verb }))
    if (granted.length !== scope.sections.length) deniedScopes.push(scope.raw)
  }
  const grants = unique(grantedScopes), denials = unique(deniedScopes)
  const denied = unique(deniedSections).filter(section => !grantedSections.includes(section))
  return { subject, decision: !grants.length ? 'denied' : denials.length || denied.length ? 'partial' : 'granted', grantedScopes: grants, deniedScopes: denials, grantedSections: unique(grantedSections), deniedSections: denied, evaluations }
}
