---
name: preserve-demo-test-network-adapter-parity
description: Preserve one use-case and Confidential Storage architecture across Demo, Test Network, production web, offline browser and Expo applications.
---

# Preserve Demo and Test Network adapter parity

Demo and Test Network execute the same application use cases, BFF contracts and
high-level SDK operations. Network cases use the same GW managers across their
adapters; BFF-only Demo performs no GW business read/write or tenant bootstrap.
Demo changes only synthetic seeding,
authority evidence and the adapter selected at the composition root. It never
owns routes, stores, DTOs, editors, viewers or navigation that compete with the
Test Network path.

Use the canonical `IVaultRepository`/Confidential Storage port everywhere:

- `memory` for `all-local`, including GW and portal BFF state;
- `expo-sqlite` for Expo Android/iOS;
- `indexeddb` for explicitly offline browser custody;
- `firestore` or `postgresql` only for configured durable deployments.

Keep execution profiles distinct: the CH all-local portal profile does not
start or require Chat, the telephone assistant or the optional web assistant.
Audio/video uses a dedicated RTC provider. Persist only invitations, terminal
call events and optional unanswered audio through Communication.

Never import Firestore, PostgreSQL, SQLite or IndexedDB from a Demo use case or
route. Only a composition root may instantiate an adapter. IPFS/blob storage is
optional externalization behind a durable adapter and never selects business
behavior.

Changes to this boundary require a negative architecture test that rejects
direct adapter imports below the composition root. Demo proves the real local
UI -> BFF -> SDK -> vault journey without GW business reads/writes. Network
cases additionally prove UI -> BFF -> SDK -> GW with `networkKind=test` and
memory storage. Expo injects SQLite into the same use cases.

Demo promotion is local relevant Demo checks -> exact registry dependencies
and lockfiles -> portal build -> online Demo deployment. Online dev:staging /
Test Network lifecycle checks follow deployment; fixes repeat affected local
checks and redeploy. Do not hold Demo for those later checks or claim Test
Network/production readiness from Demo. Keep auth, privacy and custody intact.
