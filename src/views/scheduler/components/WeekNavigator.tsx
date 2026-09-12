import { ChevronLeft, ChevronRight } from "lucide-react";

import { formatWeekRangeLabel } from "../calendar-utils";

type WeekNavigatorProps = {
  weekStart: Date;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
};

export default function WeekNavigator({ weekStart, onPrevious, onNext, onToday }: WeekNavigatorProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex overflow-hidden rounded-lg border border-border">
        <button type="button" onClick={onPrevious} aria-label="Previous week" className="p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-surface-foreground">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button type="button" onClick={onToday} className="border-x border-border px-3 py-2 text-sm font-medium text-surface-foreground transition-colors hover:bg-muted">
          Today
        </button>
        <button type="button" onClick={onNext} aria-label="Next week" className="p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-surface-foreground">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <p className="text-sm font-medium text-surface-foreground">{formatWeekRangeLabel(weekStart)}</p>
    </div>
  );
}
