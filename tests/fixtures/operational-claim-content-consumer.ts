// Flow contract: public SOS operational content options are readonly typed flags; canonical output is text, never an issued resource or authority.
import {canonicalizeOperationalClaimsForContentId,type OperationalClaimsContentOptions} from 'sos-data-utils-ts/operational-claim-content'
const options:OperationalClaimsContentOptions={stripIdentifiers:false,stripJsonLdEnvelope:false,stripVersionClaims:false}
const result:string=canonicalizeOperationalClaimsForContentId(Object.freeze({'Composition.status':'final'}),options)
void result
// @ts-expect-error stripping flags are booleans
canonicalizeOperationalClaimsForContentId({}, {stripIdentifiers:'false'})
// @ts-expect-error flat-claim input is a record, not a list of resources
canonicalizeOperationalClaimsForContentId([])
