// Flow contract: index-friendly JSON projection removes only undefined values without mutating claims or interpreting object keys as prototypes.
import assert from 'node:assert/strict'
import test from 'node:test'
import * as data from '../dist/index.js'
test('removes nested undefined properties and array entries while preserving significant false/null/zero values',()=>{
 assert.equal(typeof data.stripUndefinedDeep,'function')
 assert.equal(data.CONFIDENTIAL_JWE_BLOB_CONTENT_TYPE,'application/jose+json')
 const input={keep:0,flag:false,empty:'',nil:null,omit:undefined,nested:{retain:'value',omit:undefined},items:[undefined,0,null,false,{omit:undefined,retain:'value'}]}
 const result=data.stripUndefinedDeep(input)
 assert.deepEqual(result,{keep:0,flag:false,empty:'',nil:null,nested:{retain:'value'},items:[0,null,false,{retain:'value'}]})
 assert.equal(Object.hasOwn(input,'omit'),true)
 assert.equal(input.items.length,5)
 assert.notEqual(result.nested,input.nested)
})
test('retains an own prototype-shaped JSON key without changing any object prototype',()=>{
 const input=JSON.parse('{"__proto__":{"retained":true},"nested":{"constructor":"retained"}}')
 const result=data.stripUndefinedDeep(input)
 assert.equal(Object.hasOwn(result,'__proto__'),true)
 assert.equal(Object.getPrototypeOf(result),Object.prototype)
 assert.equal(Object.hasOwn(Object.prototype,'retained'),false)
 assert.deepEqual(result,input)
})
