import { DEFAULT_HOUR_RANGE, type HourRange } from "./calendar-grid";
import { atTime, isSameDay, parseLocalDate } from "./calendar-utils";
import type { CalendarEvent } from "../../types/domain";

export type TimeWindow = { start: string; end: string };

/**
 * Combines a date ("YYYY-MM-DD") and time ("HH:mm") into a start/end ISO window.
 * Parses both as local-time components (not `new Date(dateStr)`, which parses as UTC)
 * so the resulting instant lines up with the local-time calendar grid.
 */
export function computeBookingWindow(dateStr: string, timeStr: string, durationHours: number): TimeWindow {
  const [hour, minute] = timeStr.split(":").map(Number);

  const start = atTime(parseLocalDate(dateStr), hour, minute);
  const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

  return { start: start.toISOString(), end: end.toISOString() };
}

export function findConflicts(
  candidate: TimeWindow,
  resourceId: string,
  calendarEvents: CalendarEvent[],
  excludeEventId?: string,
): CalendarEvent[] {
  const candidateStart = new Date(candidate.start).getTime();
  const candidateEnd = new Date(candidate.end).getTime();

  return calendarEvents.filter((event) => {
    if (event.resourceId !== resourceId) return false;
    if (excludeEventId && event.id === excludeEventId) return false;

    const eventStart = new Date(event.start).getTime();
    const eventEnd = new Date(event.end).getTime();
    return eventStart < candidateEnd && eventEnd > candidateStart;
  });
}

export function findAvailableSlots(
  day: Date,
  durationHours: number,
  resourceId: string,
  calendarEvents: CalendarEvent[],
  range: HourRange = DEFAULT_HOUR_RANGE,
  stepMinutes = 15,
  maxResults = 3,
): TimeWindow[] {
  const dayEvents = calendarEvents.filter((event) => event.resourceId === resourceId && isSameDay(new Date(event.start), day));

  const durationMs = durationHours * 60 * 60 * 1000;
  const stepMs = stepMinutes * 60 * 1000;

  const dayStart = atTime(day, range.startHour).getTime();
  const dayEnd = atTime(day, range.endHour).getTime();

  const results: TimeWindow[] = [];

  for (let candidateStart = dayStart; candidateStart + durationMs <= dayEnd; candidateStart += stepMs) {
    const candidateEnd = candidateStart + durationMs;
    const hasOverlap = dayEvents.some((event) => {
      const eventStart = new Date(event.start).getTime();
      const eventEnd = new Date(event.end).getTime();
      return eventStart < candidateEnd && eventEnd > candidateStart;
    });

    if (!hasOverlap) {
      results.push({ start: new Date(candidateStart).toISOString(), end: new Date(candidateEnd).toISOString() });
      if (results.length >= maxResults) break;
    }
  }

  return results;
}
