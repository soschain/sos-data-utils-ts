// Flow contract: explicit optional DSP routing context is a formatting contract, separate from authorization or endpoint resolution.
import {buildGatewayDataspaceBasePath,buildGatewayDataspaceVersionPath,buildGatewayDataspaceCatalogRequestPath,buildGatewayDataspaceCatalogCollectionPath,buildGatewayDataspaceCatalogArtifactPath,buildGatewayDataspaceCatalogDatasetPath,type GatewayDataspaceRouteContext} from 'sos-data-utils-ts/gateway-dataspace-routing';
const context:GatewayDataspaceRouteContext={participantId:'host',hostCoverageScope:'EU',version:'v1',hostNetwork:'test-network'};
const paths:string[]=[buildGatewayDataspaceBasePath(context),buildGatewayDataspaceVersionPath(context),buildGatewayDataspaceCatalogRequestPath(context),buildGatewayDataspaceCatalogCollectionPath(context),buildGatewayDataspaceCatalogArtifactPath(context),buildGatewayDataspaceCatalogDatasetPath(context,'dataset')];
// @ts-expect-error route contexts cannot silently accept numeric versions.
const invalid:GatewayDataspaceRouteContext={version:1};
// @ts-expect-error route contexts remain readonly.
context.participantId='another';
void[paths,invalid];
