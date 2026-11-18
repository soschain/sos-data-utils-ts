/** Transport formatting values; these grant no identity or access authority. */
export function safelyJoinUrl(base:string,path:string):string{ return `${base.endsWith('/')?base.slice(0,-1):base}/${path.startsWith('/')?path.slice(1):path}`; }
export const knownDomainsReversed=Object.freeze(['org.schema','org.hl7.fhir.api','org.hl7.fhir.r4','org.ilo.isco','net.openid']);
export const HttpStatusText=Object.freeze({Ok:'200 OK',Created:'201 Created',Accepted:'202 Accepted',NoContent:'204 No Content'} as const);

/** Fully qualified namespaces retained by canonical claim normalization. */
export const KnownClaimNamespaces=Object.freeze(Object.fromEntries(knownDomainsReversed.map(value=>[value,value])) as {[Key in typeof knownDomainsReversed[number]]:Key});
