# AGENTS.md - sos-data-utils-ts

## Demo/Test Network adapter parity

Apply
[`preserve-demo-test-network-adapter-parity`](.codex/skills/preserve-demo-test-network-adapter-parity/SKILL.md)
to every Demo, portal, channel, persistence or Expo change. Demo and Test
Network execute the same use cases through `IVaultRepository`. Demo must not
own a separate datastore or import database drivers directly. Configured
durable composition roots may inject Firestore or PostgreSQL through that same
Confidential Storage port; all-local uses memory and Expo uses SQLite.
The CH all-local portal gate must not start or require Chat, a telephone
assistant or a web assistant. RTC is a separate provider boundary; only its
invitation, terminal state and unanswered audio attachment enter Communication.

## Repository privacy is a release blocker

- Use `.codex/skills/protect-repository-privacy/SKILL.md` before editing tests,
  docs, examples, manifests, env templates, skills or release material.
- Import governed synthetic values from `sos-data-utils-ts/repository-privacy`.
  Do not repeat telephone, tenant, domain, DID or path literals in consumers.
- `$HOME` is portable; a username, absolute workstation path or assumed
  directory layout below it is not.
- Keep real domains, phone numbers, tenant/company identifiers and deployment
  routing only in ignored local files or external secret/configuration stores.
- Run privacy validation before every commit, merge, publish and push. A
  private repository is not an exception.

## Coordinated releases

Accumulate every grouped functional change and changelog entry without changing
the package version. Merge them all into `main`, run the cumulative local gate,
and only then create one version-only release branch. Preserve each released
version at its exact published SHA as immutable `stable/v<version>` so rollback
never depends on reconstructing history. Never increment once per feature.

Follow `docs/MVP_SNAPSHOT_RELEASES.md`. Merge and push validated shared sources
to `main`, then use immutable `npm pack` artifacts with temporary `--no-save`
installs to prove the affected local journey for its selected access path
without skips. Demo proves the BFF/SDK/vault boundary; network cases include GW.
Merge and push validated consumer sources to `main`,
publish exact commits to the public registry, pin exact registry versions, and
only then promote to staging.

Select gates by access path. Demo needs relevant local Demo checks, exact
published dependencies/lockfiles and portal build before online Demo deployment.
Run dev:staging/Test Network lifecycle checks afterward and redeploy fixes;
they do not hold Demo or establish production readiness. Demo is BFF-only and
does not require a GW business journey. Network-backed cases retain their GW
and Fabric gates. Package tests, no-GDC architecture and privacy remain required.
