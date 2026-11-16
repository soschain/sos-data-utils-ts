# Shared data-package boundary

`sos-data-utils-ts` is a product-neutral data-contract package. Its public
surface is limited to deterministic types, schemas, builders, parsers,
validators, governed catalogs and repository-safe fixtures.

Runtime and application layers import `sos-data-utils-ts`. This package imports
the canonical FHIR utilities and Antifraud's neutral identity, security,
occupation and encoding contracts. Those lower-level packages do not import
this package. FHIR utilities
remain independent of Antifraud's occupation catalog.

SOS packages never import, depend on, wrap or re-export GDC, directly or
transitively. Release gates follow the selected access path in
[MVP snapshot releases](MVP_SNAPSHOT_RELEASES.md): local Demo proof and exact
registry-backed builds permit online Demo deployment; online Test Network
validation follows separately and does not establish production readiness.

## Jurisdiction-scoped integration acceptance

Jurisdiction-specific integration journeys are optional and nonblocking unless
the change affects that exact flow. Unaffected Demo and general technology-
sector lifecycles must not wait for Spain's certificate-signed PDF or another
jurisdiction's documents, provider or private fixture. Their own authentication,
authority, privacy and custody checks remain required.

An affected jurisdiction regression is mandatory. A change to Spanish signed-
PDF admission, for example, requires its signing, upload and verification
proof. Select and record scope before the gate; keep unrelated prerequisites
out of scope. A selected failure remains a failure, never a skip, synthetic
success or green release claim. Count user journeys separately from viewport,
theme, flavour and access-mode execution variants.

This repository does not list,
name or maintain a matrix of consumers.

## Owned here

- Flat-claim data shapes and validation.
- Deterministic resource-graph builders and parsers.
- Cross-sector identifiers projected from Antifraud into SOS contracts,
  terminology candidate shapes and SOS-owned catalogs.
- Runtime-independent privacy-safe fixtures.
- Explicit import and projection boundaries for standard representations.

## Kept outside

- Product or sector branding.
- Application workflows and presentation.
- Authorization decisions and tenant policy.
- Network clients, persistence, transport and deployment configuration.
- Consumer repository topology, adoption state and release coordination.

New contracts enter this package only when they are reusable without importing
or naming a consumer. A sector-specific rule stays with the sector that owns
it. A runtime concern stays in a runtime layer. Standard vocabulary stays in
its canonical lower-level package.

Every exported contract must remain deterministic, independently testable and
free of secrets, live identities, deployment hosts and consumer-specific
assumptions.
