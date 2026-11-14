// Flow contract: the SOS routing profile extends neutral DID data with explicit selector/action metadata without changing generic DID rules.
import type { GatewayDidService, GatewayDidDocument } from 'sos-data-utils-ts/gateway-did-profile'
import { REPOSITORY_SAFE_EXAMPLES as SAFE } from 'sos-data-utils-ts/repository-privacy'
const service: GatewayDidService = { id: `${SAFE.didWeb}#entity`, type: 'OrganizationService', serviceEndpoint: SAFE.httpsBaseUrl, selector: { section: 'entity', format: 'org.schema', sector: SAFE.sector }, actions: ['_search'] }
const document: GatewayDidDocument = { '@context': 'https://www.w3.org/ns/did/v1', id: SAFE.didWeb, service: [service] }
const publicService: GatewayDidService = { id: service.id, type: service.type, serviceEndpoint: service.serviceEndpoint }
// @ts-expect-error advertised route selectors retain both section and format
const missingFormat: GatewayDidService = { ...service, selector: { section: 'entity' } }
// @ts-expect-error actions are an explicit operation list
const wrongActions: GatewayDidService = { ...service, actions: '_search' }
// @ts-expect-error this gateway profile selects URI string endpoints; generic structured DID services use Antifraud's generic type
const wrongEndpoint: GatewayDidService = { ...service, serviceEndpoint: { uri: SAFE.httpsBaseUrl } }
void [document, publicService, missingFormat, wrongActions, wrongEndpoint]
