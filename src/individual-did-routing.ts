/** Existing SOS DID routing markers. A parsed route is not identity or role authority. */
const individualMarker = ':individual:'
const memberMarker = ':member:'
const bareBase58Multibase = /^z[1-9A-HJ-NP-Za-km-z]+$/u

/** Resolve the existing provider prefix without treating its hostname as authority. */
export function getOrganizationDidFromIndividualDid(did: string): string {
  for (const marker of [individualMarker, ':employee:', memberMarker]) {
    const offset = did.indexOf(marker)
    if (offset > -1) return did.slice(0, offset)
  }
  return did
}
export const getProviderDidFromSubjectDid = getOrganizationDidFromIndividualDid

/** Parse the canonical hosted member suffix; callers independently verify its registration and authority. */
export function parseIndividualMemberDidWeb(didWeb: string): { individualDidWeb: string; memberId: string; roleValue: string } {
  const candidate = String(didWeb || '').trim()
  const offset = candidate.lastIndexOf(memberMarker)
  if (!candidate.startsWith('did:web:') || offset < 0) throw new Error('Invalid hosted individual member DID.')
  const individualDidWeb = candidate.slice(0, offset)
  const [memberId, roleValue, ...unexpected] = candidate.slice(offset + memberMarker.length).split(':')
  if (!individualDidWeb.includes(individualMarker) || unexpected.length > 0
    || !bareBase58Multibase.test(String(memberId || '')) || !String(roleValue || '').trim()) {
    throw new Error('Invalid hosted individual member DID.')
  }
  return { individualDidWeb, memberId, roleValue }
}
