import type { CalendarEvent, Resource } from "../../../types/domain";
import { addDays, formatDayHeader, isSameDay } from "../calendar-utils";
import CalendarEventBlock from "./CalendarEventBlock";

type ResourceWeekGridProps = {
  resources: Resource[];
  calendarEvents: CalendarEvent[];
  weekStart: Date;
  onEventClick: (event: CalendarEvent) => void;
};

export default function ResourceWeekGrid({ resources, calendarEvents, weekStart, onEventClick }: ResourceWeekGridProps) {
  const days = Array.from({ length: 5 }, (_, index) => addDays(weekStart, index));

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
      <div className="min-w-[760px]">
        <div className="grid grid-cols-[160px_repeat(5,1fr)] border-b border-border bg-muted/30">
          <div className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Resource</div>
          {days.map((day) => (
            <div key={day.toISOString()} className="border-l border-border px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {formatDayHeader(day)}
            </div>
          ))}
        </div>

        {resources.map((resource) => {
          const resourceEvents = calendarEvents
            .filter((event) => event.resourceId === resource.id)
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

          return (
            <div key={resource.id} className="grid grid-cols-[160px_repeat(5,1fr)] border-b border-border last:border-b-0">
              <div className="px-4 py-3">
                <p className="truncate text-sm font-medium text-surface-foreground">
                  {resource.name}
                  {resource.isCurrentUser ? <span className="text-muted-foreground"> (you)</span> : null}
                </p>
                <p className="truncate text-xs text-muted-foreground">{resource.role}</p>
              </div>

              {days.map((day) => {
                const dayEvents = resourceEvents.filter((event) => isSameDay(new Date(event.start), day));

                return (
                  <div key={day.toISOString()} className="min-h-[64px] space-y-1 border-l border-border p-1.5">
                    {dayEvents.length === 0 ? (
                      <p className="px-1 pt-2.5 text-center text-[11px] text-muted-foreground/70">Free</p>
                    ) : (
                      dayEvents.map((event) => <CalendarEventBlock key={event.id} event={event} onClick={() => onEventClick(event)} />)
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
