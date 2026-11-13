# Independent SOS contracts

SOS owns its operational batch and JSON:API extensions, editable permission
templates, deterministic Consent matching, route-sector taxonomy and service
capability tokens. These modules execute directly; they do not delegate to a
frozen project, package alias or compatibility wrapper.

Clinical/FHIR vocabulary and canonicalization come from FHIR data utilities.
Occupation definitions and encoding primitives come from Antifraud data
utilities. `HealthcareActorRoles` projects the shared occupation codes into
SOS claim values; controller authority stays distinct from an occupation.

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
