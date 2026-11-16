# Independent SOS contracts

SOS owns its operational batch and JSON:API extensions, editable permission
templates, deterministic Consent matching, route-sector taxonomy and service
capability tokens. These modules execute independent implementations.

Neutral record identity and the four-method storage port belong to Antifraud's
`vault-repository` contract. SOS Data preserves its existing `RecordBase` export;
SOS runtime layers consume the same neutral types. This does not unify the
gateway's richer abstract repository or add indexed-attribute query semantics.
Persistence adapters and key custody remain outside these data contracts.

`gateway-sector-contract` retains the finite route-context enum and its public
namespace typing. It is separate from the broader `DataspaceSectors` service
catalogue; neither catalogue establishes actor eligibility. The reserved system
bootstrap context remains a compatibility value. Reviewed original source:
<https://github.com/Global-DataCare/gdc-common-utils-ts>, specifically its
[route context](https://github.com/Global-DataCare/gdc-common-utils-ts/blob/f4031b221216cacd9917d1d20c5ff0b03bed7045/src/models/urlPath.ts).

`communication-message-contract` owns the internal SOS data-entry body over
Antifraud's neutral DIDComm envelope. Its protocol type, entry type and native
FHIR resource type describe distinct layers; none establishes authentication or
resource authority. Existing gateway consumers retain mutable internal entry
arrays. Reviewed original compatibility source:
<https://github.com/Global-DataCare/gdc-common-utils-ts>, specifically its
[message projection](https://github.com/Global-DataCare/gdc-common-utils-ts/blob/f4031b221216cacd9917d1d20c5ff0b03bed7045/src/models/comm.ts).
The default submission Accept header is SOS adapter policy in `bff-wire-contract`;
its plaintext DIDComm media type is imported from Antifraud's protocol contract.

`clinical-creator-contract` describes the SOS clinical actor profile. A binding
keeps person, assignment and owner identities separate. Its historical
`authorIdentifier` stores the assignment used for attestation and permission
matching; it is not the person identifier or the document's source author.
Channel aliases require caller verification. Replacement outcomes describe a
narrow successor update and never grant delete access. Normalization, matching
and policy evaluation belong to the SDK; authentication and repository authority
remain in the gateway. Reviewed compatibility source:
<https://github.com/Global-DataCare/gdc-common-utils-ts>, specifically its
[creator profile](https://github.com/Global-DataCare/gdc-common-utils-ts/blob/f4031b221216cacd9917d1d20c5ff0b03bed7045/src/utils/fhir-ips-creator-identity.ts)
and [replacement profile](https://github.com/Global-DataCare/gdc-common-utils-ts/blob/f4031b221216cacd9917d1d20c5ff0b03bed7045/src/utils/clinical-resource-replacement.ts).

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


## Identity presentations and access evidence

`professional-smart` and `individual-smart` own the SOS employee, individual
controller and authorized-member credential projections. A professional
occupation, legal representation, controller role and personal relationship
remain distinct. Builders preserve the existing public contact hashes and
signing-material fields; readers decode and match claims after an enclosing
verifier has checked their signatures and current authority.

`vp-token` and `jwt` assemble presentation data and exact compact signing inputs.
They reuse Antifraud's credential models, unverified data readers and byte
encoding. They perform no signature verification. Unsigned builders are explicit
fixture utilities; they do not select a runtime verification mode. Real signature
verification belongs to `antifraud-data-utils-ts/clearing-house` and the owning
cryptography engine.

`subject-identity-binding` matches trusted individual alias sets while excluding
physical-card DIDs. `inter-tenant-access-contract` projects the FHIR Contract,
its legally authorized signatories and bilateral agreement-proof bindings.
Consent delegation reuses FHIR's claim keys. These helpers match already-verified
evidence; ledger state, credential status and cryptographic proof validation
remain responsibilities of the trusted application verifier.

`smart-authorization-profile` distinguishes direct VC Data Model 2.0 presentations
from explicitly reported legacy JWT wrappers, rejects ambiguous forms and
projects read-only emergency authorization details. `activation-policy` keeps
controller authority and service permissions separate from identity decoding.

The bounded compatibility reference is the reviewed credential/presentation
helper source at commit
[`74479fa3fc8d8cbf92a9ff13dd626ccf8d6f2b1e`](https://github.com/Global-DataCare/gdc-common-utils-ts/tree/74479fa3fc8d8cbf92a9ff13dd626ccf8d6f2b1e/src/utils).
The implementation imports no predecessor package. Synthetic golden projections
retain the reviewed contact-hash and signing-byte profile. Fresh deterministic
fixtures come from `identity-presentation-examples`, which derives all example
identities from `repository-privacy` and returns unsigned presentation data.


## Gateway scheduling, catalogue and signed health-card contracts

The gateway-facing neutral contracts selectively retain the reviewed
scheduling, Provenance, claims-only directory, HealthDCAT publication, ISO
jurisdiction and signed-SHC preparation behavior from the prior package.
The source and dataset attribution are recorded in NOTICE. Static vectors
retain exact outputs for governed synthetic examples without importing the
prior package at test time.

- Scheduling reuses the canonical FHIR Schedule/Slot graphs and existing
  organization-scoped resource identity helpers. Optional appointment-response
  notifications require an explicit topic profile; there is no product topic
  selected by default.
- Directory resources remain claims-only Organization, Place, Service and
  Product records. The neutral module does not contain veterinary service
  category allowlists, sector presentation rules or marketplace routing.
- HealthDCAT builders preserve explicit controller checks, data-holder and
  intermediary provenance, editorial record status and discovery distinctions.
- ISO country/subdivision data retains the Debian iso-codes provenance and
  complete reviewed dataset, rather than a partial country allowlist.
- Signed health-card preparation reuses FHIR canonicalization and neutral
  encoding. It produces exact ES256 signing input, not a positive signature
  verification result. QR encoding remains in the existing clinical-document
  helper; detached PQC proof encoding remains with neutral cryptography.
- Payment exposes provider identifiers and non-operational test values, not
  provider reconciliation, signing keys or RPC configuration.

Animal-specific insurance consent and emergency policy retain separate domain
ownership. Reminder authorization orchestration and research-study workflow
builders belong to their SDK owners. Removing a dependency never substitutes
an unsigned demonstration card or relaxes current identity and consent checks.

## Hosted identity routing and Subject lookup

The hosted DID and actor contracts preserve the established path and terminal
role parsing rules. UUID identifiers are hashed as canonical 16-byte values;
email, telephone and governed identifiers retain their exact normalization and
SHA3-384 multihash profile. Clinical identifier code values come from FHIR,
encoding comes from neutral Antifraud, and member parsing reuses the existing
SOS routing contract. A parsed role or opaque hash is never an authorization.

Subject entries preserve semantic Person, Animal or Place resources and stable
card references in protected claims. Their public ledger payload contains only
the index-provider DID; it never exposes the private identifier or card mapping.
Organization DID binding replaces aliases for the tenant selected by the host,
and rejects alternate payload identity locators. Postal binding exports only
its protected-code wire types and lifecycle; host-only code verification and
pepper custody remain in the Node gateway. These modules are browser-safe.

Organization role-licence identities retain their jurisdiction, official legal
identifier, opaque stable contact and licensed-role preimage. Exact-sector
policies reject wildcards, duplicate sectors and non-positive device limits.
Revoked licences never permit a sector. Legal-sector organization bindings
retain their canonical ten-part grammar and SHA3-256 lookup; public aliases
retain their distinct SHA3-384 lookup. These are protocol identities, not grants.

### Synthetic gateway flow examples

`gateway-flow-examples` owns the shared synthetic descriptors used by gateway
consumer tests. Hosted individual and member DIDs, organization authorization
URNs, multibase values and FHIR claim names come from their independent owners.
Reserved contact origins and governed telephone values come from
`repository-privacy`. Linked fixture values remain consistent across flows;
using a fixture does not confer authentication, task permission or consent.
