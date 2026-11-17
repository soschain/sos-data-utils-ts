// Flow contract: the customer response discriminator remains an exact operational literal through both public exports.
import {GatewayResponseEntryTypes} from 'sos-data-utils-ts/gateway-response-contract'
import {GatewayResponseEntryTypes as RootTypes} from 'sos-data-utils-ts'
const entryType:'Customer'=GatewayResponseEntryTypes.IndividualCustomer
const rootType:typeof GatewayResponseEntryTypes.IndividualCustomer=RootTypes.IndividualCustomer
// @ts-expect-error Response discriminators do not become ontology IRIs.
const ontologyType:typeof entryType='Person'
void[entryType,rootType,ontologyType]
