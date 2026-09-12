import { getVisibleHourRange } from "../calendar-grid";
import { addDays, isSameDay } from "../calendar-utils";
import type { CalendarEvent, Resource } from "../../../types/domain";
import ResourceCalendarPane from "./ResourceCalendarPane";

type ResourceCalendarBoardProps = {
  resources: Resource[];
  calendarEvents: CalendarEvent[];
  weekStart: Date;
  onEventClick: (event: CalendarEvent) => void;
};

export default function ResourceCalendarBoard({ resources, calendarEvents, weekStart, onEventClick }: ResourceCalendarBoardProps) {
  const days = Array.from({ length: 5 }, (_, index) => addDays(weekStart, index));
  const resourceIds = new Set(resources.map((resource) => resource.id));

  const visibleEvents = calendarEvents.filter(
    (event) => resourceIds.has(event.resourceId) && days.some((day) => isSameDay(new Date(event.start), day)),
  );

  const range = getVisibleHourRange(visibleEvents);

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-4 pb-2">
        {resources.map((resource) => (
          <ResourceCalendarPane
            key={resource.id}
            resource={resource}
            days={days}
            events={visibleEvents.filter((event) => event.resourceId === resource.id)}
            range={range}
            onEventClick={onEventClick}
          />
        ))}
      </div>
    </div>
  );
}
