// Flow contract: clinical creator identity keeps person, assignment, organization owner and verified channel evidence distinct without performing authentication or authorization in the data contract.
import assert from 'node:assert/strict'
import test from 'node:test'
import ts from 'typescript'
import { fileURLToPath } from 'node:url'

test('exposes stable clinical creator and replacement discriminators', async () => {
  const contract = await import('../dist/clinical-creator-contract.js')
  assert.deepEqual(Object.values(contract.FhirIpsCreatorKinds), ['individual-subject', 'individual-member', 'professional'])
  assert.deepEqual(Object.values(contract.ClinicalResourceReplacementDecision), ['allow-organization-successor', 'deny'])
  assert.equal(Object.isFrozen(contract.FhirIpsCreatorKinds), true)
  assert.equal(Object.isFrozen(contract.ClinicalResourceReplacementDecision), true)
  assert.equal(contract.resolveClinicalCreatorBinding, undefined)
  assert.equal(contract.evaluateClinicalResourceReplacement, undefined)
})

test('consumer binding and provenance contracts reject missing stable identities and invalid profile kinds', () => {
  const fixture = fileURLToPath(new URL('./fixtures/clinical-creator-contract-consumer.ts', import.meta.url))
  const program = ts.createProgram([fixture], { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.NodeNext, moduleResolution: ts.ModuleResolutionKind.NodeNext, strict: true, noEmit: true, skipLibCheck: true, types: [] })
  assert.deepEqual(ts.getPreEmitDiagnostics(program).map(item => ts.flattenDiagnosticMessageText(item.messageText, '\n')), [])
})
