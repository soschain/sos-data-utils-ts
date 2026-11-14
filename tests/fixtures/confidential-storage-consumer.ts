// Flow contract: index metadata, encrypted blob pointers and decrypted in-memory content remain distinct public data contracts.
import type { ConfidentialStorageDoc, UnprotectedStorageDoc, VaultConfig } from 'sos-data-utils-ts/confidential-storage'
import { REPOSITORY_SAFE_EXAMPLES as SAFE } from 'sos-data-utils-ts/repository-privacy'
const config: VaultConfig = { id: SAFE.tenantId, custodian: SAFE.didWeb }
const encrypted: ConfidentialStorageDoc = {
  id: SAFE.resourceUuid, status: 'active', sequence: 1,
  blob: { blobRef: SAFE.resourceUuid, provider: 'mem', contentType: 'application/jose+json' },
  indexed: { attributes: [{ name: 'protected-name', value: 'protected-value', unique: true, type: 'token' }] },
  audit: { creatorDid: SAFE.didWeb, sourceRecordId: SAFE.resourceUuid },
  tag: [{ system: 'urn:iso:std:iso:3166', code: SAFE.countryIso2 }],
}
const decrypted: UnprotectedStorageDoc<{ claims: { code: string } }> = {
  ...encrypted, content: { claims: { code: '2261' } },
}
// @ts-expect-error decrypted content must exist in the in-memory projection
const absent: UnprotectedStorageDoc<{ claims: object }> = { id: SAFE.resourceUuid, status: 'active', sequence: 1 }
// @ts-expect-error a blob locator must carry its actual blob reference
const invalidBlob: ConfidentialStorageDoc = { id: SAFE.resourceUuid, status: 'active', sequence: 1, blob: { provider: 'mem' } }
// @ts-expect-error decrypted content retains its specific claims type
const wrongClaims: typeof decrypted.content = { claims: { code: 2261 } }
void [config, encrypted, decrypted, absent, invalidBlob, wrongClaims]
