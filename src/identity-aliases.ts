import { normalizeControllerAlias, normalizePublicAliasList, normalizeTelephoneAlias } from 'antifraud-data-utils-ts/public-aliases'

/** Credential exchange projection over the neutral alias owner; no possession or authority is inferred. */
export function normalizeIdentityAliases(value: unknown): string[] {
  return [...new Set(normalizePublicAliasList(value).map(normalizeControllerAlias).filter(Boolean))]
}
export const normalizeIdentityAliasCsv = (value: unknown): string => normalizeIdentityAliases(value).join(',')
export const normalizeIdentityTelephone = normalizeTelephoneAlias
