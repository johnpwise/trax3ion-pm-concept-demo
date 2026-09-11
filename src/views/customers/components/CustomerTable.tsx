import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import { StatusBadge } from "../../../components/common/StatusBadge";
import type { Customer, Project } from "../../../types/domain";

type CustomerTableProps = {
  customers: Customer[];
  projects: Project[];
};

export default function CustomerTable({ customers, projects }: CustomerTableProps) {
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
          {customers.map((customer) => {
            const customerProjects = projects.filter((project) => project.customerId === customer.id);
            const activeProjects = customerProjects.filter((project) => project.status === "active").length;
            const estimatedHours = customerProjects.reduce((sum, project) => sum + project.estimatedHours, 0);

            return (
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
                <td className="px-4 py-3 text-right text-surface-foreground">{customerProjects.length}</td>
                <td className="px-4 py-3 text-right text-surface-foreground">{estimatedHours}h</td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/customers/${customer.id}`} aria-label={`Open ${customer.name}`} className="inline-flex text-muted-foreground hover:text-surface-foreground">
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
