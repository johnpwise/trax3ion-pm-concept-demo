export interface ToolCalendarEvent {
  resourceId: string;
  start: string; // "YYYY-MM-DDTHH:mm:ss" local wall-clock, no timezone suffix
  [key: string]: unknown;
}

export function getEventsForDate(
  calendarEvents: ToolCalendarEvent[],
  date: string,
  resourceId?: string,
): ToolCalendarEvent[] {
  return calendarEvents.filter(
    (event) => event.start.slice(0, 10) === date && (!resourceId || event.resourceId === resourceId),
  );
}
