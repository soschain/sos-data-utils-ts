// Flow contract: owned workforce DTOs retain existing email consumers and role/status/license fields while allowing a distinct phone contact; invalid mixed or missing contacts fail compile-time and DTOs themselves grant no employment or device authority.
import assert from 'node:assert/strict';
import test from 'node:test';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
for(const fixture of ['email','phone','negative','summary'])test(`typed workforce ${fixture} consumers use the owned contact contract`,()=>{
 const result=spawnSync(process.execPath,[fileURLToPath(new URL('../node_modules/typescript/bin/tsc',import.meta.url)),
  '--noEmit','--strict','--exactOptionalPropertyTypes','--skipLibCheck','--module','NodeNext','--moduleResolution','NodeNext','--target','ES2022',
  fileURLToPath(new URL(`./fixtures/employee-lifecycle-contact-${fixture}.ts`,import.meta.url))],{encoding:'utf8'});
 assert.equal(result.status,0,`${fixture} contact contract failed:\n${result.stdout}${result.stderr}`);
});
