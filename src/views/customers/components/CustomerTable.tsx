import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import { StatusBadge } from "../../../components/common/StatusBadge";
import { useMediaQuery } from "../../../lib/useMediaQuery";
import type { Customer, Project } from "../../../types/domain";

type CustomerTableProps = {
  customers: Customer[];
  projects: Project[];
};

export default function CustomerTable({ customers, projects }: CustomerTableProps) {
  const isDesktopViewport = useMediaQuery("(min-width: 768px)");

  const rows = customers.map((customer) => {
    const customerProjects = projects.filter((project) => project.customerId === customer.id);

    return {
      customer,
      activeProjects: customerProjects.filter((project) => project.status === "active").length,
      totalProjects: customerProjects.length,
      estimatedHours: customerProjects.reduce((sum, project) => sum + project.estimatedHours, 0),
    };
  });

  if (!isDesktopViewport) {
    return (
      <div className="space-y-3">
        {rows.map(({ customer, activeProjects, totalProjects, estimatedHours }) => (
          <Link
            key={customer.id}
            to={`/customers/${customer.id}`}
            aria-label={`Open ${customer.name}`}
            className="block rounded-xl border border-border bg-surface p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 font-medium text-primary">{customer.name}</p>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
            </div>

            <div className="mt-3">
              <StatusBadge status={customer.status} />
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Active Projects</dt>
                <dd className="text-surface-foreground">{activeProjects}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Total Projects</dt>
                <dd className="text-surface-foreground">{totalProjects}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Estimated Hours</dt>
                <dd className="text-surface-foreground">{estimatedHours}h</dd>
              </div>
            </dl>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Active Projects</th>
            <th className="px-4 py-3 font-medium text-right">Total Projects</th>
            <th className="px-4 py-3 font-medium text-right">Estimated Hours</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {rows.map(({ customer, activeProjects, totalProjects, estimatedHours }) => (
            <tr key={customer.id} className="border-b border-border last:border-b-0 hover:bg-muted/40">
              <td className="px-4 py-3">
                <Link to={`/customers/${customer.id}`} className="font-medium text-primary hover:underline">
                  {customer.name}
                </Link>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={customer.status} />
              </td>
              <td className="px-4 py-3 text-right text-surface-foreground">{activeProjects}</td>
              <td className="px-4 py-3 text-right text-surface-foreground">{totalProjects}</td>
              <td className="px-4 py-3 text-right text-surface-foreground">{estimatedHours}h</td>
              <td className="px-4 py-3 text-right">
                <Link to={`/customers/${customer.id}`} aria-label={`Open ${customer.name}`} className="inline-flex text-muted-foreground hover:text-surface-foreground">
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
