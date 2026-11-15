/** Application participation roles; these identifiers are not runtime capability grants. */
export const OrganizationParticipationRoles=Object.freeze({
  "IndividualIndexServiceProvider": "individual-index-service-provider",
  "IndividualIndexDataProvider": "individual-index-data-provider",
  "IndividualIndexDataConsumer": "individual-index-data-consumer",
  "IndividualPersonalBackupServiceProvider": "individual-personal-backup-service-provider",
  "DigitalTwinIndexServiceProvider": "digital-twin-index-service-provider",
  "DigitalTwinDataProvider": "digital-twin-data-provider",
  "DigitalTwinDataConsumer": "digital-twin-data-consumer"
} as const)
export type OrganizationParticipationRole=typeof OrganizationParticipationRoles[keyof typeof OrganizationParticipationRoles]
