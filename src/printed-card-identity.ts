import { computeDammCheckDigit } from './subject-card-checksum.js'
import { HUMAN_SPECIES_ID7, normalizeSubjectSpeciesId7 } from './subject-card-index.js'

/** Exact printed-wire compatibility profiles; none represents identity verification or allocation. */
export type PrintedAnimalCardInput = Readonly<{
  profile: 'animal21-v1'
  speciesId7: string
  jurisdictionCode5: string
  animalNumericId15: string
}>
export type PrintedAnimalCardValidationInput = Readonly<{
  profile: 'animal21-v1'
  speciesId7: string
  cardNumber21: string
}>
export type PrintedHumanCardInput = Readonly<{
  profile: 'human21-v1'
  providerCode9: string
  subjectCode12: string
}>
export type PrintedHumanCardDidWebInput = Readonly<{
  profile: 'uhc-personal-v1'
  host: string
  cardNumber21: string
}>
export type ProviderScopedPersonalDigitsInput = Readonly<{
  profile: 'provider-damm-v1'
  providerId: string
  personalIdWithoutCheckDigit: string
}>

function requireProfile(actual: string, expected: string): void {
  if (actual !== expected) throw new TypeError('printed_card_profile_required')
}

/** Animal-only taxonomy context, including the historical seven-digit upper bound. */
export function normalizePrintedAnimalSpeciesId7(ncbiTaxonomyId: string): string {
  const species = normalizeSubjectSpeciesId7(ncbiTaxonomyId)
  if (species === HUMAN_SPECIES_ID7) throw new TypeError('Human NCBI Taxonomy identifier 9606 is not valid for an animal.')
  return species
}

function animalDigits(value: string, length: number, name: string): string {
  const source = String(value || '').trim()
  if (!source || !/^[0-9\s-]+$/u.test(source)) throw new TypeError(name + ' must contain decimal digits only.')
  const digits = source.replace(/[\s-]/gu, '')
  if (digits.length !== length) throw new TypeError(name + ' must contain exactly ' + length + ' digits.')
  return digits
}

/** jurisdiction5 + animal15 + Damm(species7 + jurisdiction5 + animal15). */
export function buildPrintedAnimalCardNumber21(input: PrintedAnimalCardInput): string {
  requireProfile(input.profile, 'animal21-v1')
  const jurisdiction = animalDigits(input.jurisdictionCode5, 5, 'jurisdictionCode5')
  const species = normalizePrintedAnimalSpeciesId7(input.speciesId7)
  const animal = animalDigits(input.animalNumericId15, 15, 'animalNumericId15')
  return jurisdiction + animal + computeDammCheckDigit(species + jurisdiction + animal)
}

/** A transcription check only; species context is not printed in these 21 digits. */
export function validatePrintedAnimalCardNumber21(input: PrintedAnimalCardValidationInput): boolean {
  try {
    requireProfile(input.profile, 'animal21-v1')
    const card = animalDigits(input.cardNumber21, 21, 'cardNumber21')
    return card === buildPrintedAnimalCardNumber21({
      profile: 'animal21-v1',
      speciesId7: input.speciesId7,
      jurisdictionCode5: card.slice(0, 5),
      animalNumericId15: card.slice(5, 20),
    })
  } catch {
    return false
  }
}

function humanDigits(value: string, length: number, name: string): string {
  const source = String(value || '').trim()
  // Deliberately ASCII space here: the original human and animal profiles differ on tabs.
  if (!source || !/^[0-9 -]+$/u.test(source)) throw new TypeError(name + ' must contain only decimal digits, spaces or hyphens.')
  const digits = source.replace(/\D/gu, '')
  if (digits.length !== length) throw new TypeError(name + ' must contain exactly ' + length + ' digits.')
  return digits
}

function validatedHumanCard(value: string): string {
  const card = humanDigits(value, 21, 'cardNumber21')
  if (card.slice(20) !== computeDammCheckDigit(card.slice(0, 20))) throw new TypeError('cardNumber21 has an invalid Damm check digit')
  return card
}

/** Provider9 followed by the supplied checked personal12; does not allocate an individual. */
export function buildPrintedHumanCardNumber21(input: PrintedHumanCardInput): string {
  requireProfile(input.profile, 'human21-v1')
  return validatedHumanCard(humanDigits(input.providerCode9, 9, 'providerCode9') + humanDigits(input.subjectCode12, 12, 'subjectCode12'))
}

/** Retains the existing human locator namespace and literal hostname port spelling. */
export function buildPrintedHumanCardDidWeb(input: PrintedHumanCardDidWebInput): string {
  requireProfile(input.profile, 'uhc-personal-v1')
  const host = String(input.host || '').trim().toLowerCase()
  if (!/^[a-z0-9.-]+(?::\d+)?$/u.test(host)) throw new TypeError('host must be a hostname or hostname:port')
  return 'did:web:' + host + ':card:uhc:personal:' + validatedHumanCard(input.cardNumber21)
}

function providerDigits(value: string, name: string): string {
  const source = String(value || '').trim()
  if (!source || !/^[0-9:\-\s]+$/u.test(source)) throw new TypeError(name + ' must contain digits, spaces, colons or hyphens')
  const digits = source.replace(/\D/gu, '')
  if (!digits) throw new TypeError(name + ' must contain at least one digit')
  return digits
}

/** Deterministic composition; callers retain their existing length, random sampling and grouping policy. */
export function buildProviderScopedPersonalDigits(input: ProviderScopedPersonalDigitsInput): string {
  requireProfile(input.profile, 'provider-damm-v1')
  const personal = providerDigits(input.personalIdWithoutCheckDigit, 'personalIdWithoutCheckDigit')
  const provider = providerDigits(input.providerId, 'providerId')
  return personal + computeDammCheckDigit(provider + personal)
}
