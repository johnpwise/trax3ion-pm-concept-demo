import Modal from "../../../components/common/Modal";
import type { CalendarEvent } from "../../../types/domain";
import { formatEventDate, formatEventTime } from "../calendar-utils";

type CalendarEventDetailsProps = {
  event: CalendarEvent;
  resourceName: string;
  customerName?: string;
  projectName?: string;
  actionName?: string;
  onClose: () => void;
  onDiscard?: () => void;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-2.5 text-sm last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-surface-foreground">{value}</span>
    </div>
  );
}

export default function CalendarEventDetails({ event, resourceName, customerName, projectName, actionName, onClose, onDiscard }: CalendarEventDetailsProps) {
  return (
    <Modal title={event.title} onClose={onClose} widthClassName="max-w-md">
      <div>
        <DetailRow label="Resource" value={resourceName} />
        <DetailRow label="Date" value={formatEventDate(event.start)} />
        <DetailRow label="Time" value={formatEventTime(event.start, event.end)} />
        <DetailRow label="Source" value={event.source === "trax3ion" ? "Trax3ion Project Booking" : "Existing Calendar Commitment"} />
        {event.source === "trax3ion" ? (
          <DetailRow label="Status" value={event.status === "provisional" ? "Provisional — pending publish" : "Published"} />
        ) : null}
        {customerName ? <DetailRow label="Customer" value={customerName} /> : null}
        {projectName ? <DetailRow label="Project" value={projectName} /> : null}
        {actionName ? <DetailRow label="Action" value={actionName} /> : null}
      </div>
      {event.source === "outlook" ? (
        <p className="mt-4 text-xs text-muted-foreground">Simulated demo data — no Microsoft 365 connection is involved.</p>
      ) : null}
      {onDiscard ? (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onDiscard}
            className="rounded-md border border-destructive/40 px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            Discard booking
          </button>
        </div>
      ) : null}
    </Modal>
  );
}
