import type { Action, CalendarEvent } from "../../types/domain";
import { findConflicts } from "../../views/scheduler/availability";

export function getProvisionalBookingsForProject(calendarEvents: CalendarEvent[], projectId: string): CalendarEvent[] {
  return calendarEvents.filter((event) => event.source === "trax3ion" && event.status === "provisional" && event.projectId === projectId);
}

export function getBookingForAction(actionId: string, calendarEvents: CalendarEvent[]): CalendarEvent | undefined {
  return calendarEvents.find((event) => event.source === "trax3ion" && event.actionId === actionId);
}

export function getActionConflicts(action: Action, calendarEvents: CalendarEvent[]): CalendarEvent[] {
  if (!action.resourceId) return [];

  const booking = getBookingForAction(action.id, calendarEvents);
  if (!booking) return [];

  return findConflicts({ start: booking.start, end: booking.end }, action.resourceId, calendarEvents, booking.id);
}
