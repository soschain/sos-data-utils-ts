# Independent SOS contracts

SOS owns its operational batch and JSON:API extensions, editable permission
templates, deterministic Consent matching, route-sector taxonomy and service
capability tokens. These modules execute independent implementations.

`gateway-response-contract` owns SOS route namespaces and terminal entry
discriminators. Clinical OperationOutcome names still come from FHIR utilities.
`IncludedResource` requires identity, type and the worker's claims container;
the type alone does not validate or authorize a related resource. Compatibility
was reviewed against <https://github.com/Global-DataCare/gdc-common-utils-ts>,
specifically its [response vocabulary](https://github.com/Global-DataCare/gdc-common-utils-ts/blob/f4031b221216cacd9917d1d20c5ff0b03bed7045/src/constants/gateway-response.ts)
and [included-resource shape](https://github.com/Global-DataCare/gdc-common-utils-ts/blob/f4031b221216cacd9917d1d20c5ff0b03bed7045/src/models/jsonapi.ts).

Service-capability parsing retains historical spellings, normalizes known tokens
and preserves unknown extension tokens in first-occurrence order. Family lookup
classifies advertisements; it does not validate operation suffixes or grant
authority. Gateways must still apply their own known-service allowlists and
authorization. Compatibility was reviewed against the original repository
<https://github.com/Global-DataCare/gdc-common-utils-ts>, specifically its
[service-capability source](https://github.com/Global-DataCare/gdc-common-utils-ts/blob/f4031b221216cacd9917d1d20c5ff0b03bed7045/src/constants/service-capabilities.ts).

Clinical/FHIR vocabulary and canonicalization come from FHIR data utilities.
Neutral Schema.org identities, occupation definitions and encoding primitives
come from Antifraud data utilities. The SOS claim exports retain their existing
finite field selection and order rather than exposing every new cross-sector
field. `HealthcareActorRoles` projects the shared occupation codes into
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

The Consent matching implementation and its neutral input/output shapes originate
from <https://github.com/Global-DataCare/gdc-common-utils-ts>, specifically the
reviewed [Consent implementation](https://github.com/Global-DataCare/gdc-common-utils-ts/blob/f4031b221216cacd9917d1d20c5ff0b03bed7045/src/utils/consent.ts).
Canonical
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

The `confidential-storage` subpath owns SOS record, index, audit and blob-reference
shapes. Coding metadata reuses the generic FHIR Coding type. Decrypted projections
require their specific content type and omit the inline JWE field. These contracts
do not select a database, store plaintext, externalize blobs or perform encryption;
those operations belong to SDK runtime adapters behind the shared storage port.

`confidential-job` owns SOS route selectors, processing-state values and decoded
message envelopes over those records. Signing/encryption header shapes come from
Antifraud. Decoding metadata is not proof of successful verification: the trusted
runtime must authenticate the signer and audience before using it as authority.
The typed body can be narrowed by each operation's claims-first contract.

`json-projection` removes undefined object properties and array entries from
JSON-shaped records for index persistence. It preserves explicit null values
and is separate from FHIR/JCS canonicalization and the confidential payload.

`gateway-did-profile` adds SOS route selectors and advertised operation lists to
Antifraud's generic DID service/document contracts. The generic standard model
keeps unknown extensions unknown; this profile declares its own fields explicitly.
An advertisement remains metadata and does not establish access authority.

