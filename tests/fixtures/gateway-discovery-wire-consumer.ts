// Flow contract: operational advertisements compose generic DID service contracts while preserving literal fragment, type and relative path values.
import {DidServiceIds,DidServiceTypes,DataspaceWellKnownPaths,type GatewayDidService} from 'sos-data-utils-ts/gateway-did-profile';
const fragment:'#catalog'=DidServiceIds.Catalog;
const kind:'CatalogService'=DidServiceTypes.CatalogService;
const path:'/.well-known/dspace-version'=DataspaceWellKnownPaths.VersionMetadata;
const service:GatewayDidService={id:fragment,type:kind,serviceEndpoint:path};
// @ts-expect-error a SMART token service fragment is not the plain catalog fragment.
const wrongFragment:'#catalog'=DidServiceIds.SmartToken;
// @ts-expect-error the advertised credential issuer is not an OpenID provider type.
const wrongType:'OpenIdProvider'=DidServiceTypes.CredentialIssuer;
// @ts-expect-error readonly catalogs cannot be edited by a consumer.
DataspaceWellKnownPaths.VersionMetadata='/another-path';
void[service,wrongFragment,wrongType];
