import { isSameDay } from "./calendar-utils";

export type HourRange = { startHour: number; endHour: number };

export const DEFAULT_HOUR_RANGE: HourRange = { startHour: 7, endHour: 19 };
export const PX_PER_HOUR = 48;
export const MIN_EVENT_HEIGHT_PX = 24;
export const TIME_GUTTER_WIDTH_PX = 56;
export const MAX_PANE_BODY_HEIGHT_PX = (DEFAULT_HOUR_RANGE.endHour - DEFAULT_HOUR_RANGE.startHour) * PX_PER_HOUR;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getVisibleHourRange(
  events: Array<{ start: string; end: string }>,
  defaultRange: HourRange = DEFAULT_HOUR_RANGE,
): HourRange {
  let startHour = defaultRange.startHour;
  let endHour = defaultRange.endHour;

  for (const event of events) {
    const start = new Date(event.start);
    const end = new Date(event.end);
    startHour = Math.min(startHour, Math.floor(start.getHours() + start.getMinutes() / 60));
    endHour = Math.max(endHour, Math.ceil(end.getHours() + end.getMinutes() / 60));
  }

  startHour = Math.max(0, startHour);
  endHour = Math.min(24, endHour);
  return endHour <= startHour ? { startHour, endHour: startHour + 1 } : { startHour, endHour };
}

export function computeEventVerticalLayout(
  event: { start: string; end: string },
  range: HourRange,
  pxPerHour: number = PX_PER_HOUR,
  minHeightPx: number = MIN_EVENT_HEIGHT_PX,
): { topPx: number; heightPx: number } {
  const start = new Date(event.start);
  const end = new Date(event.end);

  const gridStartMinutes = range.startHour * 60;
  const gridEndMinutes = range.endHour * 60;

  const startMinutesOfDay = start.getHours() * 60 + start.getMinutes();
  const endMinutesOfDay = isSameDay(start, end) ? end.getHours() * 60 + end.getMinutes() : gridEndMinutes;

  const clampedStart = clamp(startMinutesOfDay, gridStartMinutes, gridEndMinutes);
  const clampedEnd = clamp(Math.max(endMinutesOfDay, startMinutesOfDay), gridStartMinutes, gridEndMinutes);

  const topPx = ((clampedStart - gridStartMinutes) / 60) * pxPerHour;
  const heightPx = Math.max(((clampedEnd - clampedStart) / 60) * pxPerHour, minHeightPx);

  return { topPx, heightPx };
}

export type PackedEvent<T> = { event: T; columnIndex: number; columnCount: number };

export function packOverlappingEvents<T extends { start: string; end: string }>(events: T[]): PackedEvent<T>[] {
  const withIndex = events.map((event, index) => ({
    event,
    index,
    startMs: new Date(event.start).getTime(),
    endMs: new Date(event.end).getTime(),
  }));

  const sorted = [...withIndex].sort((a, b) => a.startMs - b.startMs || a.endMs - b.endMs || a.index - b.index);

  const columnIndexByIndex = new Map<number, number>();
  const columnCountByIndex = new Map<number, number>();

  let clusterIndices: number[] = [];
  let columnEndTimes: number[] = [];
  let clusterEndMax = -Infinity;

  const flushCluster = () => {
    const columnCount = Math.max(columnEndTimes.length, 1);
    clusterIndices.forEach((i) => columnCountByIndex.set(i, columnCount));
    clusterIndices = [];
    columnEndTimes = [];
  };

  for (const item of sorted) {
    const effectiveEndMs = Math.max(item.endMs, item.startMs + 1);

    if (clusterIndices.length > 0 && item.startMs >= clusterEndMax) {
      flushCluster();
      clusterEndMax = -Infinity;
    }

    let columnIndex = columnEndTimes.findIndex((endMs) => endMs <= item.startMs);
    if (columnIndex === -1) {
      columnIndex = columnEndTimes.length;
      columnEndTimes.push(effectiveEndMs);
    } else {
      columnEndTimes[columnIndex] = effectiveEndMs;
    }

    columnIndexByIndex.set(item.index, columnIndex);
    clusterIndices.push(item.index);
    clusterEndMax = Math.max(clusterEndMax, effectiveEndMs);
  }
  flushCluster();

  return events.map((event, index) => ({
    event,
    columnIndex: columnIndexByIndex.get(index)!,
    columnCount: columnCountByIndex.get(index)!,
  }));
}

export function getHourMarks(range: HourRange): number[] {
  const marks: number[] = [];
  for (let hour = range.startHour; hour <= range.endHour; hour += 1) {
    marks.push(hour);
  }
  return marks;
}

export function formatHourLabel(hour: number): string {
  return `${String(hour % 24).padStart(2, "0")}:00`;
}
