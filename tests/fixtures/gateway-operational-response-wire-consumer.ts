// Flow contract: operational wire profiles remain separate from native FHIR bundle types and protocol metadata is statically readonly.
import {GatewaySearchBundleTypes,GatewayResourceLifecycleStatuses} from 'sos-data-utils-ts/gateway-response-contract';
import {GatewayDataspaceProtocolVersions,buildGatewayDataspaceVersionMetadata,type GatewayDataspaceVersionMetadata} from 'sos-data-utils-ts/gateway-dataspace-routing';
const search:'search-response'=GatewaySearchBundleTypes.SearchResponse;
const purged:'purged'=GatewayResourceLifecycleStatuses.Purged;
const metadata:GatewayDataspaceVersionMetadata=buildGatewayDataspaceVersionMetadata('/dsp',GatewayDataspaceProtocolVersions.Current);
// @ts-expect-error a business response is not the native FHIR searchset bundle type.
const native:'searchset'=GatewaySearchBundleTypes.SearchResponse;
// @ts-expect-error returned metadata entries are statically readonly.
metadata.protocolVersions[0]!.path='another';
// @ts-expect-error the compatibility profile cannot silently widen to an unadvertised version.
buildGatewayDataspaceVersionMetadata('/dsp','unregistered-version');
void[search,purged,metadata,native];
