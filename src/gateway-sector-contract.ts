/** Existing gateway route contexts. These are not the complete service-sector
 * catalogue, an employment role, or evidence that an actor may access a route.
 * SYSTEM is retained for compatibility with reserved bootstrap routing.
 */
export enum GatewaySector {
  TEST = 'test',
  SYSTEM = 'system',
  ANTIFRAUD = 'antifraud',
  HEALTH_CARE = 'health-care',
  HEALTH_INSURANCE = 'health-insurance',
  EMERGENCY = 'emergency',
  RESEARCH = 'research',
}
Object.freeze(GatewaySector)
