// Flow contract: the existing claims-first organization transaction preserves phone fields separately from email and public types permit both legitimate contact channels; the payload is not proof of authority.
import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';
import {fileURLToPath} from 'node:url';
import {buildLegalOrganizationVerificationTransactionBundle} from '../dist/gateway-transport-contract.js';
import {SchemaOrgServiceClaim} from 'antifraud-data-utils-ts/schema-org-claims';
import {REPOSITORY_SAFE_EXAMPLES as SAFE} from '../dist/repository-privacy.js';

function diagnostics(name){const program=ts.createProgram([fileURLToPath(new URL('./fixtures/'+name,import.meta.url))],{target:ts.ScriptTarget.ES2023,module:ts.ModuleKind.NodeNext,moduleResolution:ts.ModuleResolutionKind.NodeNext,strict:true,exactOptionalPropertyTypes:true,noEmit:true,skipLibCheck:true,types:[]});return ts.getPreEmitDiagnostics(program).map(item=>ts.flattenDiagnosticMessageText(item.messageText,'\n'));}
test('preserves actual serialized telephone fields without mutating input and retains the historical email type',()=>{
 const input={claims:{[SchemaOrgServiceClaim.Category]:'health-care'},controller:{did:SAFE.didWeb,telephone:SAFE.phoneE164},legalRepresentativePayload:{telephone:SAFE.firstContactPhoneE164}};
 const before=structuredClone(input),bundle=buildLegalOrganizationVerificationTransactionBundle(input);
 assert.deepEqual(bundle.data[0].resource.controller,input.controller);
 assert.deepEqual(bundle.data[0].resource.legalRepresentativePayload,input.legalRepresentativePayload);
 assert.equal('email'in bundle.data[0].resource.controller,false);
 bundle.data[0].resource.controller.telephone=SAFE.secondContactPhoneE164;
 assert.deepEqual(input,before);
 assert.deepEqual(diagnostics('organization-verification-email-consumer.ts'),[]);
});
test('public request types allow explicit controller and representative telephone fields',()=>{
 assert.deepEqual(diagnostics('organization-verification-phone-consumer.ts'),[]);
});
