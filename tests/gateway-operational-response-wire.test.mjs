// Flow contract: business search/lifecycle discriminators and DSP version metadata retain exact SOS wire semantics without becoming native FHIR types or granting resource authority.
import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';
import {fileURLToPath} from 'node:url';
import * as response from '../dist/gateway-response-contract.js';
import * as discovery from '../dist/gateway-dataspace-routing.js';

test('retains both business search types and all six operational lifecycle states as frozen catalogs',()=>{
 assert.deepEqual(response.GatewaySearchBundleTypes,{Search:'search',SearchResponse:'search-response'});
 assert.deepEqual(response.GatewayResourceLifecycleStatuses,{Pending:'pending',Active:'active',Inactive:'inactive',Purged:'purged',Suspended:'suspended',Revoked:'revoked'});
 assert.equal(Object.isFrozen(response.GatewaySearchBundleTypes),true);
 assert.equal(Object.isFrozen(response.GatewayResourceLifecycleStatuses),true);
 assert.equal(Object.values(response.GatewaySearchBundleTypes).includes('searchset'),false);
});
test('metadata retains the exact version profile and supplied relative path without normalization',()=>{
 assert.deepEqual(discovery.GatewayDataspaceProtocolVersions,{Current:'2025-1'});
 assert.equal(Object.isFrozen(discovery.GatewayDataspaceProtocolVersions),true);
 assert.equal(typeof discovery.buildGatewayDataspaceVersionMetadata,'function');
 for(const path of ['/dsp','/participant/cds-EU/v1/test-network/dsp',' /dsp/ ', '']){
  assert.deepEqual(discovery.buildGatewayDataspaceVersionMetadata(path),{protocolVersions:[{version:'2025-1',path}]});
 }
});
test('separate metadata responses never share mutable runtime objects',()=>{
 assert.equal(typeof discovery.buildGatewayDataspaceVersionMetadata,'function');
 const first=discovery.buildGatewayDataspaceVersionMetadata('/dsp'),second=discovery.buildGatewayDataspaceVersionMetadata('/dsp');
 assert.notEqual(first,second);assert.notEqual(first.protocolVersions,second.protocolVersions);
 assert.notEqual(first.protocolVersions[0],second.protocolVersions[0]);
 first.protocolVersions[0].path='changed';
 assert.equal(second.protocolVersions[0].path,'/dsp');
});
test('root and owning subpaths expose identical public catalogs and metadata builder',async()=>{
 const root=await import('../dist/index.js');
 for(const name of ['GatewaySearchBundleTypes','GatewayResourceLifecycleStatuses']){
  assert.ok(response[name],`missing ${name}`);assert.equal(root[name],response[name]);
 }
 for(const name of ['GatewayDataspaceProtocolVersions','buildGatewayDataspaceVersionMetadata']){
  assert.ok(discovery[name],`missing ${name}`);assert.equal(root[name],discovery[name]);
 }
});
test('public readonly metadata and finite protocol-version profile preserve actual caller types',()=>{
 const program=ts.createProgram([fileURLToPath(new URL('./fixtures/gateway-operational-response-wire-consumer.ts',import.meta.url))],{target:ts.ScriptTarget.ES2023,module:ts.ModuleKind.NodeNext,moduleResolution:ts.ModuleResolutionKind.NodeNext,strict:true,noEmit:true,skipLibCheck:true,types:[]});
 assert.deepEqual(ts.getPreEmitDiagnostics(program).map(item=>ts.flattenDiagnosticMessageText(item.messageText,'\n')),[]);
});
