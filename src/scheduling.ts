// Copyright 2026 Connecting Solution & Applications Ltd under the Apache License, Version 2.0.
// Selectively migrated neutral contracts; source attribution is retained in NOTICE.
import {
  ScheduleR5SearchParameterCatalog,
  SlotR5SearchParameterCatalog,
  buildSchedulableLocationFlatResource,
  buildServiceScheduleFlatGraph,
} from 'fhir-data-utils-ts'
import {
  buildScheduleSlotIdentity,
  deriveFhirResourceIdFromUrn,
} from './organization-scoped-resource-identity.js'

/** FHIR R5 Slot statuses accepted by reusable scheduling. */
export const SlotStatuses = Object.freeze({ Busy: 'busy', Free: 'free', BusyUnavailable: 'busy-unavailable', BusyTentative: 'busy-tentative', EnteredInError: 'entered-in-error' } as const)

/** FHIR R5 AppointmentResponse participant statuses. */
export const AppointmentResponseStatuses = Object.freeze({ Accepted: 'accepted', Declined: 'declined', Tentative: 'tentative', NeedsAction: 'needs-action', EnteredInError: 'entered-in-error' } as const)

/** FHIR R5 Appointment statuses used by the import and booking flow. */
export const AppointmentStatuses = Object.freeze({
  Proposed: 'proposed', Pending: 'pending', Booked: 'booked', Arrived: 'arrived', Fulfilled: 'fulfilled',
  Cancelled: 'cancelled', NoShow: 'noshow', EnteredInError: 'entered-in-error', CheckedIn: 'checked-in', Waitlist: 'waitlist',
} as const)

/** Official FHIR R5 Slot resource-specific SearchParameter codes. */
export const SlotSearchParameters = Object.freeze(SlotR5SearchParameterCatalog.map(definition => definition.claim.slice('Slot.'.length)))

/** Official FHIR R5 SearchParameter codes used by reusable scheduling. */
export const SchedulingSearchParameterCatalog = Object.freeze({
  Location: Object.freeze(['characteristic', 'identifier', 'name', 'near', 'organization', 'status', 'type']),
  Schedule: Object.freeze(ScheduleR5SearchParameterCatalog.map(definition => definition.claim.slice('Schedule.'.length))),
  Slot: SlotSearchParameters,
  Appointment: Object.freeze(['actor', 'appointment-type', 'based-on', 'date', 'identifier', 'location', 'part-status', 'patient', 'practitioner', 'reason-code', 'reason-reference', 'service-category', 'service-type', 'slot', 'specialty', 'status', 'subject', 'supporting-info']),
  AppointmentResponse: Object.freeze(['_lastUpdated', 'actor', 'appointment', 'group', 'identifier', 'location', 'part-status', 'patient', 'practitioner']),
} as const)

/** Indexed scheduling claims: FHIR SearchParameters plus the governed generic user-selected extension. */
export const SchedulingFlatClaimCatalog = Object.freeze(Object.fromEntries(
  Object.entries(SchedulingSearchParameterCatalog).map(([resourceType, parameters]) => [
    resourceType,
    Object.freeze([
      ...parameters.map(parameter => `${resourceType}.${parameter}`),
      ...(resourceType === 'Schedule' ? ['Schedule.planning-horizon-start', 'Schedule.planning-horizon-end'] : []),
      ...(resourceType === 'Slot' ? ['Slot.end'] : []),
      ...(resourceType === 'Appointment' ? ['Appointment.user-selected'] : []),
    ]),
  ]),
) as Record<keyof typeof SchedulingSearchParameterCatalog, readonly string[]>)

export type SchedulingResourceType = keyof typeof SchedulingFlatClaimCatalog
export type SchedulingFlatClaimsResource = Readonly<Record<string, unknown> & { resourceType: SchedulingResourceType; id: string; meta: Readonly<Record<string, unknown> & { claims: Readonly<Record<string, readonly string[]>> }> }>

