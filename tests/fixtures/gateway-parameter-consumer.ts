// Flow contract: retain the exact configured-parameter fields used by gateway KMS and entity persistence without narrowing open configuration types to native FHIR search types.
import type {GatewayParamAttribute,GatewayParameterData} from 'sos-data-utils-ts/gateway-parameter-contract';
import type {GatewayParameterData as RootParameter} from 'sos-data-utils-ts';

const storedAttribute:GatewayParamAttribute={name:'synthetic-field',value:undefined,unique:true};
const completeWire:GatewayParameterData={
 name:'synthetic-field',value:'synthetic-value',unique:true,type:'configured-extension',
 system:'urn:example:parameter-system',unit:'synthetic-unit',period:false,
 end:'2026-11-16T00:00:00Z',prefix:'eq',intDisplay:'Synthetic display',
 localizedText:'Synthetic display',hint:'Synthetic hint',
 optionsList:[{value:'synthetic-value',label:'Synthetic choice'}],appliesTo:['SyntheticResource'],
};
const numericWire:GatewayParameterData={name:'synthetic-number',value:7,type:'number'};
const rootParity:RootParameter=completeWire;
const encryptedInput:readonly GatewayParameterData[]=[completeWire,numericWire,{...storedAttribute,type:'string'}];
// Existing callers construct and update these ordinary records before sealing.
numericWire.value=8;
void rootParity;void encryptedInput;

// @ts-expect-error name remains mandatory
const missingName:GatewayParameterData={value:'synthetic-value',type:'string'};
// @ts-expect-error value is a required slot even when explicitly undefined
const missingValue:GatewayParameterData={name:'synthetic-field',type:'string'};
// @ts-expect-error structured values are not the existing stored scalar profile
const structuredValue:GatewayParameterData={name:'synthetic-field',value:{unsafe:true},type:'string'};
// @ts-expect-error a configured type is textual, not an arbitrary selector
const numericType:GatewayParameterData={name:'synthetic-field',value:1,type:1};
// @ts-expect-error uniqueness is an explicit boolean metadata flag
const wrongUnique:GatewayParameterData={name:'synthetic-field',value:'synthetic-value',type:'string',unique:'yes'};
// @ts-expect-error options remain an array rather than a single object
const wrongOptions:GatewayParameterData={name:'synthetic-field',value:'synthetic-value',type:'string',optionsList:{value:'synthetic-value'}};
void missingName;void missingValue;void structuredValue;void numericType;void wrongUnique;void wrongOptions;
