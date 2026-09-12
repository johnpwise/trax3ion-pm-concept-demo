export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

export function getStartOfWeek(date: Date): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = result.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diffToMonday);
  return result;
}

export function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export function addWeeks(date: Date, amount: number): Date {
  return addDays(date, amount * 7);
}

export function atTime(date: Date, hour: number, minute = 0): Date {
  const result = new Date(date);
  result.setHours(hour, minute, 0, 0);
  return result;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function formatDayHeader(date: Date): string {
  const weekday = WEEKDAYS[(date.getDay() + 6) % 7];
  return `${weekday} ${date.getDate()}`;
}

export function formatWeekRangeLabel(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 4);
  const startMonth = MONTH_LABELS[weekStart.getMonth()];
  const endMonth = MONTH_LABELS[weekEnd.getMonth()];

  if (weekStart.getMonth() === weekEnd.getMonth() && weekStart.getFullYear() === weekEnd.getFullYear()) {
    return `${weekStart.getDate()}–${weekEnd.getDate()} ${startMonth} ${weekEnd.getFullYear()}`;
  }

  return `${weekStart.getDate()} ${startMonth} – ${weekEnd.getDate()} ${endMonth} ${weekEnd.getFullYear()}`;
}

export function formatEventTime(startIso: string, endIso: string): string {
  const format = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return `${format(startIso)}–${format(endIso)}`;
}

export function formatEventDate(iso: string): string {
  const d = new Date(iso);
  return `${WEEKDAYS[(d.getDay() + 6) % 7]} ${d.getDate()} ${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`;
}

export function getEventDurationHours(startIso: string, endIso: string): number {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  return Math.max(0, (end - start) / (1000 * 60 * 60));
}