/** Rejects nested native FHIR and normalizes governed flat claims to strings. */
export function normalizeSchedulingFlatClaimsResource(input: unknown): SchedulingFlatClaimsResource {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('scheduling_flat_resource_invalid')
  const value = input as Record<string, unknown>
  if (typeof value.resourceType !== 'string' || !(value.resourceType in SchedulingFlatClaimCatalog)) throw new TypeError('scheduling_flat_resource_invalid')
  const resourceType = value.resourceType as SchedulingResourceType
  if (Object.keys(value).some(key => !['resourceType', 'id', 'meta'].includes(key))) throw new TypeError('scheduling_flat_resource_invalid')
  const id = required(String(value.id || ''), 'scheduling_flat_resource_invalid')
  if (!/^[A-Za-z0-9\-.]{1,64}$/.test(id)) throw new TypeError('scheduling_flat_resource_invalid')
  const meta = value.meta as Record<string, unknown> | undefined
  if (!meta || typeof meta !== 'object' || !meta.claims || typeof meta.claims !== 'object' || Array.isArray(meta.claims)) throw new TypeError('scheduling_flat_resource_invalid')
  const allowed = new Set<string>(SchedulingFlatClaimCatalog[resourceType])
  const claims: Record<string, readonly string[]> = {}
  for (const [name, raw] of Object.entries(meta.claims as Record<string, unknown>)) {
    if (!allowed.has(name)) throw new TypeError('scheduling_flat_claim_invalid')
    const values = (Array.isArray(raw) ? raw : [raw]).map(item => String(item).trim())
    if (!values.length || values.some(item => !item)) throw new TypeError('scheduling_flat_claim_invalid')
    claims[name] = Object.freeze([...new Set([...(claims[name] || []), ...values])])
  }
  return Object.freeze({ ...value, resourceType, id, meta: Object.freeze({ ...meta, claims: Object.freeze(claims) }) }) as SchedulingFlatClaimsResource
}

export type ClaimsFirstResource = Readonly<Record<string, unknown> & { resourceType: string; id: string; meta: Readonly<Record<string, unknown> & { claims: Readonly<Record<string, unknown>> }> }>

const required = (value: string, code: string): string => { const normalized = value.trim(); if (!normalized) throw new Error(code); return normalized }
const datePattern = /^\d{4}-\d{2}-\d{2}$/
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/
const assertDate = (value: string): string => { if (!datePattern.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) throw new Error('date_invalid'); return value }
const assertTime = (value: string): string => { if (!timePattern.test(value)) throw new Error('time_invalid'); return value }
const claimsResource = (resourceType: string, id: string, claims: Record<string, unknown>, native: Record<string, unknown> = {}, meta: Record<string, unknown> = {}): ClaimsFirstResource => Object.freeze({ resourceType, id: required(id, 'resource_id_required'), ...native, meta: Object.freeze({ ...meta, claims: Object.freeze(claims) }) })

/** Builds one physical FHIR R5 Location with SearchParameter claims. */
export function buildLocationResource(input: Readonly<{ id: string; organizationReference: string; name: string; description?: string; latitude: number; longitude: number; altitude?: number; characteristicCodes?: readonly string[]; photoUrl?: string }>): ClaimsFirstResource {
  if (!Number.isFinite(input.latitude) || input.latitude < -90 || input.latitude > 90) throw new Error('location_latitude_invalid')
  if (!Number.isFinite(input.longitude) || input.longitude < -180 || input.longitude > 180) throw new Error('location_longitude_invalid')
  if (input.photoUrl) { const parsed = new URL(input.photoUrl); if (parsed.protocol !== 'https:') throw new Error('location_photo_url_invalid') }
  const organizationReference = required(input.organizationReference, 'location_organization_required')
  const name = required(input.name, 'location_name_required')
  const characteristicCodes = Object.freeze([...(input.characteristicCodes || [])])
  return claimsResource('Location', input.id, {
    'Location.identifier': input.id,
    'Location.status': 'active',
    'Location.name': name,
    'Location.near': `${input.latitude}|${input.longitude}`,
    'Location.organization': organizationReference,
    ...(characteristicCodes.length ? { 'Location.characteristic': characteristicCodes } : {}),
  })
}

