import { type FormEvent, type ReactNode, useState } from "react";

import FormField, { inputClassName } from "../../../components/common/FormField";
import HoursDifferenceValue from "../../../components/common/HoursDifferenceValue";
import Modal from "../../../components/common/Modal";
import { StatusBadge } from "../../../components/common/StatusBadge";
import { useToastStore } from "../../../components/common/toastStore";
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
  const showToast = useToastStore((state) => state.showToast);

  const [actualHoursInput, setActualHoursInput] = useState(action?.actualHours !== undefined ? String(action.actualHours) : "");
  const [formError, setFormError] = useState<string | undefined>();

  if (!action) return null;

  const resource = action.resourceId ? resources.find((item) => item.id === action.resourceId) : undefined;
  const resourceEvents = resource ? calendarEvents.filter((event) => event.resourceId === resource.id) : [];
  const range = getVisibleHourRange(resourceEvents);
  const booking = getBookingForAction(action.id, calendarEvents);
  const scheduledDay = action.scheduledDate ? parseLocalDate(action.scheduledDate) : new Date();
  const conflicts = getActionConflicts(action, calendarEvents);
  const suggestions: TimeWindow[] = resource ? findAvailableSlots(scheduledDay, action.estimatedHours, resource.id, calendarEvents) : [];

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

  const parsedActualHours = actualHoursInput.trim() === "" ? undefined : Number(actualHoursInput);
  const hasValidPreview = parsedActualHours !== undefined && !Number.isNaN(parsedActualHours);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setFormError(undefined);

    const result = updateAction(actionId, {
      actualHours: parsedActualHours,
    });

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    showToast(`Actual hours updated for "${action.name}".`);
    onClose();
  };

  return (
    <Modal title={action.name} description={task?.name} onClose={onClose} widthClassName={resource ? "max-w-3xl" : "max-w-md"}>
      <div>
        <DetailRow label="Status" value={<StatusBadge status={action.status} />} />
        <DetailRow label="Booked Hours" value={`${action.estimatedHours}h`} />
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
                <ResourceCalendarPane resource={resource} days={[scheduledDay]} events={resourceEvents} range={range} onEventClick={() => undefined} />
              </div>
            ) : (
              <p className="mb-3 text-sm text-muted-foreground">Pick a date and time in the hierarchy row to preview this booking against {resource.name}&apos;s calendar.</p>
            )}

            {suggestions.length > 0 ? (
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
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Assign a Resource in the hierarchy to schedule this Action.</p>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-4">
        <FormField label="Actual Hours" htmlFor="action-actual-hours" optional>
          <input
            id="action-actual-hours"
            type="number"
            min={0}
            step={1}
            value={actualHoursInput}
            onChange={(event) => setActualHoursInput(event.target.value)}
            className={inputClassName}
          />
        </FormField>

        {hasValidPreview ? (
          <p className="mb-4 -mt-2 text-sm text-muted-foreground">
            Difference: <HoursDifferenceValue estimatedHours={action.estimatedHours} actualHours={parsedActualHours} />
          </p>
        ) : null}

        {formError ? <p className="mb-4 text-sm text-destructive">{formError}</p> : null}

        <div className="mt-2 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md border border-border px-3 py-2 text-sm font-medium text-surface-foreground transition-colors hover:bg-muted">
            Cancel
          </button>
          <button type="submit" className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover">
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
}
