// Flow contract: public operational IDs remain literal and readonly; unknown IDs and mutation are rejected.
import {DataCollectionIds,FhirResourceTypeDataCollections,HealthcareSummarySectionDataCollections,type DataCollectionId} from 'sos-data-utils-ts/gateway-data-collections';
import {DataCollectionIds as rootIds,type DataCollectionId as RootId} from 'sos-data-utils-ts';
const id:DataCollectionId=DataCollectionIds.medications;
const rootId:RootId=rootIds.medications;
const literal:'medications'=DataCollectionIds.medications;
const mapping:'medications'=FhirResourceTypeDataCollections.MedicationStatement;
const fanOut:readonly DataCollectionId[]=HealthcareSummarySectionDataCollections['LOINC|30954-2']!;
// @ts-expect-error an arbitrary backend name is not a governed logical collection ID
const unknown:DataCollectionId='synthetic-private-table';
// @ts-expect-error the public catalog is immutable
DataCollectionIds.medications='medications';
// @ts-expect-error a resource family cannot be redirected by a consumer
FhirResourceTypeDataCollections.MedicationStatement='medications';
// @ts-expect-error section fan-out arrays cannot be changed by a consumer
fanOut.push(id);
void [id,rootId,literal,mapping,fanOut,unknown];
