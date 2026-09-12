import { MAX_PANE_BODY_HEIGHT_PX, PX_PER_HOUR, type HourRange } from "../calendar-grid";
import { formatDayHeader, isSameDay } from "../calendar-utils";
import type { CalendarEvent, Resource } from "../../../types/domain";
import CalendarDayColumn from "./CalendarDayColumn";
import CalendarHourGutter from "./CalendarHourGutter";

type ResourceCalendarPaneProps = {
  resource: Resource;
  days: Date[];
  events: CalendarEvent[];
  range: HourRange;
  onEventClick: (event: CalendarEvent) => void;
  isDesktopViewport: boolean;
};

export default function ResourceCalendarPane({ resource, days, events, range, onEventClick, isDesktopViewport }: ResourceCalendarPaneProps) {
  const totalHeightPx = (range.endHour - range.startHour) * PX_PER_HOUR;

  return (
    <div
      className={`overflow-hidden rounded-xl border border-border bg-surface shadow-sm ${isDesktopViewport ? "w-[620px] shrink-0" : "w-full"}`}
    >
      <div className="border-b border-border bg-muted/30 px-4 py-2.5">
        <p className="truncate text-sm font-medium text-surface-foreground">
          {resource.name}
          {resource.isCurrentUser ? <span className="text-muted-foreground"> (you)</span> : null}
        </p>
        <p className="truncate text-xs text-muted-foreground">{resource.role}</p>
      </div>

      <div className="flex border-b border-border">
        <div className="shrink-0" style={{ width: 56 }} />
        {days.map((day) => (
          <div key={day.toISOString()} className="flex-1 border-l border-border px-2 py-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {formatDayHeader(day)}
          </div>
        ))}
      </div>

      <div className="flex overflow-y-auto" style={{ maxHeight: MAX_PANE_BODY_HEIGHT_PX }}>
        <CalendarHourGutter range={range} />
        {days.map((day) => (
          <CalendarDayColumn
            key={day.toISOString()}
            day={day}
            events={events.filter((event) => isSameDay(new Date(event.start), day))}
            range={range}
            totalHeightPx={totalHeightPx}
            onEventClick={onEventClick}
          />
        ))}
      </div>
    </div>
  );
}
