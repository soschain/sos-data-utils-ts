// Flow contract: the compact SOS application profile preserves its ordered member choices and normalization without broadening the canonical HL7 catalog or granting authority.
import assert from 'node:assert/strict';
import test from 'node:test';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const owner=()=>import('../dist/individual-access-role-profile.js');
const expected=['FAMMEMB','WIFE','HUSB','DOMPART','SIS','BRO','SON','DAU','PRN','GRPRN','GRNDCHILD','GGRPRN','FRND','NBOR','ROOM'];

test('compact application choices retain all fifteen codes in their exact order',async()=>{
 const profile=await owner(),root=await import('../dist/index.js'),leaf=await import('sos-data-utils-ts/individual-access-role-profile');
 assert.deepEqual(profile.IndividualMemberRelationshipCodes,expected);
 assert.deepEqual(profile.IndividualMemberRelationshipRoles.map(role=>role.code),expected);
 assert.equal(root.IndividualMemberRelationshipRoles,profile.IndividualMemberRelationshipRoles);
 assert.equal(leaf.IndividualMemberRelationshipCodes,profile.IndividualMemberRelationshipCodes);
 assert.equal(Object.isFrozen(profile.IndividualMemberRelationshipCodes),true);
 assert.equal(Object.isFrozen(profile.IndividualMemberRelationshipRoles),true);
 assert.throws(()=>profile.IndividualMemberRelationshipCodes.push('ONESELF'),TypeError);
});

test('member descriptors reuse the declared FHIR vocabulary and version without duplicating the standard',async()=>{
 const profile=await owner(),fhir=await import('fhir-data-utils-ts');
 assert.equal(profile.IndividualAccessRoleVocabularyVersion,fhir.HL7_ROLE_CODE_VERSION);
 for(const role of profile.IndividualMemberRelationshipRoles){
  assert.equal(role,fhir.HL7_PERSONAL_RELATIONSHIP_ROLES.find(item=>item.code===role.code));
  assert.equal(role.codingSystem,fhir.HL7_CODING_SYSTEM_V3_ROLE_CODE);
  assert.equal(Object.isFrozen(role),true);
  assert.equal('grantsAuthority' in role,false);
 }
 assert.ok(fhir.HL7_PERSONAL_RELATIONSHIP_ROLES.some(role=>role.code==='GGRFTH'));
 assert.equal(profile.isIndividualMemberRelationshipCode('GGRFTH'),false);
});

test('normalization returns a canonical code while the boolean guard preserves string case/space compatibility',async()=>{
 const {isIndividualMemberRelationshipCode:accepts,normalizeIndividualMemberRelationshipCode:normalize}=await owner();
 for(const code of expected){assert.equal(accepts(code),true);assert.equal(accepts(' '+code.toLowerCase()+' '),true);assert.equal(normalize(' '+code.toLowerCase()+' '),code)}
 for(const value of [undefined,null,false,0,23,'',' ','ONESELF','RESPRSN','SPS','GGRFTH','FAMMEMB|WIFE','org.hl7.v3.RoleCode|FAMMEMB',[],['FRND'],{},new String('FRND'),{toString:()=> ' frnd '}]){assert.equal(accepts(value),false);assert.equal(normalize(value),undefined)}
});

test('personal access is the separate exact two-code application subset, not a member fallback',async()=>{
 const profile=await owner(),fhir=await import('fhir-data-utils-ts');
 assert.deepEqual(profile.PersonalAccessRoleCodes,['ONESELF','RESPRSN']);
 assert.equal(Object.isFrozen(profile.PersonalAccessRoleCodes),true);
 for(const code of profile.PersonalAccessRoleCodes){
  assert.ok([...fhir.HL7_PERSONAL_RELATIONSHIP_ROLES,...fhir.HL7_RELATED_PERSON_FUNCTIONAL_ROLES].some(role=>role.code===code));
  assert.equal(profile.isIndividualMemberRelationshipCode(code),false);
 }
});

test('public types retain the exact unions and readonly descriptors',()=>{
 const result=spawnSync(process.execPath,[fileURLToPath(new URL('../node_modules/typescript/bin/tsc',import.meta.url)),
 '--noEmit','--strict','--skipLibCheck','--module','NodeNext','--moduleResolution','NodeNext','--target','ES2022',
 fileURLToPath(new URL('./fixtures/individual-access-role-profile-consumer.ts',import.meta.url))],{encoding:'utf8'});
 assert.equal(result.error,undefined);assert.equal(result.status,0,result.stdout+result.stderr);
});
