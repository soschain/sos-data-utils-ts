// Flow contract: JSON:API included resources preserve required claims and identity without claiming runtime validation.
import type { IncludedResource } from 'sos-data-utils-ts/bundle-contract'
import { REPOSITORY_SAFE_EXAMPLES as SAFE } from 'sos-data-utils-ts/repository-privacy'
const included: IncludedResource = { id: SAFE.resourceUuid, type: 'Person', meta: { claims: {}, source: 'synthetic' }, relationship: { data: null } }
// @ts-expect-error a related resource cannot omit its stable identifier
const missingId: IncludedResource = { type: 'Person', meta: { claims: {} } }
// @ts-expect-error the worker always supplies the flat-claim container, even if empty
const missingClaims: IncludedResource = { id: SAFE.resourceUuid, type: 'Person', meta: {} }
// @ts-expect-error a JSON:API resource discriminator is required
const missingType: IncludedResource = { id: SAFE.resourceUuid, meta: { claims: {} } }
void [included, missingId, missingClaims, missingType]
