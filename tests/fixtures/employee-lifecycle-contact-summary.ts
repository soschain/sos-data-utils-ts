// Flow contract: inventory summary preserves all seven numeric capacity/state fields and rejects missing or nonnumeric values.
import type {LicenseListSummary} from '../../src/employee-routing.js';
const summary:LicenseListSummary={contracted:3,free:1,used:2,available:1,issued:1,active:1,inactive:0};
const total:number=summary.contracted;
// @ts-expect-error Capacity summaries retain all seven existing fields.
const missing:LicenseListSummary={contracted:3,free:1,used:2,available:1,issued:1,active:1};
// @ts-expect-error Numeric capacity must not be a display string.
const nonnumeric:LicenseListSummary={...summary,free:'1'};
void summary;void total;void missing;void nonnumeric;
