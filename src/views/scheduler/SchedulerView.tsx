import { CalendarX2 } from "lucide-react";
import { useState } from "react";

import PageHeader from "../../app/PageHeader";
import EmptyState from "../../components/common/EmptyState";
import { useToastStore } from "../../components/common/toastStore";
import { useTraxionDemoStore } from "../../store/useTraxionDemoStore";
import type { CalendarEvent } from "../../types/domain";
import CalendarEventDetails from "./components/CalendarEventDetails";
import CalendarLegend from "./components/CalendarLegend";
import ResourceCalendarBoard from "./components/ResourceCalendarBoard";
import ResourcePicker from "./components/ResourcePicker";
import WeekNavigator from "./components/WeekNavigator";

export default function SchedulerView() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const resources = useTraxionDemoStore((state) => state.resources);
  const calendarEvents = useTraxionDemoStore((state) => state.calendarEvents);
  const selectedResourceIds = useTraxionDemoStore((state) => state.selectedResourceIds);
  const visibleWeekStart = useTraxionDemoStore((state) => state.visibleWeekStart);
  const toggleResource = useTraxionDemoStore((state) => state.toggleResource);
  const goToPreviousWeek = useTraxionDemoStore((state) => state.goToPreviousWeek);
  const goToNextWeek = useTraxionDemoStore((state) => state.goToNextWeek);
  const goToCurrentWeek = useTraxionDemoStore((state) => state.goToCurrentWeek);
  const customers = useTraxionDemoStore((state) => state.customers);
  const projects = useTraxionDemoStore((state) => state.projects);
  const actions = useTraxionDemoStore((state) => state.actions);
  const discardBooking = useTraxionDemoStore((state) => state.discardBooking);
  const showToast = useToastStore((state) => state.showToast);

  const activeResources = resources
    .filter((resource) => resource.status === "active")
    .sort((a, b) => Number(Boolean(b.isCurrentUser)) - Number(Boolean(a.isCurrentUser)));

  const selectedResources = activeResources.filter((resource) => selectedResourceIds.includes(resource.id));
  const weekStart = new Date(visibleWeekStart);

  const selectedEventResource = selectedEvent ? resources.find((resource) => resource.id === selectedEvent.resourceId) : undefined;
  const selectedEventCustomer = selectedEvent?.customerId ? customers.find((customer) => customer.id === selectedEvent.customerId) : undefined;
  const selectedEventProject = selectedEvent?.projectId ? projects.find((project) => project.id === selectedEvent.projectId) : undefined;
  const selectedEventAction = selectedEvent?.actionId ? actions.find((action) => action.id === selectedEvent.actionId) : undefined;

  const handleDiscard = (eventId: string): void => {
    discardBooking(eventId);
    setSelectedEvent(null);
    showToast("Booking discarded.");
  };

  return (
    <div>
      <PageHeader title="Scheduler" description="Compare your calendar alongside selected Resources for the week.">
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <WeekNavigator weekStart={weekStart} onPrevious={goToPreviousWeek} onNext={goToNextWeek} onToday={goToCurrentWeek} />
          <CalendarLegend />
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
        <ResourcePicker resources={activeResources} selectedResourceIds={selectedResourceIds} onToggle={toggleResource} />

        {selectedResources.length === 0 ? (
          <EmptyState icon={CalendarX2} title="No Resources selected" description="Select at least one Resource from the list to view their availability." />
        ) : (
          <ResourceCalendarBoard resources={selectedResources} calendarEvents={calendarEvents} weekStart={weekStart} onEventClick={setSelectedEvent} />
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Availability shown here is simulated demo data seeded for this concept build. No Microsoft 365 connection is made.
      </p>

      {selectedEvent && selectedEventResource ? (
        <CalendarEventDetails
          event={selectedEvent}
          resourceName={selectedEventResource.name}
          customerName={selectedEventCustomer?.name}
          projectName={selectedEventProject?.name}
          actionName={selectedEventAction?.name}
          onClose={() => setSelectedEvent(null)}
          onDiscard={selectedEvent.status === "provisional" ? () => handleDiscard(selectedEvent.id) : undefined}
        />
      ) : null}
    </div>
  );
}
