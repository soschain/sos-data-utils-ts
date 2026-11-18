// Selective wire compatibility with the established licence/employee helpers; no transport or authority evaluation.
/** Established employee request metadata; processing and authority remain with the gateway. */
export const EmployeeBundleOperations = Object.freeze({create:'create',search:'search',disable:'disable',purge:'purge'} as const)
export const EmployeeBundleMethods = Object.freeze({create:'POST',search:'POST',disable:'DELETE',purge:'POST'} as const)
export const EmployeeResourceTypes = Object.freeze({employee:'Employee',bundle:'Bundle',batch:'batch',parameters:'Parameters'} as const)
export const EmployeeBatchEntryTypes = Object.freeze({create:'Employee-create-request-v1.0',disable:'Employee-disable-request-v1.0',update:'Employee-update-request-v1.0',search:'Employee-search-request-v1.0',purge:'Employee-purge-request-v1.0'} as const)
