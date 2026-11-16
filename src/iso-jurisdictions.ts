// Copyright 2026 Connecting Solution & Applications Ltd under the Apache License, Version 2.0.
// Selectively migrated neutral contracts; source attribution is retained in NOTICE.
import { Iso3166CountryData, Iso3166SubdivisionData } from './iso-jurisdictions-data.js'

export type Iso3166Country = Readonly<{
  code: string
  name: string
}>

export type Iso3166Subdivision = Readonly<{
  code: string
  countryCode: string
  name: string
  parentCode?: string
  type: string
}>

export const Iso3166Countries: readonly Iso3166Country[] = Object.freeze(
  Iso3166CountryData.map(country => Object.freeze({ ...country })),
)

export const Iso3166Subdivisions: readonly Iso3166Subdivision[] = Object.freeze(
  Iso3166SubdivisionData.map(subdivision => Object.freeze({ ...subdivision })),
)

const countryCodes = new Set(Iso3166Countries.map(({ code }) => code))
const mutableSubdivisionsByCountry = new Map<string, Iso3166Subdivision[]>()
const subdivisionCodes = new Set<string>()

for (const subdivision of Iso3166Subdivisions) {
  subdivisionCodes.add(subdivision.code)
  const current = mutableSubdivisionsByCountry.get(subdivision.countryCode) ?? []
  current.push(subdivision)
  mutableSubdivisionsByCountry.set(subdivision.countryCode, current)
}
const subdivisionsByCountry = new Map(
  [...mutableSubdivisionsByCountry].map(([countryCode, subdivisions]) => [
    countryCode,
    Object.freeze(subdivisions),
  ]),
)

export function isIso3166CountryCode(value: string): boolean {
  return countryCodes.has(value)
}

export function iso3166SubdivisionsForCountry(countryCode: string): readonly Iso3166Subdivision[] {
  if (!isIso3166CountryCode(countryCode)) return []
  return subdivisionsByCountry.get(countryCode) ?? []
}

export function isIso3166SubdivisionForCountry(
  subdivisionCode: string,
  countryCode: string,
): boolean {
  return subdivisionCode.startsWith(`${countryCode}-`)
    && subdivisionCodes.has(subdivisionCode)
}
