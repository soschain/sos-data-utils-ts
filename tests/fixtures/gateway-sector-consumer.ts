// Flow contract: the finite route enum preserves typed call sites without accepting arbitrary service categories as routing context.
import { GatewaySector } from 'sos-data-utils-ts/gateway-sector-contract'
const sector: GatewaySector = GatewaySector.HEALTH_CARE
const precise: GatewaySector.HEALTH_CARE = sector
const buckets = new Map<GatewaySector, string>([[sector, precise]])
// @ts-expect-error service catalogue values cannot bypass the declared gateway route type
const arbitrary: GatewaySector = 'unregistered-sector'
void [buckets, arbitrary]
