import {PROFILE_SECRET_ENVELOPE_VERSION,type PinProtectedProfileSecret,type ProfileScryptParameters,type AesGcmCiphertext} from 'sos-data-utils-ts/server-profile-secret-contract'
declare const ciphertext:AesGcmCiphertext
declare const kdf:ProfileScryptParameters
const envelope:PinProtectedProfileSecret={version:PROFILE_SECRET_ENVELOPE_VERSION,kdf,payload:ciphertext,pinWrappedHostDek:ciphertext}
const algorithm:'scrypt'=envelope.kdf.name
const keyLength:32=envelope.kdf.keyLength
// @ts-expect-error persisted algorithm cannot silently change
const wrongAlgorithm:ProfileScryptParameters={...kdf,name:'pbkdf2'}
// @ts-expect-error persisted key size is fixed
const wrongSize:ProfileScryptParameters={...kdf,keyLength:16}
// @ts-expect-error a protected secret is not an authenticated actor or grant
envelope.actorDid
void [algorithm,keyLength,wrongAlgorithm,wrongSize]
