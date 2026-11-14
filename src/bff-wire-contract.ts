import { DIDCOMM_PLAINTEXT_JSON_MEDIA_TYPE } from 'antifraud-data-utils-ts/didcomm-contracts'

/** Shared operational route formats; native FHIR remains an explicit projection. */
export const Format=Object.freeze({SCHEMA:'org.schema',FHIR_API:'org.hl7.fhir.api',FHIR_R4:'org.hl7.fhir.r4'} as const)
/** Registered HTTP values used by SOS operational adapters, not resource authorization policy. */
export const HttpStatusCodes=Object.freeze({
  Ok:200,Created:201,Accepted:202,NoContent:204,
  BadRequest:400,Unauthorized:401,Forbidden:403,NotFound:404,Conflict:409,Gone:410,
  InternalServerError:500,ServiceUnavailable:503,
} as const)
export const HttpRequestMethods=Object.freeze({Get:'GET',Post:'POST',Put:'PUT',Patch:'PATCH',Delete:'DELETE'} as const)
export const HttpHeaderNames=Object.freeze({Authorization:'authorization',ContentType:'content-type'} as const)
export const HttpAuthorizationSchemes=Object.freeze({Bearer:'Bearer'} as const)
export const HttpMediaTypes=Object.freeze({
  FhirJson:'application/fhir+json',ApiJson:'application/api+json',ApiJsonShort:'api+json',
  BundleApiJson:'application/bundle-api+json',DidcommEncryptedJson:'application/didcomm-encrypted+json',
  DidcommPlainJson:DIDCOMM_PLAINTEXT_JSON_MEDIA_TYPE,DidcommSignedJson:'application/didcomm-signed+json',
  Json:'application/json',JsonApi:'application/vnd.api+json',
} as const)

/** SOS submission response preference; the protocol media-type identity is neutral Antifraud data. */
export const DIDCOMM_DEFAULT_ACCEPT_HEADER = `${HttpMediaTypes.Json}, ${DIDCOMM_PLAINTEXT_JSON_MEDIA_TYPE}, */*` as const
