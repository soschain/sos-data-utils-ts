// Flow contract: preserve existing gateway routing contexts independently from the service-sector catalogue and from actor authorization.
import test from 'node:test'
import assert from 'node:assert/strict'
import ts from 'typescript'
import { fileURLToPath } from 'node:url'

test('retains the finite historical route-context values without adding service eligibility', async () => {
  const { GatewaySector } = await import('../dist/gateway-sector-contract.js')
  assert.deepEqual(GatewaySector, {
    TEST: 'test', SYSTEM: 'system', ANTIFRAUD: 'antifraud',
    HEALTH_CARE: 'health-care', HEALTH_INSURANCE: 'health-insurance',
    EMERGENCY: 'emergency', RESEARCH: 'research',
  })
})

test('public route-context enum supports existing value and namespace type usage', () => {
  const fixture = fileURLToPath(new URL('./fixtures/gateway-sector-consumer.ts', import.meta.url))
  const program = ts.createProgram([fixture], { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.NodeNext, moduleResolution: ts.ModuleResolutionKind.NodeNext, strict: true, noEmit: true, skipLibCheck: true, types: [] })
  assert.deepEqual(ts.getPreEmitDiagnostics(program).map(item => ts.flattenDiagnosticMessageText(item.messageText, '\n')), [])
})
