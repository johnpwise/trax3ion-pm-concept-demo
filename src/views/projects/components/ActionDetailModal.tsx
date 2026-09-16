import type { ReactNode } from "react";

import HoursDifferenceValue from "../../../components/common/HoursDifferenceValue";
import Modal from "../../../components/common/Modal";
import { StatusBadge } from "../../../components/common/StatusBadge";
import { useToastStore } from "../../../components/common/toastStore";
import { useCanEdit } from "../../../store/authStore";
import { getActionActualHours } from "../../../store/selectors/projectSelectors";
import { getActionConflicts, getBookingForAction } from "../../../store/selectors/schedulerSelectors";
import { useTraxionDemoStore } from "../../../store/useTraxionDemoStore";
import { findAvailableSlots, type TimeWindow } from "../../scheduler/availability";
import { getVisibleHourRange } from "../../scheduler/calendar-grid";
import { formatEventDate, formatEventTime, parseLocalDate, toDateInputValue, toTimeInputValue } from "../../scheduler/calendar-utils";
import ResourceCalendarPane from "../../scheduler/components/ResourceCalendarPane";

type ActionDetailModalProps = {
  actionId: string;
  onClose: () => void;
};

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-2.5 text-sm last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-surface-foreground">{value}</span>
    </div>
  );
}

export default function ActionDetailModal({ actionId, onClose }: ActionDetailModalProps) {
  const action = useTraxionDemoStore((state) => state.actions.find((item) => item.id === actionId));
  const task = useTraxionDemoStore((state) => (action ? state.tasks.find((item) => item.id === action.taskId) : undefined));
  const updateAction = useTraxionDemoStore((state) => state.updateAction);
  const syncActionBooking = useTraxionDemoStore((state) => state.syncActionBooking);
  const resources = useTraxionDemoStore((state) => state.resources);
  const calendarEvents = useTraxionDemoStore((state) => state.calendarEvents);
  const timeEntries = useTraxionDemoStore((state) => state.timeEntries);
  const timeTypes = useTraxionDemoStore((state) => state.timeTypes);
  const showToast = useToastStore((state) => state.showToast);
  const canEdit = useCanEdit();

  if (!action) return null;

  const resource = action.resourceId ? resources.find((item) => item.id === action.resourceId) : undefined;
  const resourceEvents = resource ? calendarEvents.filter((event) => event.resourceId === resource.id) : [];
  const range = getVisibleHourRange(resourceEvents);
  const booking = getBookingForAction(action.id, calendarEvents);
  const scheduledDay = action.scheduledDate ? parseLocalDate(action.scheduledDate) : new Date();
  const conflicts = getActionConflicts(action, calendarEvents);
  const suggestions: TimeWindow[] = resource ? findAvailableSlots(scheduledDay, action.estimatedHours ?? 1, resource.id, calendarEvents) : [];

  const actionTimeEntries = timeEntries
    .filter((entry) => entry.actionId === action.id)
    .sort((a, b) => new Date(b.workDate).getTime() - new Date(a.workDate).getTime());
  const actualHours = getActionActualHours(timeEntries, action.id);

  const bookingStatusLabel = !booking ? "Not yet scheduled" : booking.status === "provisional" ? "Provisional — pending publish" : "Published";
  const bookingStatusClassName = !booking
    ? "bg-muted text-muted-foreground border-border"
    : booking.status === "provisional"
      ? "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400"
      : "bg-primary/10 text-primary border-primary-line";

  const handleSuggestionClick = (slot: TimeWindow): void => {
    const slotStart = new Date(slot.start);
    const result = updateAction(actionId, {
      scheduledDate: toDateInputValue(slotStart),
      scheduledTime: toTimeInputValue(slotStart),
    });
    if (result.ok) {
      syncActionBooking(actionId);
      showToast(`${action.name} scheduled for ${formatEventDate(slot.start)} at ${toTimeInputValue(slotStart)}.`);
    }
  };

  return (
    <Modal title={action.name} description={task?.name} onClose={onClose} widthClassName={resource ? "max-w-3xl" : "max-w-md"}>
      <div>
        <DetailRow label="Status" value={<StatusBadge status={action.status} />} />
        <DetailRow label="Booked Hours" value={action.estimatedHours !== undefined ? `${action.estimatedHours}h` : "Ad hoc (no estimate)"} />
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-surface-foreground">Scheduling</h3>
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${bookingStatusClassName}`}>
            {bookingStatusLabel}
          </span>
        </div>

        {resource ? (
          <>
            {conflicts.length > 0 ? (
              <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                Conflicts with {conflicts.map((conflict) => `${conflict.title} (${formatEventTime(conflict.start, conflict.end)})`).join(", ")}
              </div>
            ) : null}

            {action.scheduledDate && action.scheduledTime ? (
              <div className="mb-3 overflow-x-auto">
                <ResourceCalendarPane resource={resource} days={[scheduledDay]} events={resourceEvents} range={range} onEventClick={() => undefined} isDesktopViewport />
              </div>
            ) : (
              <p className="mb-3 text-sm text-muted-foreground">
                {canEdit
                  ? `Pick a date and time in the hierarchy row to preview this booking against ${resource.name}'s calendar.`
                  : "Not yet scheduled. A Project Manager can assign a date and time for this Action."}
              </p>
            )}

            {canEdit ? (
              suggestions.length > 0 ? (
                <div>
                  <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Suggested available times</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((slot) => (
                      <button
                        key={slot.start}
                        type="button"
                        onClick={() => handleSuggestionClick(slot)}
                        className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-surface-foreground transition-colors hover:bg-muted"
                      >
                        {formatEventTime(slot.start, slot.end)}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No available slots found for {resource.name} on {formatEventDate(scheduledDay.toISOString())} within working hours.</p>
              )
            ) : null}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Assign a Resource in the hierarchy to schedule this Action.</p>
        )}
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-surface-foreground">Time Logged</h3>
          {action.estimatedHours !== undefined ? (
            <span className="text-xs text-muted-foreground">
              {actualHours}h logged of {action.estimatedHours}h — <HoursDifferenceValue estimatedHours={action.estimatedHours} actualHours={actualHours} />
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">{actualHours}h logged (ad hoc, no estimate)</span>
          )}
        </div>

        {actionTimeEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No time logged against this Action yet.</p>
        ) : (
          <div>
            {actionTimeEntries.map((entry) => {
              const timeType = timeTypes.find((item) => item.id === entry.timeTypeId);
              return (
                <div key={entry.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-2 text-sm last:border-b-0">
                  <span className="font-medium text-surface-foreground">{entry.workDate}</span>
                  <span className="text-muted-foreground">{entry.durationHours}h{timeType ? ` — ${timeType.timeTag}` : ""}</span>
                  {entry.description ? <span className="w-full text-xs text-muted-foreground">{entry.description}</span> : null}
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-3 text-xs text-muted-foreground">
          {resource ? resource.name : "The assigned resource"} logs time against this Action from the "Log Time" action on their dashboard.
        </p>
      </div>

      <div className="mt-4 flex justify-end">
        <button type="button" onClick={onClose} className="rounded-md border border-border px-3 py-2 text-sm font-medium text-surface-foreground transition-colors hover:bg-muted">
          Close
        </button>
      </div>
    </Modal>
  );
}
