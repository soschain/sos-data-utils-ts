// Flow contract: SOS authors one claims-first batch contract with exact entry scope, optimistic versioning and isolated readback; no downstream transport or legacy implementation participates.
import assert from 'node:assert/strict'
import test from 'node:test'
import {BundleEditor,BundleReader} from '../dist/bundle-contract.js'

test('stages exact claims and optimistic requests without exposing mutable editor state',()=>{
  const editor=new BundleEditor().setBundleOperation('create').setBundleType('batch').setAllowedResourceType('Consent')
  editor.newEntryAs('Consent','one').setIdentifier('one').setSubject('Patient/one').setSectionList(['section','section']).update().ifMatch('version')
  const bundle=editor.buildJsonApi()
  assert.equal(new BundleReader(bundle).getBundleType(),'batch')
  assert.deepEqual(bundle.data[0].request,{method:'PUT',url:'Consent/one',ifMatch:'W/"version"'})
  assert.equal(bundle.data[0].resource.meta.claims['Consent.action'],'section')
  bundle.data[0].resource.meta.claims['Consent.subject']='Patient/changed'
  assert.equal(new BundleReader(editor.build()).getEntryClaimsByArrayIndex(0)['Consent.subject'],'Patient/one')
  assert.throws(()=>editor.newEntryAs('RelatedPerson','two'))
  assert.throws(()=>new BundleReader({resourceType:'Patient'}))
})
