/** Governed SOS provider capability tokens; advertisement is not authorization. */
export const ServiceCapability=Object.freeze({
  OrganizationRegistryProvider:'organization/Organization.cruds',
  IndexReader:'organization/Composition.rs',IndexProvider:'organization/Composition.cruds',
  DigitalTwinReader:'organization/ResearchSubject.rs',DigitalTwinProvider:'organization/ResearchSubject.cruds',
} as const)
export type ServiceCapabilityValue=typeof ServiceCapability[keyof typeof ServiceCapability]