/** Builds one service-specific Schedule through the neutral FHIR claims graph. */
export function buildScheduleResource(input: Readonly<{
  scheduleUrn: string
  name: string
  healthcareServiceReference: string
  resourceActorReferences: readonly string[]
  serviceType: string
  planningHorizonStart: string
  planningHorizonEnd: string
}>): ClaimsFirstResource {
  const id = deriveFhirResourceIdFromUrn(input.scheduleUrn)
  const graph = buildServiceScheduleFlatGraph({
    scheduleId: id,
    scheduleIdentifier: input.scheduleUrn,
    name: input.name,
    healthcareServiceReference: input.healthcareServiceReference,
    resourceActorReferences: input.resourceActorReferences,
    serviceType: input.serviceType,
    planningHorizon: { start: input.planningHorizonStart, end: input.planningHorizonEnd },
    slots: [],
  })
  return graph[0] as ClaimsFirstResource
}

/** Builds one independently reservable child Location; equipment remains Device. */
export const buildSchedulableLocationResource = buildSchedulableLocationFlatResource

export type AvailabilityPeriod = Readonly<{ daysOfWeek: readonly number[]; startTime: string; endTime: string; locationReferences: readonly string[] }>
export type AvailabilityException = Readonly<{ effect: 'restrict' | 'expand'; recurrence: Readonly<{ frequency: 'weekly' | 'monthly'; dayOfWeek: number; ordinal?: number }>; startTime: string; endTime: string; locationReferences: readonly string[] }>
export type ExpandedSlot = Readonly<{ localDate: string; localStart: string; localEnd: string; locationReference: string; resource: ClaimsFirstResource }>

