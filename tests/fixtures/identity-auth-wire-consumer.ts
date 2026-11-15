// Flow contract: wire constants preserve narrow action values and computed payload fields, independently from verified actor and grant admission.
import {
  IdentityAuthActions, IdentityAuthRequestFields, IdentityAuthResourceTypes,
  IdentityAuthResponseTypes, IdentityDcrMetadataFields, SmartPostDcrActions,
} from 'sos-data-utils-ts/identity-auth-wire-contract';

const action: '_dcr' = IdentityAuthActions.Dcr;
const resource: 'smart' = IdentityAuthResourceTypes.Smart;
const response: 'device-revoke-response' = IdentityAuthResponseTypes.DeviceRevoke;
const request: { subject_token: string; client_instance_id: string } = {
  [IdentityAuthRequestFields.SubjectToken]: 'opaque-subject-token',
  [IdentityAuthRequestFields.ClientInstanceId]: 'opaque-installation',
};
const metadata: { clinical_creator_binding: unknown } = {
  [IdentityDcrMetadataFields.ClinicalCreatorBinding]: undefined,
};
const poll: 'token-response' = SmartPostDcrActions.TokenResponse;
// @ts-expect-error SMART post-DCR token is deliberately not the underscored token action.
const underscored: '_token' = SmartPostDcrActions.Token;
// @ts-expect-error catalog literals cannot silently widen an issue operation to registration.
const issue: '_dcr' = IdentityAuthActions.Issue;
// @ts-expect-error public catalogs remain readonly.
IdentityAuthRequestFields.ClientId = 'another_client_id';
void [action, resource, response, request, metadata, poll, underscored, issue];
