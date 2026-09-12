import { PX_PER_HOUR, computeEventVerticalLayout, getHourMarks, packOverlappingEvents, type HourRange } from "../calendar-grid";
import type { CalendarEvent } from "../../../types/domain";
import CalendarEventBlock from "./CalendarEventBlock";

type CalendarDayColumnProps = {
  day: Date;
  events: CalendarEvent[];
  range: HourRange;
  totalHeightPx: number;
  onEventClick: (event: CalendarEvent) => void;
};

export default function CalendarDayColumn({ events, range, totalHeightPx, onEventClick }: CalendarDayColumnProps) {
  const hourMarks = getHourMarks(range);
  const packed = packOverlappingEvents(events);

  return (
    <div className="relative flex-1 border-l border-border" style={{ height: totalHeightPx }}>
      {hourMarks.map((hour) => (
        <div
          key={hour}
          className="absolute left-0 right-0 border-t border-border/60"
          style={{ top: (hour - range.startHour) * PX_PER_HOUR }}
        />
      ))}

      {packed.map(({ event, columnIndex, columnCount }) => {
        const { topPx, heightPx } = computeEventVerticalLayout(event, range);
        const widthPercent = 100 / columnCount;

        return (
          <CalendarEventBlock
            key={event.id}
            event={event}
            onClick={() => onEventClick(event)}
            style={{
              top: topPx,
              height: heightPx,
              left: `${columnIndex * widthPercent}%`,
              width: `calc(${widthPercent}% - 4px)`,
            }}
          />
        );
      })}
    </div>
  );
}
