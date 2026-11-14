// Flow contract: the internal SOS message body keeps entry identifiers and resources separate from the neutral DIDComm envelope and native FHIR resources.
import test from 'node:test'
import assert from 'node:assert/strict'
import ts from 'typescript'
import { fileURLToPath } from 'node:url'
import * as wire from '../dist/bff-wire-contract.js'

test('retains the SOS submission accept policy separately from protocol data types', () => {
  assert.equal(wire.DIDCOMM_DEFAULT_ACCEPT_HEADER, 'application/json, application/didcomm-plain+json, */*')
})

test('public communication projection preserves envelope, body and entry layer boundaries', () => {
  const fixture = fileURLToPath(new URL('./fixtures/communication-message-consumer.ts', import.meta.url))
  const program = ts.createProgram([fixture], { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.NodeNext, moduleResolution: ts.ModuleResolutionKind.NodeNext, strict: true, noEmit: true, skipLibCheck: true, types: [] })
  assert.deepEqual(ts.getPreEmitDiagnostics(program).map(item => ts.flattenDiagnosticMessageText(item.messageText, '\n')), [])
})
