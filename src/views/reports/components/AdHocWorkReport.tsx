import { Download, Wrench } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import EmptyState from "../../../components/common/EmptyState";
import { inputClassName } from "../../../components/common/FormField";
import { getAdHocReportRows } from "../../../store/selectors/reportSelectors";
import { AD_HOC_CONTEXTS } from "../../../store/slices/adHocTimeSlice";
import { useTraxionDemoStore } from "../../../store/useTraxionDemoStore";
import type { AdHocContext } from "../../../types/domain";
import { exportAdHocReport } from "../reportExport";

export default function AdHocWorkReport() {
  const [searchParams, setSearchParams] = useSearchParams();

  const adHocTimeEntries = useTraxionDemoStore((state) => state.adHocTimeEntries);
  const resources = useTraxionDemoStore((state) => state.resources);
  const timeTypes = useTraxionDemoStore((state) => state.timeTypes);

  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const resourceId = searchParams.get("resourceId") ?? "";
  const context = (searchParams.get("context") ?? "") as AdHocContext | "";

  const setFilter = (key: string, value: string): void => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const rows = getAdHocReportRows(adHocTimeEntries, resources, timeTypes, {
    from: from || undefined,
    to: to || undefined,
    resourceId: resourceId || undefined,
    context: context || undefined,
  });

  const totalHours = rows.reduce((sum, row) => sum + row.entry.durationHours, 0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div>
          <label htmlFor="adhoc-from" className="mb-1 block text-xs font-medium text-muted-foreground">
            From
          </label>
          <input id="adhoc-from" type="date" value={from} onChange={(event) => setFilter("from", event.target.value)} className={inputClassName} />
        </div>
        <div>
          <label htmlFor="adhoc-to" className="mb-1 block text-xs font-medium text-muted-foreground">
            To
          </label>
          <input id="adhoc-to" type="date" value={to} onChange={(event) => setFilter("to", event.target.value)} className={inputClassName} />
        </div>
        <div>
          <label htmlFor="adhoc-resource" className="mb-1 block text-xs font-medium text-muted-foreground">
            Resource
          </label>
          <select id="adhoc-resource" value={resourceId} onChange={(event) => setFilter("resourceId", event.target.value)} className={inputClassName}>
            <option value="">All resources</option>
            {resources.map((resource) => (
              <option key={resource.id} value={resource.id}>
                {resource.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="adhoc-context" className="mb-1 block text-xs font-medium text-muted-foreground">
            Context
          </label>
          <select id="adhoc-context" value={context} onChange={(event) => setFilter("context", event.target.value)} className={inputClassName}>
            <option value="">All contexts</option>
            {AD_HOC_CONTEXTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => exportAdHocReport(rows)}
          disabled={rows.length === 0}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Export to Excel
        </button>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No ad-hoc work logged"
          description="Time Resources log outside a Project Action — unplanned or unbooked work — will show up here without affecting any Project's figures."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Resource</th>
                <th className="px-4 py-3 font-medium">Context</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Time Type</th>
                <th className="px-4 py-3 font-medium text-right">Hours</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.entry.id} className="border-b border-border last:border-b-0 hover:bg-muted/40">
                  <td className="px-4 py-3 text-surface-foreground">
                    {row.entry.workDate}
                    {row.entry.startTime ? <span className="text-muted-foreground"> · {row.entry.startTime}</span> : null}
                  </td>
                  <td className="px-4 py-3 text-surface-foreground">{row.resourceName}</td>
                  <td className="px-4 py-3 text-surface-foreground">{row.contextLabel}</td>
                  <td className="px-4 py-3 text-surface-foreground">{row.entry.description}</td>
                  <td className="px-4 py-3 text-surface-foreground">{row.timeType?.timeTag ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-surface-foreground">{row.entry.durationHours}h</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5} className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Total
                </td>
                <td className="px-4 py-3 text-right font-medium text-surface-foreground">{totalHours}h</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
