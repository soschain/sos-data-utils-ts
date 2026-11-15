// Flow contract: persisted SOS seats preserve owner/member/contact separation and epoch-second device bindings; deterministic catalogs do not grant admission or change license state.
import assert from 'node:assert/strict';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const contract = await import('../dist/device-license-contract.js').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const expected = {
  DeviceUserClasses: { Employee:'employee', Individual:'individual' },
  DeviceAppTypes: { Mobile:'mobile', Web:'web' },
  DeviceBindingStatuses: { Active:'active', Revoked:'revoked' },
  LicenseStatuses: { Available:'available', Issued:'issued', Active:'active', Inactive:'inactive' },
};

test('public seat catalogs retain exact existing wire values', () => {
  for (const [name, values] of Object.entries(expected)) {
    assert.ok(contract[name], `missing owned ${name}`);
    assert.deepEqual(contract[name], values);
  }
});

test('catalogs are immutable while installation revocation remains distinct from seat inactivity', () => {
  for (const name of Object.keys(expected)) {
    assert.ok(contract[name], `missing owned ${name}`);
    assert.ok(Object.isFrozen(contract[name]));
    assert.throws(() => { contract[name].Unexpected = 'unexpected'; }, TypeError);
  }
  assert.equal(contract.DeviceBindingStatuses.Revoked,'revoked');
  assert.equal(contract.LicenseStatuses.Inactive,'inactive');
  assert.equal('Inactive' in contract.DeviceBindingStatuses,false);
  assert.equal('Revoked' in contract.LicenseStatuses,false);
});

test('typed real seat consumers preserve optional installation and owner/contact fields and reject incompatible records', () => {
  assert.ok(contract.DeviceUserClasses,'missing owned seat contract');
  execFileSync(process.execPath,[
    fileURLToPath(new URL('../node_modules/typescript/bin/tsc',import.meta.url)),
    '--noEmit','--strict','--exactOptionalPropertyTypes','--skipLibCheck',
    '--module','NodeNext','--moduleResolution','NodeNext','--target','ES2022',
    fileURLToPath(new URL('./fixtures/device-license-contract-consumer.ts',import.meta.url)),
  ],{stdio:'pipe'});
});
