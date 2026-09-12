import type { CalendarEvent } from "../../types/domain";

export function getProvisionalBookingsForProject(calendarEvents: CalendarEvent[], projectId: string): CalendarEvent[] {
  return calendarEvents.filter((event) => event.source === "trax3ion" && event.status === "provisional" && event.projectId === projectId);
}

export function getBookingForAction(actionId: string, calendarEvents: CalendarEvent[]): CalendarEvent | undefined {
  return calendarEvents.find((event) => event.source === "trax3ion" && event.actionId === actionId);
}
