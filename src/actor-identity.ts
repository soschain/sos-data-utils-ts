// Selective hosted identity contract reviewed from source revision 74479fa3fc8d8cbf92a9ff13dd626ccf8d6f2b1e.
// Copyright 2025-2026 Antifraud Services Inc. under Apache-2.0. Parsing and hashing never grant authority.
import {getOrganizationDidFromIndividualDid} from './individual-did-routing.js'


export type ParsedActor = {

  sub: string;

  identifier?: string;

  role?: string;

  memberKind?: 'organization' | 'individual';

  organization?: string;
};

export function parseActorFromSub(sub: string): ParsedActor {
  const trimmed = (sub || '').trim();
  const parsed: ParsedActor = { sub: trimmed };
  if (!trimmed) return parsed;

  if (trimmed.startsWith('did:web:')) {


    const after = trimmed.replace(/^did:web:/, '');
    const host = after.split(':')[0];
    if (host) parsed.organization = trimmed.includes(':employee:')
      ? getOrganizationDidFromIndividualDid(trimmed)
      : `did:web:${host}`;





    const parts = after.split(':');
    const roleIdx = parts.findIndex((part) => {
      try {
        return decodeURIComponent(part).includes('|');
      } catch {
        return part.includes('|');
      }
    });
    const hasRoleLabel = roleIdx > 0 && parts[roleIdx - 1].toLowerCase() === 'role';
    const idIdx = roleIdx > 0 ? roleIdx - (hasRoleLabel ? 2 : 1) : -1;
    const identifier = idIdx >= 0 ? parts[idIdx] : undefined;
    if (identifier) {
      parsed.identifier = identifier.includes('@') ? identifier.toLowerCase() : identifier;
    }

    if (roleIdx >= 0) {
      const encodedRole = parts[roleIdx];
      try {
        parsed.role = decodeURIComponent(encodedRole);
      } catch {
        parsed.role = encodedRole;
      }
      const normalizedRole = String(parsed.role || '').trim().toLowerCase();
      const pathLabels = parts.slice(1, Math.max(1, idIdx)).map((part) => part.toLowerCase());
      parsed.memberKind = normalizedRole.startsWith('v3-rolecode|')
        || pathLabels.some((part) => part === 'family' || part === 'related-person' || part === 'individual-member')
        ? 'individual'
        : 'organization';
    }
    return parsed;
  }

  if (trimmed.includes('@') && !/\s/.test(trimmed)) {
    parsed.identifier = trimmed.toLowerCase();
  }
  return parsed;
}
