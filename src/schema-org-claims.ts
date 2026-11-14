// Copyright 2026 ConnectHealth.info (Connecting Solution & Applications Ltd.) under the Apache License, Version 2.0.

import {
  SchemaOrgOrganizationClaim as AntifraudSchemaOrgOrganizationClaim,
  SchemaOrgPersonClaim as AntifraudSchemaOrgPersonClaim,
  SchemaOrgActionClaim as AntifraudSchemaOrgActionClaim,
} from 'antifraud-data-utils-ts/schema-org-claims'


/** Preserve the SOS public field selection while Antifraud owns neutral claim identities. */
export const SchemaOrgOrganizationClaim = Object.freeze({
  AdditionalType: AntifraudSchemaOrgOrganizationClaim.AdditionalType,
  SameAs: AntifraudSchemaOrgOrganizationClaim.SameAs,
  AddressCountry: AntifraudSchemaOrgOrganizationClaim.AddressCountry,
  AddressRegion: AntifraudSchemaOrgOrganizationClaim.AddressRegion,
  AddressLocality: AntifraudSchemaOrgOrganizationClaim.AddressLocality,
  PostalCode: AntifraudSchemaOrgOrganizationClaim.PostalCode,
  StreetAddress: AntifraudSchemaOrgOrganizationClaim.StreetAddress,
  IdentifierType: AntifraudSchemaOrgOrganizationClaim.IdentifierType,
  IdentifierValue: AntifraudSchemaOrgOrganizationClaim.IdentifierValue,
  LegalName: AntifraudSchemaOrgOrganizationClaim.LegalName,
  Name: AntifraudSchemaOrgOrganizationClaim.Name,
  AlternateName: AntifraudSchemaOrgOrganizationClaim.AlternateName,
  TaxId: AntifraudSchemaOrgOrganizationClaim.TaxId,
  Email: AntifraudSchemaOrgOrganizationClaim.Email,
  Telephone: AntifraudSchemaOrgOrganizationClaim.Telephone,
  OwnerAlternateName: AntifraudSchemaOrgOrganizationClaim.OwnerAlternateName,
  OwnerEmail: AntifraudSchemaOrgOrganizationClaim.OwnerEmail,
  OwnerTelephone: AntifraudSchemaOrgOrganizationClaim.OwnerTelephone,
  OwnerIdentifierValue: AntifraudSchemaOrgOrganizationClaim.OwnerIdentifierValue,
  MemberAlternateName: AntifraudSchemaOrgOrganizationClaim.MemberAlternateName,
  MemberName: AntifraudSchemaOrgOrganizationClaim.MemberName,
  MemberAdditionalType: AntifraudSchemaOrgOrganizationClaim.MemberAdditionalType,
  MemberGivenName: AntifraudSchemaOrgOrganizationClaim.MemberGivenName,
  MemberFamilyName: AntifraudSchemaOrgOrganizationClaim.MemberFamilyName,
  MemberBirthDate: AntifraudSchemaOrgOrganizationClaim.MemberBirthDate,
  MemberGender: AntifraudSchemaOrgOrganizationClaim.MemberGender,
  MemberEmail: AntifraudSchemaOrgOrganizationClaim.MemberEmail,
  MemberTelephone: AntifraudSchemaOrgOrganizationClaim.MemberTelephone,
  MemberIdentifierType: AntifraudSchemaOrgOrganizationClaim.MemberIdentifierType,
  MemberIdentifierValue: AntifraudSchemaOrgOrganizationClaim.MemberIdentifierValue,
  MemberRole: AntifraudSchemaOrgOrganizationClaim.MemberRole,
  NumberOfEmployees: AntifraudSchemaOrgOrganizationClaim.NumberOfEmployees,
} as const);

export type SchemaOrgOrganizationClaimKey =
  typeof SchemaOrgOrganizationClaim[keyof typeof SchemaOrgOrganizationClaim];

/** Schema.org person/controller claims needed by shared onboarding forms. */
export const SchemaOrgPersonClaim = Object.freeze({
  HasOccupation: AntifraudSchemaOrgPersonClaim.HasOccupation,
  OccupationIdentifierValue: AntifraudSchemaOrgPersonClaim.OccupationIdentifierValue,
  OccupationIdentifierSystem: AntifraudSchemaOrgPersonClaim.OccupationIdentifierSystem,
  AdditionalType: AntifraudSchemaOrgPersonClaim.AdditionalType,
  AlternateName: AntifraudSchemaOrgPersonClaim.AlternateName,
  BirthDate: AntifraudSchemaOrgPersonClaim.BirthDate,
  Email: AntifraudSchemaOrgPersonClaim.Email,
  FamilyName: AntifraudSchemaOrgPersonClaim.FamilyName,
  Gender: AntifraudSchemaOrgPersonClaim.Gender,
  GivenName: AntifraudSchemaOrgPersonClaim.GivenName,
  Identifier: AntifraudSchemaOrgPersonClaim.Identifier,
  IdentifierType: AntifraudSchemaOrgPersonClaim.IdentifierType,
  IdentifierValue: AntifraudSchemaOrgPersonClaim.IdentifierValue,
  SameAs: AntifraudSchemaOrgPersonClaim.SameAs,
  Name: AntifraudSchemaOrgPersonClaim.Name,
  Telephone: AntifraudSchemaOrgPersonClaim.Telephone,
} as const);

export type SchemaOrgPersonClaimKey = typeof SchemaOrgPersonClaim[keyof typeof SchemaOrgPersonClaim];

/** Schema.org Action claims used to retain who initiated an onboarding write and when. */
export const SchemaOrgActionClaim = Object.freeze({
  AgentIdentifier: AntifraudSchemaOrgActionClaim.AgentIdentifier,
  ParticipantIdentifier: AntifraudSchemaOrgActionClaim.ParticipantIdentifier,
  ProviderIdentifier: AntifraudSchemaOrgActionClaim.ProviderIdentifier,
  StartTime: AntifraudSchemaOrgActionClaim.StartTime,
} as const);

export type SchemaOrgActionClaimKey = typeof SchemaOrgActionClaim[keyof typeof SchemaOrgActionClaim];
