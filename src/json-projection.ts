/**
 * Index-friendly projection of JSON-shaped records. Undefined array entries are
 * removed, not replaced with null. This is not FHIR or JCS canonicalization.
 */
export function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) return value.filter(item => item !== undefined).map(item => stripUndefinedDeep(item)) as T
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)
      .map(([key, item]) => [key, stripUndefinedDeep(item)])) as T
  }
  return value
}
