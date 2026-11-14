/** Persisted discriminator retained for existing ciphertext compatibility, independent of runtime ownership. */
export const PROFILE_SECRET_ENVELOPE_VERSION='gdc-pin-host-envelope-v1' as const

/** Public metadata for the PIN-derived wrapping key; validation and derivation belong to the runtime. */
export type ProfileScryptParameters=Readonly<{
 name:'scrypt'
 saltBase64Url:string
 cost:number
 blockSize:number
 parallelization:number
 keyLength:32
}>
export type AesGcmCiphertext=Readonly<{
 ivBase64Url:string
 ciphertextBase64Url:string
 tagBase64Url:string
}>
/** Encrypted secret and doubly wrapped data key. Contains no authenticated actor or authorization grant. */
export type PinProtectedProfileSecret=Readonly<{
 version:typeof PROFILE_SECRET_ENVELOPE_VERSION
 kdf:ProfileScryptParameters
 payload:AesGcmCiphertext
 pinWrappedHostDek:AesGcmCiphertext
}>