const minutes = (value: string): number => { const [hour, minute] = assertTime(value).split(':').map(Number); return hour * 60 + minute }
const timeFromMinutes = (value: number): string => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`
const dates = (start: string, end: string): string[] => { const result: string[] = []; const cursor = new Date(`${start}T00:00:00Z`); const last = new Date(`${end}T00:00:00Z`); while (cursor <= last) { result.push(cursor.toISOString().slice(0, 10)); cursor.setUTCDate(cursor.getUTCDate() + 1) }; return result }
const dateParts = (date: string): readonly number[] => date.split('-').map(Number)

const zonedInstant = (date: string, time: string, timeZone: string): string => {
  const [year, month, day] = dateParts(date); const [hour, minute] = time.split(':').map(Number)
  const desired = Date.UTC(year, month - 1, day, hour, minute); let candidate = desired
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
  for (let attempt = 0; attempt < 3; attempt += 1) { const parts = Object.fromEntries(formatter.formatToParts(new Date(candidate)).map(part => [part.type, part.value])); const observed = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute)); candidate += desired - observed }
  return new Date(candidate).toISOString()
}

const matchesExceptionDate = (date: string, recurrence: AvailabilityException['recurrence']): boolean => { const [, , day] = dateParts(date); const weekday = new Date(`${date}T00:00:00Z`).getUTCDay(); if (weekday !== recurrence.dayOfWeek) return false; return recurrence.frequency === 'weekly' || Math.ceil(day / 7) === recurrence.ordinal }
const validateRange = (startTime: string, endTime: string, code: string): readonly [number, number] => { const start = minutes(startTime); const end = minutes(endTime); if (start >= end) throw new Error(code); return [start, end] }
const slotKey = (location: string, date: string, start: string, end: string): string => `${location}|${date}|${start}|${end}`

/** Expands bounded weekly availability into claims-first Slots, applying recurring restrictions or expansions. */
export function expandAvailability(input: Readonly<{
  /** One service-owned Schedule URN for each independently reservable Location. */
  scheduleUrnsByLocation: Readonly<Record<string, string>>
  healthcareServiceReference: string
  serviceType: string
  resourceActorReferencesByLocation: Readonly<Record<string, readonly string[]>>
  startDate: string
  endDate: string
  timeZone: string
  slotMinutes: number
  periods: readonly AvailabilityPeriod[]
  exceptions: readonly AvailabilityException[]
}>): readonly ExpandedSlot[] {
  const startDate = assertDate(input.startDate); const endDate = assertDate(input.endDate)
  if (startDate > endDate) throw new Error('availability_horizon_invalid')
  if (!Number.isInteger(input.slotMinutes) || input.slotMinutes < 5 || input.slotMinutes > 1440) throw new Error('slot_duration_invalid')
  try { new Intl.DateTimeFormat('en', { timeZone: input.timeZone }).format() } catch { throw new Error('time_zone_invalid') }
  const base = new Map<string, Omit<ExpandedSlot, 'resource'>>(); const allDates = dates(startDate, endDate)
  for (const period of input.periods) {
    const [start, end] = validateRange(period.startTime, period.endTime, 'availability_period_invalid')
    if (!period.daysOfWeek.length || period.daysOfWeek.some(day => !Number.isInteger(day) || day < 0 || day > 6)) throw new Error('availability_days_invalid')
    if (!period.locationReferences.length) throw new Error('availability_location_required')
    for (const date of allDates) { if (!period.daysOfWeek.includes(new Date(`${date}T00:00:00Z`).getUTCDay())) continue; for (const locationReference of period.locationReferences) for (let cursor = start; cursor + input.slotMinutes <= end; cursor += input.slotMinutes) { const localStart = timeFromMinutes(cursor); const localEnd = timeFromMinutes(cursor + input.slotMinutes); base.set(slotKey(locationReference, date, localStart, localEnd), { localDate: date, localStart, localEnd, locationReference }) } }
  }
  for (const exception of input.exceptions) {
    const [start, end] = validateRange(exception.startTime, exception.endTime, 'availability_exception_invalid')
    if (exception.recurrence.dayOfWeek < 0 || exception.recurrence.dayOfWeek > 6 || (exception.recurrence.frequency === 'monthly' && (!Number.isInteger(exception.recurrence.ordinal) || exception.recurrence.ordinal! < 1 || exception.recurrence.ordinal! > 5))) throw new Error('availability_exception_recurrence_invalid')
    for (const date of allDates) { if (!matchesExceptionDate(date, exception.recurrence)) continue; for (const locationReference of exception.locationReferences) for (let cursor = start; cursor + input.slotMinutes <= end; cursor += input.slotMinutes) { const localStart = timeFromMinutes(cursor); const localEnd = timeFromMinutes(cursor + input.slotMinutes); const key = slotKey(locationReference, date, localStart, localEnd); if (exception.effect === 'restrict') base.delete(key); else base.set(key, { localDate: date, localStart, localEnd, locationReference }) } }
  }
  return Object.freeze([...base.values()].sort((left, right) => slotKey(left.locationReference, left.localDate, left.localStart, left.localEnd).localeCompare(slotKey(right.locationReference, right.localDate, right.localStart, right.localEnd))).map(slot => {
    const start = zonedInstant(slot.localDate, slot.localStart, input.timeZone); const end = zonedInstant(slot.localDate, slot.localEnd, input.timeZone)
    const scheduleUrn = required(input.scheduleUrnsByLocation[slot.locationReference] || '', 'availability_schedule_urn_required')
    const scheduleResourceId = deriveFhirResourceIdFromUrn(scheduleUrn)
    const slotIdentity = buildScheduleSlotIdentity({ scheduleUrn, start, end })
    const scheduleReference = `Schedule/${scheduleResourceId}`
    const actors = input.resourceActorReferencesByLocation[slot.locationReference]
    if (!actors?.includes(slot.locationReference)) throw new Error('availability_resource_actors_required')
    const graph = buildServiceScheduleFlatGraph({
      scheduleId: scheduleReference.slice('Schedule/'.length),
      scheduleIdentifier: scheduleReference,
      name: scheduleReference,
      healthcareServiceReference: input.healthcareServiceReference,
      resourceActorReferences: actors,
      serviceType: input.serviceType,
      planningHorizon: {
        start: zonedInstant(startDate, '00:00', input.timeZone),
        end: new Date(Date.parse(zonedInstant(endDate, '23:59', input.timeZone)) + 60_000).toISOString(),
      },
      slots: [{
        slotId: slotIdentity.id,
        slotIdentifier: slotIdentity.identifier,
        status: SlotStatuses.Free,
        start,
        end,
      }],
    })
    return Object.freeze({ ...slot, resource: graph[1] as ClaimsFirstResource })
  }))
}

/** Builds a claims-first response that confirms, declines or proposes a new appointment time. */
export function buildAppointmentResponseResource(input: Readonly<{ id: string; appointmentReference: string; actorReference: string; participantStatus: string; respondedAt?: string; proposedNewTime?: boolean; start?: string; end?: string; notificationRecipientReference?: string; notificationRecipientEmail?: string; notificationProfile?: Readonly<{ appointmentResponseTopic: string }> }>): ClaimsFirstResource {
  if (!Object.values(AppointmentResponseStatuses).includes(input.participantStatus as never)) throw new Error('appointment_response_status_invalid')
  if ((input.start && !input.end) || (!input.start && input.end)) throw new Error('appointment_response_time_incomplete')
  if (input.start && input.end && Date.parse(input.start) >= Date.parse(input.end)) throw new Error('appointment_response_time_invalid')
  const respondedAt = input.respondedAt || new Date().toISOString()
  if (!Number.isFinite(Date.parse(respondedAt))) throw new Error('appointment_response_responded_at_invalid')
  const hasRecipientReference = Boolean(input.notificationRecipientReference?.trim()); const hasRecipientEmail = Boolean(input.notificationRecipientEmail?.trim())
  if (hasRecipientReference !== hasRecipientEmail) throw new Error('appointment_response_notification_recipient_incomplete')
  if (hasRecipientReference && !input.notificationProfile?.appointmentResponseTopic?.trim()) throw new Error('appointment_response_notification_profile_required')
  if (hasRecipientEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.notificationRecipientEmail!.trim())) throw new Error('appointment_response_notification_email_invalid')
  const appointmentReference = required(input.appointmentReference, 'appointment_reference_required')
  const actorReference = required(input.actorReference, 'appointment_response_actor_required')
  const lastUpdated = new Date(respondedAt).toISOString()
  const contained = hasRecipientReference ? [buildAppointmentResponseNotificationResource({
    id: `${input.id}-clinic-email`, responseReference: `AppointmentResponse/${input.id}`, appointmentReference,
    senderReference: actorReference, recipientReference: input.notificationRecipientReference!.trim(),
    participantStatus: input.participantStatus, sentAt: lastUpdated, language: 'en', topic: input.notificationProfile?.appointmentResponseTopic || '',
  }), { resourceType: 'Endpoint', id: `${input.id}-clinic-email-endpoint`, status: 'active', connectionType: [{ coding: [{ code: 'email' }] }], address: `mailto:${input.notificationRecipientEmail!.trim().toLowerCase()}` }] : undefined
  return claimsResource('AppointmentResponse', input.id, {
    'AppointmentResponse.identifier': input.id,
    'AppointmentResponse.appointment': appointmentReference,
    'AppointmentResponse.actor': actorReference,
    'AppointmentResponse.part-status': input.participantStatus,
    'AppointmentResponse._lastUpdated': lastUpdated,
  }, {
    identifier: [{ value: input.id }], appointment: { reference: appointmentReference }, actor: { reference: actorReference },
    participantStatus: input.participantStatus,
    ...(input.proposedNewTime === undefined ? {} : { proposedNewTime: input.proposedNewTime }),
    ...(input.start ? { start: input.start, end: input.end } : {}),
    ...(contained ? { contained } : {}),
  }, { lastUpdated })
}

/** Builds the FHIR-like Communication that an adapter may render as the additional English clinic email. */
export function buildAppointmentResponseNotificationResource(input: Readonly<{ id: string; responseReference: string; appointmentReference: string; senderReference: string; recipientReference: string; participantStatus: string; sentAt: string; language: string; topic: string }>): ClaimsFirstResource {
  if (input.language !== 'en') throw new Error('appointment_response_notification_language_unsupported')
  if (!Object.values(AppointmentResponseStatuses).includes(input.participantStatus as never)) throw new Error('appointment_response_status_invalid')
  if (!Number.isFinite(Date.parse(input.sentAt))) throw new Error('appointment_response_notification_sent_at_invalid')
  const statusText: Readonly<Record<string, string>> = Object.freeze({ accepted: 'accepted', declined: 'declined', tentative: 'tentatively changed', 'needs-action': 'left awaiting action', 'entered-in-error': 'marked as entered in error' })
  return claimsResource('Communication', input.id, {
    'Communication.identifier': input.id,
    'Communication.status': 'completed',
    'Communication.category': 'http://terminology.hl7.org/CodeSystem/communication-category|notification',
    'Communication.recipient': required(input.recipientReference, 'appointment_response_notification_recipient_required'),
    'Communication.sender': required(input.senderReference, 'appointment_response_notification_sender_required'),
    'Communication.sent': new Date(input.sentAt).toISOString(),
    'Communication.topic': required(input.topic, 'appointment_response_notification_profile_required'),
    'Communication.content-reference': Object.freeze([required(input.responseReference, 'appointment_response_reference_required'), required(input.appointmentReference, 'appointment_reference_required')]),
    'Communication.text': `The appointment was ${statusText[input.participantStatus]}.`,
  })
}

/** Builds a FHIR R5 Appointment whose indexed claims are SearchParameters. */
export function buildAppointmentResource(input: Readonly<{ id: string; status: string; start: string; end: string; slotReferences: readonly string[]; actorReferences: readonly string[]; locationReference?: string; confirmationDueAt?: string; userSelected?: boolean; organizationReference?: string; notificationEmail?: string; clinicRecipientReference?: string; clinicRecipientEmail?: string }>): ClaimsFirstResource {
  if (!Object.values(AppointmentStatuses).includes(input.status as never)) throw new Error('appointment_status_invalid')
  const start = Date.parse(input.start); const end = Date.parse(input.end)
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) throw new Error('appointment_time_invalid')
  const userSelected = input.userSelected ?? false
  if (!input.slotReferences.length && !userSelected) throw new Error('appointment_slot_required')
  if (!input.actorReferences.length) throw new Error('appointment_actor_required')
  const confirmationDueAt = input.confirmationDueAt || new Date(start - 7 * 24 * 60 * 60 * 1000).toISOString()
  if (!Number.isFinite(Date.parse(confirmationDueAt)) || Date.parse(confirmationDueAt) >= start) throw new Error('appointment_confirmation_due_invalid')
  const organizationReference = input.organizationReference || input.clinicRecipientReference
  const notificationEmail = input.notificationEmail || input.clinicRecipientEmail
  const hasOrganization = Boolean(organizationReference?.trim()); const hasNotificationEmail = Boolean(notificationEmail?.trim())
  if (hasOrganization !== hasNotificationEmail) throw new Error('appointment_notification_recipient_incomplete')
  if (hasNotificationEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(notificationEmail!.trim())) throw new Error('appointment_notification_email_invalid')
  const startInstant = new Date(start).toISOString(); const endInstant = new Date(end).toISOString()
  const organization = hasOrganization ? organizationReference!.trim() : undefined
  const emailEndpoint = hasNotificationEmail ? {
    resourceType: 'Endpoint', id: 'clinic-notification-email', status: 'active',
    connectionType: [{ coding: [{ code: 'email' }] }],
    address: `mailto:${notificationEmail!.trim().toLowerCase()}`,
  } : undefined
  return claimsResource('Appointment', input.id, {
    'Appointment.identifier': input.id, 'Appointment.status': input.status, 'Appointment.date': startInstant,
    ...(input.slotReferences.length ? { 'Appointment.slot': Object.freeze([...input.slotReferences]) } : {}),
    'Appointment.actor': Object.freeze([...input.actorReferences]),
    'Appointment.user-selected': userSelected,
    ...(organization ? { 'Appointment.supporting-info': organization } : {}),
    ...(input.locationReference ? { 'Appointment.location': required(input.locationReference, 'appointment_location_required') } : {}),
  }, {
    identifier: [{ value: input.id }], status: input.status, start: startInstant, end: endInstant,
    ...(input.slotReferences.length ? { slot: input.slotReferences.map(reference => ({ reference })) } : {}),
    participant: input.actorReferences.map(reference => ({ actor: { reference }, status: 'needs-action' })),
    ...(organization ? { supportingInformation: [{ reference: organization }, { reference: '#clinic-notification-email' }] } : {}),
    ...(emailEndpoint ? { contained: [emailEndpoint] } : {}),
  })
}
