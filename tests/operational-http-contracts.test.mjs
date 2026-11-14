// Flow contract: operational HTTP descriptors use registered methods and statuses while preserving FHIR media type compatibility.
import assert from 'node:assert/strict'
import test from 'node:test'
import { METHODS, STATUS_CODES } from 'node:http'
import * as http from '../dist/bff-wire-contract.js'
test('route contracts expose registered success and failure statuses and supported operations',()=>{
 assert.ok(http.HttpStatusCodes)
 assert.ok(http.HttpRequestMethods)
 for(const code of Object.values(http.HttpStatusCodes)) assert.equal(typeof STATUS_CODES[code],'string')
 for(const method of Object.values(http.HttpRequestMethods)) assert.equal(METHODS.includes(method),true)
 assert.equal(http.HttpStatusCodes.Accepted,202)
 assert.equal(http.HttpStatusCodes.Forbidden,403)
 assert.equal(http.HttpRequestMethods.Patch,'PATCH')
 assert.equal(http.HttpMediaTypes.FhirJson,'application/fhir+json')
 assert.equal(Object.isFrozen(http.HttpStatusCodes),true)
 assert.equal(Object.isFrozen(http.HttpRequestMethods),true)
})
