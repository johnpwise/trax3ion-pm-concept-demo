import { Briefcase, CalendarClock, Clock } from "lucide-react";
import type { CSSProperties } from "react";

import type { CalendarEvent } from "../../../types/domain";
import { formatEventTime } from "../calendar-utils";

type CalendarEventBlockProps = {
  event: CalendarEvent;
  onClick: () => void;
  style: CSSProperties;
};

export default function CalendarEventBlock({ event, onClick, style }: CalendarEventBlockProps) {
  const isProvisional = event.source === "trax3ion" && event.status === "provisional";
  const isBooking = event.source === "trax3ion";

  const variantClassName = isProvisional
    ? "border-2 border-dashed border-amber-500/50 bg-amber-500/10 text-amber-700 hover:bg-amber-500/15 dark:text-amber-400"
    : isBooking
      ? "border border-primary-line bg-primary/10 text-primary hover:bg-primary/15"
      : "border-2 border-dashed border-muted-foreground/40 bg-surface text-muted-foreground hover:bg-muted/60";

  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className={`absolute overflow-hidden rounded-md px-1.5 py-1 text-left text-[11px] leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${variantClassName}`}
    >
      <span className="flex items-center gap-1 font-medium">
        {isProvisional ? <Clock className="h-3 w-3 shrink-0" /> : isBooking ? <Briefcase className="h-3 w-3 shrink-0" /> : <CalendarClock className="h-3 w-3 shrink-0" />}
        <span className="truncate">{formatEventTime(event.start, event.end)}</span>
      </span>
      <span className="block truncate">{event.title}</span>
    </button>
  );
}
