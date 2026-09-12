import { ChevronLeft, ChevronRight } from "lucide-react";

import { formatDayLabel } from "../calendar-utils";

type DayNavigatorProps = {
  day: Date;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
};

export default function DayNavigator({ day, onPrevious, onNext, onToday }: DayNavigatorProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex overflow-hidden rounded-lg border border-border">
        <button type="button" onClick={onPrevious} aria-label="Previous day" className="p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-surface-foreground">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button type="button" onClick={onToday} className="border-x border-border px-3 py-2 text-sm font-medium text-surface-foreground transition-colors hover:bg-muted">
          Today
        </button>
        <button type="button" onClick={onNext} aria-label="Next day" className="p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-surface-foreground">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <p className="text-sm font-medium text-surface-foreground">{formatDayLabel(day)}</p>
    </div>
  );
}
