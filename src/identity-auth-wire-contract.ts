/** SOS identity operation actions. These literals do not establish caller authority. */
export const IdentityAuthActions = Object.freeze({
  Exchange: '_exchange', ExchangeResponse: '_exchange-response',
  Dcr: '_dcr', DcrResponse: '_dcr-response',
  Issue: '_issue', IssueResponse: '_issue-response',
  Revoke: '_revoke', RevokeResponse: '_revoke-response',
  Search: '_search', SearchResponse: '_search-response',
} as const)

/** Identity request field names; bearer, licence and grant checks remain runtime policy. */
export const IdentityAuthRequestFields = Object.freeze({
  SubjectToken: 'subject_token', EmployeeAuthorizationUrn: 'employee_authorization_urn',
  ClientInstanceId: 'client_instance_id', LicenseId: 'license_id', ClientId: 'client_id', Code: 'code',
} as const)

/** Operational resource discriminator, separate from canonical clinical resource names. */
export const IdentityAuthResourceTypes = Object.freeze({ Smart: 'smart' } as const)

/** DIDComm response type; response-entry discriminators live in gateway-response-contract. */
export const IdentityAuthResponseTypes = Object.freeze({ DeviceRevoke: 'device-revoke-response' } as const)

/** Installation registration metadata names, without inferred actor or clinical authority. */
export const IdentityDcrMetadataFields = Object.freeze({
  ExtendedDeviceInfo: 'ext_device_info', RedirectUris: 'redirect_uris', Jwks: 'jwks',
  SoftwareId: 'software_id', ApplicationType: 'application_type', ClientName: 'client_name',
  ActorDid: 'actor_did', ProfileDid: 'profile_did', ClinicalCreatorBinding: 'clinical_creator_binding',
} as const)

/** SMART polling compatibility profile. `_token` is deliberately not an accepted literal. */
export const SmartPostDcrActions = Object.freeze({
  Token: 'token', TokenResponse: 'token-response', LegacyBatchResponse: '_batch-response',
} as const)
