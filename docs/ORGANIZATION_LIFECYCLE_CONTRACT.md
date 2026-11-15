# Organization administration readback

The `organization-lifecycle-contract` public leaf owns the three existing SOS
host-registry tenant authorization claim keys. It introduces no route or
authorization policy. See the [owning gateway claim contract](https://github.com/soschain/sos-gw-node-ts/blob/main/src/shared/gateway-claim-contract.ts)
and [host lifecycle service](https://github.com/soschain/sos-gw-node-ts/blob/main/src/managers/hosting/HostingLifecycleService.ts).

`OrganizationLifecycleSnapshot` describes the actual status, four descendant
counts and two server-authored availability flags. A confirmed purge instead
returns an `OrganizationPurgeReceipt`: the registry record no longer exists, so
the receipt does not fabricate a fresh zero-count snapshot. Its operation
reference identifies the acknowledged operation and is not itself ledger proof.

The employee inventory's optional `occupationResourceId` is the actual correlated
Occupation document ID. It is never derived from a DID or occupation code and
does not assert that a native FHIR PractitionerRole already exists.
