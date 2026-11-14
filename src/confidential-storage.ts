import type { FhirCoding } from 'fhir-data-utils-ts'
import type { RecordBase } from 'antifraud-data-utils-ts/vault-repository'
export type { RecordBase } from 'antifraud-data-utils-ts/vault-repository'

export const CONFIDENTIAL_JWE_BLOB_CONTENT_TYPE = 'application/jose+json' as const

/** Dynamic flat claims are interpreted by the owning resource validator. */
export type ClaimsRecord = Record<string, any>
export interface VaultConfig extends RecordBase { custodian?: string }
export type MetaTagCoding = FhirCoding

/** Coded, deliberately coarse analytics metadata; exposure remains deployment policy. */
export interface ResearchInfo {
  jurisdiction?: string
  yearOfBirth?: string
  gender?: string
  sexAtBirth?: string
}
/** Provenance metadata is separate from both protected claims and content versions. */
export interface AuditInfo {
  created?: string
  updated?: string
  deactivated?: boolean
  disposition?: string
  channel?: string
  txId?: string
  txTime?: string
  creatorDid?: string
  submitterDid?: string
  signingKeyId?: string
  authorOwnerIdentifier?: string
  documentDate?: string
  sourceRecordId?: string
}
/** Optional non-authoritative routing projection outside encrypted content. */
export interface PublicInfo { role?: string }
export interface IndexedAttribute { name: string; value: string; unique?: boolean; type?: string }
export interface IndexedData {
  attributes: IndexedAttribute[]
  hmac?: { id: string; type: string }
  sequence?: number
}
/** The reference is authoritative for retrieval; a diagnostic locator never substitutes for it. */
export interface ConfidentialBlobInfo {
  blobRef: string
  provider?: string
  locator?: string
  contentType?: string
}
/** SOS record shape shared by memory and durable adapters; this type selects no backend. */
export interface ConfidentialStorageDoc extends RecordBase {
  status: string
  sequence: number
  versionId?: string
  vaultId?: string
  chunks?: number
  indexed?: IndexedData
  content?: ClaimsRecord
  jwe?: ClaimsRecord
  blob?: ConfidentialBlobInfo
  audit?: AuditInfo
  /** @deprecated Use audit.created. */
  created?: string
  contentType?: string
  tag?: MetaTagCoding[]
  research?: ResearchInfo
  public?: PublicInfo
}
/** In-memory projection only. Persistence and encryption belong to the SDK adapter. */
export type UnprotectedStorageDoc<T> = Omit<ConfidentialStorageDoc, 'jwe' | 'content'> & { content: T }
