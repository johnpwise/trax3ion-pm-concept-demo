import { getVisibleHourRange } from "../calendar-grid";
import { addDays, isSameDay } from "../calendar-utils";
import { useMediaQuery } from "../../../lib/useMediaQuery";
import type { CalendarEvent, Resource } from "../../../types/domain";
import ResourceCalendarPane from "./ResourceCalendarPane";

type ResourceCalendarBoardProps = {
  resources: Resource[];
  calendarEvents: CalendarEvent[];
  weekStart: Date;
  visibleDay: Date;
  onEventClick: (event: CalendarEvent) => void;
};

export default function ResourceCalendarBoard({ resources, calendarEvents, weekStart, visibleDay, onEventClick }: ResourceCalendarBoardProps) {
  const isDesktopViewport = useMediaQuery("(min-width: 768px)");

  const weekDays = Array.from({ length: 5 }, (_, index) => addDays(weekStart, index));
  const days = isDesktopViewport ? weekDays : [visibleDay];
  const resourceIds = new Set(resources.map((resource) => resource.id));

  const visibleEvents = calendarEvents.filter(
    (event) => resourceIds.has(event.resourceId) && days.some((day) => isSameDay(new Date(event.start), day)),
  );

  const range = getVisibleHourRange(visibleEvents);

  return (
    <div className={isDesktopViewport ? "overflow-x-auto" : undefined}>
      <div className={isDesktopViewport ? "flex gap-4 pb-2" : "flex flex-col gap-4"}>
        {resources.map((resource) => (
          <ResourceCalendarPane
            key={resource.id}
            resource={resource}
            days={days}
            events={visibleEvents.filter((event) => event.resourceId === resource.id)}
            range={range}
            onEventClick={onEventClick}
            isDesktopViewport={isDesktopViewport}
          />
        ))}
      </div>
    </div>
  );
}
