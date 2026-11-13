// Copyright 2026 Antifraud Services Inc. under the Apache License, Version 2.0.

import type { ConsentRule } from 'fhir-data-utils-ts';

export type ConsentActorKind = 'professional' | 'related-person';

export type ConsentMatchKind =
  | 'direct'
  | 'organization'
  | 'jurisdiction'
  | 'none';

export type ConsentTargetKind =
  | 'email'
  | 'did'
  | 'organization'
  | 'jurisdiction'
  | 'phone'
  | 'unknown';

export type NormalizedConsentTarget = Readonly<{
  raw: string;
  kind: ConsentTargetKind;
  canonicalValue: string;
  isDirectTarget: boolean;
  isOrganizationTarget: boolean;
  isJurisdictionTarget: boolean;
  isPhoneExtension: boolean;
}>;

export type ConsentActorDescriptor = Readonly<{
  actorKind?: ConsentActorKind;
  email?: string;
  did?: string;
  /** Additional verified identifiers bound to the same actor. */
  aliases?: readonly string[];
  phone?: string;
  organizationDid?: string;
  organizationUrl?: string;
  jurisdiction?: string;
}>;

export type ResolvedConsentActor = Readonly<{
  actorKind: ConsentActorKind;
  directTargets: NormalizedConsentTarget[];
  organizationTargets: NormalizedConsentTarget[];
  jurisdictionTargets: NormalizedConsentTarget[];
  phoneTargets: NormalizedConsentTarget[];
}>;

export type ConsentCoverageRequest = Readonly<{
  subject?: string;
  actor: ConsentActorDescriptor;
  actorRole?: string;
  purpose?: string;
  sections?: string[];
  resourceTypes?: string[];
  now?: string | Date;
}>;

export type ConsentRuleMatch = Readonly<{
  rule: ConsentRule;
  ruleId?: string;
  decision: 'permit' | 'deny';
  matchKind: ConsentMatchKind;
  target: NormalizedConsentTarget;
  precedence: number;
  section?: string;
  resourceType?: string;
}>;

export type MissingPermissionSet = Readonly<{
  sections: string[];
  resourceTypes: string[];
  pairs: Array<{
    section?: string;
    resourceType?: string;
    reason: string;
  }>;
}>;

export type EffectiveAccessEvaluation = Readonly<{
  allowed: boolean;
  denied: boolean;
  partial: boolean;
  subject?: string;
  actor: ResolvedConsentActor;
  matchedRules: ConsentRuleMatch[];
  winningRules: ConsentRuleMatch[];
  explicitDenials: ConsentRuleMatch[];
  allowedSections: string[];
  deniedSections: string[];
  allowedResourceTypes: string[];
  deniedResourceTypes: string[];
  missing: MissingPermissionSet;
}>;

export type ActiveConsentView = Readonly<{
  activeRules: ConsentRule[];
  byDirectTarget: Record<string, ConsentRule[]>;
  byOrganizationTarget: Record<string, ConsentRule[]>;
  byJurisdictionTarget: Record<string, ConsentRule[]>;
  byPhoneTarget: Record<string, ConsentRule[]>;
}>;
