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
fields contain standard URIs; the deprecated `ISCO08_CODING_SYSTEM` value retains
the historical `org.ilo.isco` claim namespace solely for persisted-token
compatibility. Alias lookup never makes a role into proof of employment or an
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
