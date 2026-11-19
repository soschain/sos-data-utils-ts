// Flow contract: deterministic DSP relative paths preserve explicit tenant/host route precedence and unscoped fallback behavior without choosing a provider, resolving URLs or granting access.
// Read-only wire evidence: https://github.com/Global-DataCare/gdc-common-utils-ts/blob/f4031b221216cacd9917d1d20c5ff0b03bed7045/src/utils/dataspace-protocol.ts
import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';
import {fileURLToPath} from 'node:url';
import {REPOSITORY_SAFE_EXAMPLES as SAFE} from '../dist/repository-privacy.js';
const owned=await import('../dist/gateway-dataspace-routing.js').catch(error=>{
 if(error.code==='ERR_MODULE_NOT_FOUND')return{};throw error;
});
const tenant=()=>({tenantId:SAFE.tenantId,jurisdiction:'ES-MD',version:'v1',businessSector:SAFE.sector});
const base=`/${SAFE.tenantId}/cds-ES-MD/v1/${SAFE.sector}`;
test('formats the separate public offering catalogue path for a tenant',()=>{
 assert.equal(owned.buildGatewayDataspaceOfferingCatalogPath(tenant()),base+'/dsp/catalog/offerings.json');
 assert.equal(owned.buildGatewayDataspaceOfferingCatalogPath(),'/dsp/catalog/offerings.json');
});
const functions={
 buildGatewayDataspaceBasePath:'/dsp',buildGatewayDataspaceVersionPath:'/.well-known/dspace-version',
 buildGatewayDataspaceCatalogRequestPath:'/dsp/catalog/request',buildGatewayDataspaceCatalogCollectionPath:'/dsp/catalog',
 buildGatewayDataspaceCatalogArtifactPath:'/dsp/catalog/dcat.json',buildGatewayDataspaceCatalogDatasetPath:'/dsp/catalog/datasets/:id',
};
test('all six builders preserve exact tenant and host paths without changing input',()=>{
 for(const[name,suffix]of Object.entries(functions)){
  assert.equal(typeof owned[name],'function',name);
  const input=tenant(),before=structuredClone(input);
  assert.equal(owned[name](input),base+suffix,name);assert.deepEqual(input,before);
  const host={participantId:SAFE.tenantId,hostCoverageScope:'EU',version:'v1',hostNetwork:'test-network'};
  assert.equal(owned[name](host),`/${SAFE.tenantId}/cds-EU/v1/test-network`+suffix,name);
 }
});
test('retains participant, tenant-scope and sector-like field precedence',()=>{
 assert.equal(typeof owned.buildGatewayDataspaceBasePath,'function');
 const route=owned.buildGatewayDataspaceBasePath;
 const input={...tenant(),participantId:'host',hostCoverageScope:'EU',hostNetwork:'test-network',hostNetworkOrBusinessSector:'local-network',sector:'fallback'};
 assert.equal(route(input),'/host/cds-ES-MD/v1/test-network/dsp');
 delete input.hostNetwork;
 assert.equal(route(input),'/host/cds-ES-MD/v1/local-network/dsp');
 delete input.hostNetworkOrBusinessSector;
 assert.equal(route(input),`/host/cds-ES-MD/v1/${SAFE.sector}/dsp`);
 delete input.businessSector;
 assert.equal(route(input),'/host/cds-ES-MD/v1/fallback/dsp');
});
test('incomplete context retains each existing unscoped relative fallback',()=>{
 for(const[name,suffix]of Object.entries(functions)){
  assert.equal(typeof owned[name],'function',name);assert.equal(owned[name](),suffix);
  for(const key of ['tenantId','jurisdiction','version','businessSector']){
   assert.equal(owned[name]({...tenant(),[key]:' '}),suffix,`${name}:${key}`);
  }
 }
});
test('trims whitespace while preserving supplied internal and boundary slashes',()=>{
 assert.equal(typeof owned.buildGatewayDataspaceBasePath,'function');
 assert.equal(owned.buildGatewayDataspaceBasePath({tenantId:' /participant/ ',jurisdiction:' ES/MD ',version:' v1 ',sector:' health-care '}),'//participant//cds-ES/MD/v1/health-care/dsp');
});
test('dataset suffix retains explicit IDs rather than inferring or encoding them',()=>{
 assert.equal(typeof owned.buildGatewayDataspaceCatalogDatasetPath,'function');
 assert.equal(owned.buildGatewayDataspaceCatalogDatasetPath(tenant(),'dataset/part'),base+'/dsp/catalog/datasets/dataset/part');
 assert.equal(owned.buildGatewayDataspaceCatalogDatasetPath({},''),'/dsp/catalog/datasets/');
});
test('public context and literal builders compile without importing runtime transport',()=>{
 const program=ts.createProgram([fileURLToPath(new URL('./fixtures/gateway-dataspace-routing-consumer.ts',import.meta.url))],{target:ts.ScriptTarget.ES2023,module:ts.ModuleKind.NodeNext,moduleResolution:ts.ModuleResolutionKind.NodeNext,strict:true,noEmit:true,skipLibCheck:true,types:[]});
 assert.deepEqual(ts.getPreEmitDiagnostics(program).map(item=>ts.flattenDiagnosticMessageText(item.messageText,'\n')),[]);
});
