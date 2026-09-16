import { ChevronLeft, ChevronRight, Download, Gauge } from "lucide-react";
import { useState } from "react";

import EmptyState from "../../../components/common/EmptyState";
import { getUtilisationReportRows } from "../../../store/selectors/reportSelectors";
import { useTraxionDemoStore } from "../../../store/useTraxionDemoStore";
import { addWeeks, formatWeekRangeLabel, getStartOfWeek } from "../../scheduler/calendar-utils";
import { exportUtilisationReport } from "../reportExport";

export default function UtilisationReport() {
  const [weekStart, setWeekStart] = useState(() => getStartOfWeek(new Date()));

  const resources = useTraxionDemoStore((state) => state.resources);
  const actions = useTraxionDemoStore((state) => state.actions);
  const calendarEvents = useTraxionDemoStore((state) => state.calendarEvents);
  const timeEntries = useTraxionDemoStore((state) => state.timeEntries);
  const adHocTimeEntries = useTraxionDemoStore((state) => state.adHocTimeEntries);

  const weekLabel = formatWeekRangeLabel(weekStart);
  const rows = getUtilisationReportRows(resources, actions, calendarEvents, timeEntries, adHocTimeEntries, weekStart);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWeekStart((current) => addWeeks(current, -1))}
            aria-label="Previous week"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-surface-foreground transition-colors hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[10rem] text-center text-sm font-medium text-surface-foreground">{weekLabel}</span>
          <button
            type="button"
            onClick={() => setWeekStart((current) => addWeeks(current, 1))}
            aria-label="Next week"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-surface-foreground transition-colors hover:bg-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setWeekStart(getStartOfWeek(new Date()))}
            className="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-surface-foreground transition-colors hover:bg-muted"
          >
            This week
          </button>
        </div>
        <button
          type="button"
          onClick={() => exportUtilisationReport(rows, weekLabel)}
          disabled={rows.length === 0}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Export to Excel
        </button>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={Gauge} title="No active resources" description="Utilisation is calculated against active resources only." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Resource</th>
                <th className="px-4 py-3 font-medium text-right">Booked Hours</th>
                <th className="px-4 py-3 font-medium text-right">Ad-hoc Hours</th>
                <th className="px-4 py-3 font-medium text-right">Available Hours</th>
                <th className="px-4 py-3 font-medium text-right">Utilisation</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.resource.id} className="border-b border-border last:border-b-0 hover:bg-muted/40">
                  <td className="px-4 py-3 font-medium text-surface-foreground">{row.resource.name}</td>
                  <td className="px-4 py-3 text-right text-surface-foreground">{row.bookedHours}h</td>
                  <td className="px-4 py-3 text-right text-surface-foreground">{row.adHocHours}h</td>
                  <td className="px-4 py-3 text-right text-surface-foreground">{row.availableHours}h</td>
                  <td className={`px-4 py-3 text-right font-medium ${row.percent >= 100 ? "text-destructive" : "text-surface-foreground"}`}>
                    {row.percent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        Available hours assume a nominal 40h week (Mon–Fri, 8h/day) — actual working-day/lunch conventions are unconfirmed (PRD OQ-011).
      </p>
    </div>
  );
}
