// Flow contract: SOS operational flat-claim content projection preserves historical canonical UTF8 while leaving canonical FHIR data and array/value semantics intact.
import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const vectors=JSON.parse(readFileSync(new URL('./fixtures/operational-claim-content-vectors.json',import.meta.url),'utf8')).vectors
const load=()=>import('../dist/operational-claim-content.js')

test('matches all eight actual read-only original canonical projection vectors',async()=>{
 const {canonicalizeOperationalClaimsForContentId:canonical}=await load()
 for(const vector of vectors)assert.equal(canonical(vector.claims,vector.options),vector.canonicalJson,vector.name)
})
test('ignores only default envelope/logical/version changes and object property order',async()=>{
 const {canonicalizeOperationalClaimsForContentId:canonical}=await load()
 const initial=canonical(vectors[0].claims)
 assert.equal(canonical(vectors[2].claims),initial)
 assert.equal(canonical(vectors[5].claims),initial)
 for(const index of [3,4,6,7])assert.notEqual(canonical(vectors[index].claims),initial)
})
test('retains Status Entry nested identifiers and numeric Unicode values with explicit options',async()=>{
 const {canonicalizeOperationalClaimsForContentId:canonical}=await load()
 const input=vectors[0].claims
 const projected=JSON.parse(canonical(input))
 assert.equal(projected['Composition.status'],input['Composition.status'])
 assert.deepEqual(projected['Composition.entry'],input['Composition.entry'])
 assert.deepEqual(projected.nested,input.nested)
 assert.equal(canonical(input,vectors[1].options),vectors[1].canonicalJson)
})
test('does not mutate frozen canonical input or reorder significant arrays',async()=>{
 const {canonicalizeOperationalClaimsForContentId:canonical}=await load()
 const input=structuredClone(vectors[0].claims)
 Object.freeze(input.nested.array);Object.freeze(input.nested);Object.freeze(input['Composition.entry']);Object.freeze(input)
 const before=JSON.stringify(input)
 assert.equal(canonical(input),vectors[0].canonicalJson)
 assert.equal(JSON.stringify(input),before)
})


test('rejects own prototype-control keys recursively before content projection',async()=>{
 const {canonicalizeOperationalClaimsForContentId:canonical}=await load()
 const unsafe=()=>JSON.parse('{"__proto__":{"polluted":true},"value":"retained"}')
 const candidates=[unsafe(),{nested:unsafe()},{nested:[unsafe()]}]
 const rejected=candidates.map(input=>{try{canonical(input);return false}catch(error){return error instanceof TypeError}})
 assert.deepEqual(rejected,[true,true,true])
})
test('retains ordinary constructor and prototype data fields',async()=>{
 const {canonicalizeOperationalClaimsForContentId:canonical}=await load()
 const input={constructor:{value:'retained'},prototype:{value:'retained'}}
 assert.deepEqual(JSON.parse(canonical(input)),input)
})
