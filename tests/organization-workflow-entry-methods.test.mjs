// Flow contract: Group workflow wire keeps POST/PATCH while actual Consent assignment/revocation uses POST/PUT with the complete original claims. Neither method selection nor attachment omission is authority; the GW must enforce its exact governed profile.
import assert from 'node:assert/strict'
import test from 'node:test'
import ts from 'typescript'
import {fileURLToPath} from 'node:url'
import {buildTestNetworkControllerWorkflowAssignment,OrganizationWorkflowGroupKinds,OrganizationWorkflowCapabilities} from '../dist/organization-workflow-access.js'
import {REPOSITORY_SAFE_EXAMPLES as safe} from '../dist/repository-privacy.js'
import {HealthcareActorRoles} from '../dist/healthcare-roles.js'
import {ClaimConsent} from 'fhir-data-utils-ts'

test('public workflow entry typing admits actual Consent PUT and rejects unsupported Group/Consent methods',()=>{
 const program=ts.createProgram([fileURLToPath(new URL('./fixtures/organization-workflow-consent-put-consumer.ts',import.meta.url))],{target:ts.ScriptTarget.ES2023,module:ts.ModuleKind.NodeNext,moduleResolution:ts.ModuleResolutionKind.NodeNext,strict:true,noEmit:true,skipLibCheck:true,types:[]})
 assert.deepEqual(ts.getPreEmitDiagnostics(program).map(value=>ts.flattenDiagnosticMessageText(value.messageText,'\n')),[])
})

test('existing governed authorization retains exact scope/actor/date claims and has no fabricated document attachment',()=>{
 const plan=buildTestNetworkControllerWorkflowAssignment({networkKind:'test-network',controller:{authorityKind:'organization-controller',organizationReference:`Organization/${safe.resourceUuid}`,accountId:'synthetic-controller-account'},member:{accountId:'synthetic-employee-account',practitionerRoleReference:`PractitionerRole/${safe.demoOrganizationUuids.healthCare}`,role:HealthcareActorRoles.Dentist},groupKind:OrganizationWorkflowGroupKinds.SchedulingOperations,groupReference:`Group/${safe.resourceUuid}`,capabilities:[OrganizationWorkflowCapabilities.ScheduleCruds],assignedAt:'2026-11-15T00:00:00.000Z'})
 const claims=plan.authorization.resource.meta.claims
 assert.equal(claims[ClaimConsent.subject],plan.organizationReference)
 assert.equal(claims[ClaimConsent.actorIdentifier],plan.memberPractitionerRoleReference)
 assert.equal(claims[ClaimConsent.actorRole],plan.memberRole)
 assert.equal(claims[ClaimConsent.date],plan.assignedAt)
 assert.equal(claims[ClaimConsent.action],plan.capabilities.join(','))
 assert.equal(Object.hasOwn(claims,ClaimConsent.attachmentData),false)
})
