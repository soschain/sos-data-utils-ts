// Flow contract: subject-card check digits reject malformed input, detect changed digits and remain deterministic without a legacy package implementation.
import assert from 'node:assert/strict'
import test from 'node:test'
import {computeDammCheckDigit} from '../dist/subject-card-checksum.js'

test('validates standard Damm vectors and governed presentation separators',()=>{
  assert.equal(computeDammCheckDigit('572'),'4')
  assert.equal(computeDammCheckDigit('5724'),'0')
  assert.equal(computeDammCheckDigit('57-2'),'4')
  assert.notEqual(computeDammCheckDigit('527'),'4')
  for(const value of ['', '---', '57x2'])assert.throws(()=>computeDammCheckDigit(value))
})
