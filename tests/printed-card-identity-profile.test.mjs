// Flow contract: printed-card composition preserves captured animal and human checksum bytes, provider-scoped personal digits and legacy locator spelling without rekeying or granting identity authority.
import assert from 'node:assert/strict'
import test from 'node:test'
import {readFileSync} from 'node:fs'
import {spawnSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'
const api=()=>import('../dist/printed-card-identity.js')
const fixture=()=>JSON.parse(readFileSync(new URL('./fixtures/printed-card-identity-recorded-wire.json',import.meta.url),'utf8'))
const profiles={animal:'animal21-v1',human:'human21-v1',did:'uhc-personal-v1',digits:'provider-damm-v1'}
const invokers={
 species:(p,input)=>p.normalizePrintedAnimalSpeciesId7(input),
 animalBuild:(p,input)=>p.buildPrintedAnimalCardNumber21({...input,profile:profiles.animal}),
 animalValidate:(p,input)=>p.validatePrintedAnimalCardNumber21({...input,profile:profiles.animal}),
 humanBuild:(p,input)=>p.buildPrintedHumanCardNumber21({...input,profile:profiles.human}),
 humanDid:(p,input)=>p.buildPrintedHumanCardDidWeb({...input,profile:profiles.did}),
 personalDigits:(p,input)=>p.buildProviderScopedPersonalDigits({...input,profile:profiles.digits}),
}
for(const [operation,invoke] of Object.entries(invokers))test('printed identity preserves recorded '+operation+' boundaries',async()=>{
 const p=await api(),rows=fixture().rows.filter(row=>row.operation===operation);assert.ok(rows.length>0)
 for(const row of rows){const before=structuredClone(row.input);if(row.throws)assert.throws(()=>invoke(p,row.input));else assert.deepEqual(invoke(p,row.input),row.output);assert.deepEqual(row.input,before)}
})
test('printed identity exposes exact public profile types without admitting an unselected wire profile',async()=>{
 const p=await api(),root=await import('../dist/index.js')
 for(const name of ['normalizePrintedAnimalSpeciesId7','buildPrintedAnimalCardNumber21','validatePrintedAnimalCardNumber21','buildPrintedHumanCardNumber21','buildPrintedHumanCardDidWeb','buildProviderScopedPersonalDigits'])assert.equal(root[name],p[name])
 const row=fixture().rows.find(row=>row.operation==='humanBuild'&&!row.throws)
 assert.throws(()=>p.buildPrintedHumanCardNumber21({...row.input,profile:profiles.animal}),/profile/i)
 const result=spawnSync(process.execPath,[fileURLToPath(new URL('../node_modules/typescript/bin/tsc',import.meta.url)),'--noEmit','--strict','--skipLibCheck','--module','NodeNext','--moduleResolution','NodeNext','--target','ES2022',fileURLToPath(new URL('./fixtures/printed-card-identity-consumer.ts',import.meta.url))],{encoding:'utf8'})
 assert.equal(result.status,0,result.stdout+result.stderr)
})

test('reads the canonical and historical human locators as the same printed card',async()=>{
 const p=await api(),root=await import('../dist/index.js')
 const {output:cardNumber21}=fixture().rows.find(row=>row.operation==='humanBuild'&&!row.throws)
 const {input:{host}}=fixture().rows.find(row=>row.operation==='humanDid'&&!row.throws)
 const cardUrn=`urn:cds:v1:uhc:person:${cardNumber21}`
 const expected={cardNumber21,providerCode9:cardNumber21.slice(0,9),subjectCode12:cardNumber21.slice(9),cardUrn}
 const printed=`${cardNumber21.slice(0,9)}-${cardNumber21.slice(9)}`
 const did=p.buildPrintedHumanCardDidWeb({profile:profiles.did,host,cardNumber21})
 assert.deepEqual(p.parsePrintedHumanCardNumber21(printed),expected)
 for(const locator of [cardUrn,`URN:CDS:V1:CARD:UHC:PERSONAL:${printed}`,did]){
  assert.deepEqual(p.parsePrintedHumanCardLocator(` ${locator} `),expected)
 }
 const invalid=cardNumber21.slice(0,20)+String((Number(cardNumber21.at(-1))+1)%10)
 assert.throws(()=>p.parsePrintedHumanCardNumber21(invalid),/check digit/iu)
 assert.equal(p.parsePrintedHumanCardLocator(`urn:cds:v1:uhc:person:${invalid}`),undefined)
 assert.equal(p.parsePrintedHumanCardLocator(cardNumber21),undefined)
 assert.equal(root.parsePrintedHumanCardLocator,p.parsePrintedHumanCardLocator)
})
