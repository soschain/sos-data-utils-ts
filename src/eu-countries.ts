// Copyright 2026 Antifraud Services Inc. under the Apache License, Version 2.0.

/**
 * ISO 3166-1 alpha-2 country codes that currently belong to the European Union.
 *
 * This list is intentionally kept in a runtime-neutral shared package because
 * dataspace discovery may need to infer a broader coverage scope such as `EU`
 * from the semantic country carried in a VC `credentialSubject`.
 */
export const EU_COUNTRY_CODES = Object.freeze([
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'HU',
  'IE',
  'IT',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SK',
  'SI',
  'ES',
  'SE',
] as const);

export type EuCountryCode = typeof EU_COUNTRY_CODES[number];

/**
 * Normalizes a country code into canonical uppercase ISO-2 form.
 *
 * @param countryCode Country code from `credentialSubject.address.addressCountry`
 * or the flattened operational projection.
 * @returns Uppercase ISO-2 form or an empty string when the input is blank.
 *
 * @example
 * ```ts
 * normalizeCountryCode('es');
 * // 'ES'
 * ```
 */
export function normalizeCountryCode(countryCode: string | undefined | null): string {
  return String(countryCode || '').trim().toUpperCase();
}

/**
 * Checks whether the supplied country code belongs to the current EU member set.
 *
 * @param countryCode ISO-2 country code to evaluate.
 * @returns `true` when the normalized code belongs to `EU_COUNTRY_CODES`.
 *
 * @example
 * ```ts
 * isEuCountryCode('ES');
 * // true
 * ```
 */
export function isEuCountryCode(countryCode: string | undefined | null): boolean {
  const normalized = normalizeCountryCode(countryCode);
  return normalized ? (EU_COUNTRY_CODES as readonly string[]).includes(normalized) : false;
}
