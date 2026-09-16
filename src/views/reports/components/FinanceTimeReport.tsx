import { Download, Receipt } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import EmptyState from "../../../components/common/EmptyState";
import { inputClassName } from "../../../components/common/FormField";
import { getTimeEntryReportRows } from "../../../store/selectors/reportSelectors";
import { useTraxionDemoStore } from "../../../store/useTraxionDemoStore";
import { exportFinanceTimeReport } from "../reportExport";

export default function FinanceTimeReport() {
  const [searchParams, setSearchParams] = useSearchParams();

  const timeEntries = useTraxionDemoStore((state) => state.timeEntries);
  const actions = useTraxionDemoStore((state) => state.actions);
  const tasks = useTraxionDemoStore((state) => state.tasks);
  const phases = useTraxionDemoStore((state) => state.phases);
  const projects = useTraxionDemoStore((state) => state.projects);
  const customers = useTraxionDemoStore((state) => state.customers);
  const resources = useTraxionDemoStore((state) => state.resources);
  const timeTypes = useTraxionDemoStore((state) => state.timeTypes);

  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const customerId = searchParams.get("customerId") ?? "";
  const projectId = searchParams.get("projectId") ?? "";
  const resourceId = searchParams.get("resourceId") ?? "";

  const setFilter = (key: string, value: string): void => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const rows = getTimeEntryReportRows(timeEntries, actions, tasks, phases, projects, customers, resources, timeTypes, {
    from: from || undefined,
    to: to || undefined,
    customerId: customerId || undefined,
    projectId: projectId || undefined,
    resourceId: resourceId || undefined,
  });

  const projectsForCustomer = customerId ? projects.filter((project) => project.customerId === customerId) : projects;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div>
          <label htmlFor="finance-from" className="mb-1 block text-xs font-medium text-muted-foreground">
            From
          </label>
          <input id="finance-from" type="date" value={from} onChange={(event) => setFilter("from", event.target.value)} className={inputClassName} />
        </div>
        <div>
          <label htmlFor="finance-to" className="mb-1 block text-xs font-medium text-muted-foreground">
            To
          </label>
          <input id="finance-to" type="date" value={to} onChange={(event) => setFilter("to", event.target.value)} className={inputClassName} />
        </div>
        <div>
          <label htmlFor="finance-customer" className="mb-1 block text-xs font-medium text-muted-foreground">
            Customer
          </label>
          <select
            id="finance-customer"
            value={customerId}
            onChange={(event) => {
              setFilter("customerId", event.target.value);
              setFilter("projectId", "");
            }}
            className={inputClassName}
          >
            <option value="">All customers</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="finance-project" className="mb-1 block text-xs font-medium text-muted-foreground">
            Project
          </label>
          <select id="finance-project" value={projectId} onChange={(event) => setFilter("projectId", event.target.value)} className={inputClassName}>
            <option value="">All projects</option>
            {projectsForCustomer.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="finance-resource" className="mb-1 block text-xs font-medium text-muted-foreground">
            Resource
          </label>
          <select id="finance-resource" value={resourceId} onChange={(event) => setFilter("resourceId", event.target.value)} className={inputClassName}>
            <option value="">All resources</option>
            {resources.map((resource) => (
              <option key={resource.id} value={resource.id}>
                {resource.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => exportFinanceTimeReport(rows)}
          disabled={rows.length === 0}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Export to Excel
        </button>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No time entries match these filters"
          description="Widen the date range or clear a filter, or check back once consultants have logged time."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Task</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Resource</th>
                <th className="px-4 py-3 font-medium text-right">Hours</th>
                <th className="px-4 py-3 font-medium">Time Type</th>
                <th className="px-4 py-3 font-medium text-center">Invoice</th>
                <th className="px-4 py-3 font-medium text-center">EST</th>
                <th className="px-4 py-3 font-medium text-center">SLT</th>
                <th className="px-4 py-3 font-medium text-center">Banked</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.entry.id} className="border-b border-border last:border-b-0 hover:bg-muted/40">
                  <td className="px-4 py-3 text-surface-foreground">{row.entry.workDate}</td>
                  <td className="px-4 py-3 text-surface-foreground">{row.customerName}</td>
                  <td className="px-4 py-3 text-surface-foreground">{row.projectName}</td>
                  <td className="px-4 py-3 text-surface-foreground">{row.taskName}</td>
                  <td className="px-4 py-3 text-surface-foreground">{row.actionName}</td>
                  <td className="px-4 py-3 text-surface-foreground">{row.resourceName}</td>
                  <td className="px-4 py-3 text-right text-surface-foreground">{row.entry.durationHours}h</td>
                  <td className="px-4 py-3 text-surface-foreground">{row.timeType?.timeTag ?? "—"}</td>
                  <td className="px-4 py-3 text-center text-surface-foreground">{row.timeType?.allocateAgainstInvoice ? "YES" : "NO"}</td>
                  <td className="px-4 py-3 text-center text-surface-foreground">{row.timeType?.allocateAgainstEst ? "YES" : "NO"}</td>
                  <td className="px-4 py-3 text-center text-surface-foreground">{row.timeType?.sltInternal ? "YES" : "NO"}</td>
                  <td className="px-4 py-3 text-center text-surface-foreground">{row.timeType?.bankedInternal ? "YES" : "NO"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
