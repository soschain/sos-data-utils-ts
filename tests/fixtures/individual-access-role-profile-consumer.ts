// Flow contract: public application-role types stay narrow; neither code membership nor descriptors establish subject authority.
import {IndividualMemberRelationshipCodes,IndividualMemberRelationshipRoles,isIndividualMemberRelationshipCode,normalizeIndividualMemberRelationshipCode,type IndividualMemberRelationshipCode,type PersonalAccessRoleCode} from 'sos-data-utils-ts/individual-access-role-profile';
import type {PersonalAccessRoleCode as RootAccessRole} from 'sos-data-utils-ts';
const member:IndividualMemberRelationshipCode='GGRPRN';
const access:PersonalAccessRoleCode='RESPRSN';
const root:RootAccessRole='ONESELF';
const unknown:unknown=' frnd ';
const normalized=normalizeIndividualMemberRelationshipCode(unknown);
if(normalized){const accepted:IndividualMemberRelationshipCode=normalized;void accepted}
if(isIndividualMemberRelationshipCode(unknown)){
 // @ts-expect-error A boolean check of a normalized value cannot narrow the original input.
 const raw:IndividualMemberRelationshipCode=unknown;void raw;
}
// @ts-expect-error Full-vocabulary great-grandfather is outside this compact profile.
const broader:IndividualMemberRelationshipCode='GGRFTH';
// @ts-expect-error Self access is not an individual-member relationship choice.
const self:IndividualMemberRelationshipCode='ONESELF';
// @ts-expect-error A family relationship is not one of the two personal-access roles.
const family:PersonalAccessRoleCode='FAMMEMB';
// @ts-expect-error Public choices are readonly.
IndividualMemberRelationshipCodes.push('FRND');
// @ts-expect-error Canonical descriptors remain immutable.
IndividualMemberRelationshipRoles[0].code='FRND';
void [member,access,root,broader,self,family];
