# Shared data-package boundary

`sos-data-utils-ts` is a product-neutral data-contract package. Its public
surface is limited to deterministic types, schemas, builders, parsers,
validators, governed catalogs and repository-safe fixtures.

Runtime and application layers import `sos-data-utils-ts`. This package imports
the canonical FHIR utilities and Antifraud's neutral identity, security,
occupation and encoding contracts. Those lower-level packages do not import
this package. FHIR utilities
remain independent of Antifraud's occupation catalog.

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
