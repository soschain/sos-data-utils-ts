// Copyright 2026 Antifraud Services Inc. under Apache-2.0.
// Selective ledger identity contract reviewed at source revision 74479fa3fc8d8cbf92a9ff13dd626ccf8d6f2b1e.
import {encodeMultibaseSha3} from 'antifraud-data-utils-ts/encoding'
/** The caller owns alias normalization and authority. This preserves the exact public ledger lookup envelope. */
export function buildPublicAliasLedgerAssetId(alias:string):string{
 const normalized=String(alias||'').trim().normalize('NFKC')
 if(!normalized)throw new Error('Public alias is required')
 if(normalized.startsWith('urn:multibase:'))return normalized
 return `urn:multibase:${encodeMultibaseSha3(normalized)}`
}
