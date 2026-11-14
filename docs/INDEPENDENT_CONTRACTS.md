# Independent SOS contracts

SOS owns its operational batch and JSON:API extensions, editable permission
templates, deterministic Consent matching, route-sector taxonomy and service
capability tokens. These modules execute directly; they do not delegate to a
frozen project, package alias or compatibility wrapper.

Clinical/FHIR vocabulary and canonicalization come from FHIR data utilities.
Occupation definitions and encoding primitives come from Antifraud data
utilities. `HealthcareActorRoles` projects the shared occupation codes into
SOS claim values; controller authority stays distinct from an occupation.

Healthcare family lookup uses the same standard occupation and HL7 descriptor
sources. Dentistry is an occupation; Controller and personal relationships are
separate families. Lookup maps have no inherited role entries. Selection order
is SOS policy, not a FHIR default or a permission grant. Descriptor coding-system
fields preserve the historical `org.ilo.isco` namespace for occupations. The
`org.ilo.isco-08` translation/evaluator namespace is also accepted. An external
FHIR profile may use a different identifier; no single ILO-issued canonical URI
is asserted here. Alias lookup never makes a role into proof of employment or an
active licence. Unrelated occupations remain outside the healthcare catalog.

`bundle-contract` stages claims under `resource.meta.claims`, returns isolated
batch snapshots and preserves exact entry requests and optimistic versions.
It does not authorize a request or select a transport or persistence adapter.

The Consent matching implementation and its neutral input/output shapes were
migrated from the reviewed Apache-licensed predecessor source. That predecessor
is read-only evidence, not an installed runtime or test dependency. Canonical
Consent claim names and resource shapes remain imported from FHIR utilities.

Historical persisted wire identifiers, including the individual-section URN,
remain accepted byte-for-byte. Their spelling does not introduce a dependency
on a package implementation. Renaming persisted identifiers requires a separate
data migration.

The dependency tests inspect declarations, emitted/static imports, aliases and
the resolved lockfile. Passing them does not replace downstream user-journey
validation or publication verification.
The `consent-smart-scopes` entry point owns the SOS gateway Composition scope
profile. It projects authenticated caller context and authoritative Consent into
explicit read-only grants; it does not authenticate, sign tokens or persist data.
Existing reverse-DNS ISCO values remain valid and unchanged. The ILO page URL
used by WHO SMART Base is an additional comparison alias, not a universally
assigned ILO identifier, a storage migration or a network endpoint.

The shared Antifraud guard also accepts HL7 Terminology's ISCO-08 identifier,
`urn:oid:2.16.840.1.113883.2.9.6.2.7`. Lookup accepts it as the system part of a
`system|code` token; native FHIR exchange can place it in `Coding.system` with
the occupation code in `Coding.code`. This preserves profile-specific export
identifiers without duplicating the cross-sector occupation catalog in FHIR.

