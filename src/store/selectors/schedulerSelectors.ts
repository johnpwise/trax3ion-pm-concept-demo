import type { CalendarEvent } from "../../types/domain";

export function getProvisionalBookings(calendarEvents: CalendarEvent[]): CalendarEvent[] {
  return calendarEvents.filter((event) => event.source === "trax3ion" && event.status === "provisional");
}

export function getBookingForAction(actionId: string, calendarEvents: CalendarEvent[]): CalendarEvent | undefined {
  return calendarEvents.find((event) => event.source === "trax3ion" && event.actionId === actionId);
}
