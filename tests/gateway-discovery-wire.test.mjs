// Flow contract: SOS discovery advertisements retain the complete DID-service fragment/type and DSP metadata-path wire profile without conferring endpoint or tenant authority.
// Read-only wire evidence: https://github.com/Global-DataCare/gdc-common-utils-ts/blob/f4031b221216cacd9917d1d20c5ff0b03bed7045/src/constants/did-services.ts
import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';
import {fileURLToPath} from 'node:url';
import * as profile from '../dist/gateway-did-profile.js';

const expected={
 DidServiceIds:{DidDocument:'#did-document',Jwks:'#jwks',OpenIdConfiguration:'#openid-configuration',SmartConfiguration:'#smart-configuration',SmartToken:'#identity:openid:smart:token',CredentialIssuer:'#openid-credential-issuer',CapabilityStatement:'#fhir:capabilitystatement',Catalog:'#catalog'},
 DidServiceTypes:{LinkedDomains:'LinkedDomains',JsonWebKeyService2020:'JsonWebKeyService2020',OpenIdProvider:'OpenIdProvider',SmartOnFhirConfiguration:'SmartOnFhirConfiguration',ApiService:'ApiService',CredentialIssuer:'OpenIdCredentialIssuer',FhirCapabilityStatement:'CapabilityStatement',CatalogService:'CatalogService'},
 DataspaceWellKnownPaths:{VersionMetadata:'/.well-known/dspace-version'},
};
test('preserves all seventeen service advertisement members and exact DSP well-known path',()=>{
 for(const[name,catalog]of Object.entries(expected))assert.deepEqual(profile[name],catalog,name);
});
test('advertisement catalogs are frozen and root/leaf exports are identical',async()=>{
 const root=await import('../dist/index.js');
 for(const name of Object.keys(expected)){
  assert.ok(profile[name],`missing owned ${name}`);assert.equal(root[name],profile[name]);
  assert.equal(Object.isFrozen(profile[name]),true);
  assert.throws(()=>{profile[name].Unexpected='unexpected'},TypeError);
 }
});
test('public fragment and type literals compose the existing routed DID service without widening',()=>{
 const program=ts.createProgram([fileURLToPath(new URL('./fixtures/gateway-discovery-wire-consumer.ts',import.meta.url))],{target:ts.ScriptTarget.ES2023,module:ts.ModuleKind.NodeNext,moduleResolution:ts.ModuleResolutionKind.NodeNext,strict:true,noEmit:true,skipLibCheck:true,types:[]});
 assert.deepEqual(ts.getPreEmitDiagnostics(program).map(item=>ts.flattenDiagnosticMessageText(item.messageText,'\n')),[]);
});
