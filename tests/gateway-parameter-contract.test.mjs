// Flow contract: actual encrypted gateway configuration/search parameters preserve their required name/value slot, open configured type, private uniqueness flag and optional display/choice fields through the public SOS Data owner; the type grants no indexing or actor authority.
import assert from 'node:assert/strict';
import test from 'node:test';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

test('public gateway parameter consumers retain the complete stored wire shape and reject incompatible substitutions',()=>{
 const result=spawnSync(process.execPath,[
  fileURLToPath(new URL('../node_modules/typescript/bin/tsc',import.meta.url)),
  '--noEmit','--strict','--exactOptionalPropertyTypes','--skipLibCheck',
  '--module','NodeNext','--moduleResolution','NodeNext','--target','ES2022',
  fileURLToPath(new URL('./fixtures/gateway-parameter-consumer.ts',import.meta.url)),
 ],{encoding:'utf8'});
 assert.equal(result.error,undefined);
 assert.equal(result.status,0,result.stdout+result.stderr);
});
