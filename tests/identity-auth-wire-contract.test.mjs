// Flow contract: identity operation names and field keys retain their exact wire literals without granting admission, issuing credentials or changing SMART polling behavior.
// Read-only wire evidence: https://github.com/Global-DataCare/gdc-common-utils-ts/blob/f4031b221216cacd9917d1d20c5ff0b03bed7045/src/constants/identity-auth.ts
import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';

const owned = await import('../dist/identity-auth-wire-contract.js').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const expected = {
  IdentityAuthActions: {
    Exchange: '_exchange', ExchangeResponse: '_exchange-response',
    Dcr: '_dcr', DcrResponse: '_dcr-response', Issue: '_issue', IssueResponse: '_issue-response',
    Revoke: '_revoke', RevokeResponse: '_revoke-response', Search: '_search', SearchResponse: '_search-response',
  },
  IdentityAuthRequestFields: {
    SubjectToken: 'subject_token', EmployeeAuthorizationUrn: 'employee_authorization_urn',
    ClientInstanceId: 'client_instance_id', LicenseId: 'license_id', ClientId: 'client_id', Code: 'code',
  },
  IdentityAuthResourceTypes: { Smart: 'smart' },
  IdentityAuthResponseTypes: { DeviceRevoke: 'device-revoke-response' },
  IdentityDcrMetadataFields: {
    ExtendedDeviceInfo: 'ext_device_info', RedirectUris: 'redirect_uris', Jwks: 'jwks', SoftwareId: 'software_id',
    ApplicationType: 'application_type', ClientName: 'client_name', ActorDid: 'actor_did',
    ProfileDid: 'profile_did', ClinicalCreatorBinding: 'clinical_creator_binding',
  },
  SmartPostDcrActions: { Token: 'token', TokenResponse: 'token-response', LegacyBatchResponse: '_batch-response' },
};

test('all six operational catalogs retain the complete thirty-member wire profile', () => {
  for (const [name, catalog] of Object.entries(expected)) {
    assert.deepEqual(owned[name], catalog, `missing or changed ${name}`);
  }
});

test('catalog mutation cannot alter requests and SMART token is distinct from an underscored route action', () => {
  for (const name of Object.keys(expected)) {
    assert.ok(owned[name], `missing owned ${name}`);
    assert.ok(Object.isFrozen(owned[name]));
    assert.throws(() => { owned[name].Unexpected = 'unexpected'; }, TypeError);
  }
  assert.equal(owned.SmartPostDcrActions.Token, 'token');
  assert.equal(Object.values(owned.SmartPostDcrActions).includes('_token'), false);
  assert.equal('LicenseIssued' in owned.IdentityAuthResponseTypes, false);
});

test('public root and leaf expose the same catalog objects', async () => {
  const root = await import('../dist/index.js');
  for (const name of Object.keys(expected)) {
    assert.ok(owned[name], `missing owned ${name}`);
    assert.equal(root[name], owned[name]);
  }
});

test('public literal types preserve computed request keys and reject incompatible actions', () => {
  const fixture = fileURLToPath(new URL('./fixtures/identity-auth-wire-consumer.ts', import.meta.url));
  const program = ts.createProgram([fixture], {
    target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext, strict: true, noEmit: true,
    skipLibCheck: true, types: [],
  });
  assert.deepEqual(ts.getPreEmitDiagnostics(program).map(item => ts.flattenDiagnosticMessageText(item.messageText, '\n')), []);
});
