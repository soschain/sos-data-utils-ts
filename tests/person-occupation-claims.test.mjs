// Flow contract: shared Person occupation filters describe direct and split flat claims without importing the frozen catalog.
import assert from 'node:assert/strict'
import test from 'node:test'
import { SchemaOrgPersonClaim as Person } from '../dist/schema-org-claims.js'
test('owns direct occupation tokens and their split identifier fields',()=>{
 assert.equal(Person.HasOccupation,'org.schema.Person.hasOccupation')
 assert.equal(Person.OccupationIdentifierValue,'org.schema.Person.hasOccupation.identifier.value')
 assert.equal(Person.OccupationIdentifierSystem,'org.schema.Person.hasOccupation.identifier.additionalType')
})
