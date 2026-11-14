// Flow contract: routing and terminal response discriminators preserve existing wire data while included resources require stable identity and a claims container.
import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import ts from 'typescript'
import { fileURLToPath } from 'node:url'
import * as contracts from '../dist/gateway-response-contract.js'
import { ResourceTypesFhirR4 } from 'fhir-data-utils-ts'

test('retains reviewed routing and response discriminators without selection drift', () => {
  const baseline = {
    GatewayRouteSections: 'a55f9c58bbd5f021b7593508e2799f0b2c5986d7505306309fc0259714dc3778',
    GatewayRouteFormats: '59418717b2db7b3a553ab204db5eeda8fc85c4b9f24556023fb0315475143f20',
    GatewayResponseEntryTypes: 'e3af895c400b8fe38de479ec41e9831bf1399e73b84f3f0f997022b8d365b218',
    GatewayInternalResourceTypes: '351c6af8cb26cb67ef49b2abed10cf6f9bf9b03fd53fe1cef07ae750520da456',
  }
  for (const [name, sha256] of Object.entries(baseline)) {
    assert.equal(createHash('sha256').update(JSON.stringify(contracts[name])).digest('hex'), sha256, name)
    assert.equal(Object.isFrozen(contracts[name]), true)
  }
  assert.equal(contracts.GatewayResponseEntryTypes.OperationOutcome, ResourceTypesFhirR4.OperationOutcome)
})

test('public included-resource contract requires identity, discriminator and claims metadata', () => {
  const fixture = fileURLToPath(new URL('./fixtures/gateway-response-consumer.ts', import.meta.url))
  const program = ts.createProgram([fixture], { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.NodeNext, moduleResolution: ts.ModuleResolutionKind.NodeNext, strict: true, noEmit: true, skipLibCheck: true, types: [] })
  assert.deepEqual(ts.getPreEmitDiagnostics(program).map(item => ts.flattenDiagnosticMessageText(item.messageText, '\n')), [])
})
