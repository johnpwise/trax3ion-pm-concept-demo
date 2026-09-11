import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import { StatusBadge } from "../../../components/common/StatusBadge";
import type { Customer, Phase, Project } from "../../../types/domain";
import { getProjectAllocatedHours, getProjectPhases } from "../../../store/selectors/projectSelectors";

type ProjectTableProps = {
  projects: Project[];
  customersById: Map<string, Customer>;
  phases: Phase[];
};

export default function ProjectTable({ projects, customersById, phases }: ProjectTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-medium">Project</th>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Estimated</th>
            <th className="px-4 py-3 font-medium text-right">Allocated</th>
            <th className="px-4 py-3 font-medium text-right">Remaining</th>
            <th className="px-4 py-3 font-medium text-right">Phases</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const allocated = getProjectAllocatedHours(phases, project.id);
            const remaining = project.estimatedHours - allocated;
            const phaseCount = getProjectPhases(phases, project.id).length;
            const customer = customersById.get(project.customerId);

            return (
              <tr key={project.id} className="border-b border-border last:border-b-0 hover:bg-muted/40">
                <td className="px-4 py-3">
                  <Link to={`/projects/${project.id}`} className="font-medium text-primary hover:underline">
                    {project.name}
                  </Link>
                  {project.code ? <p className="text-xs text-muted-foreground">{project.code}</p> : null}
                </td>
                <td className="px-4 py-3 text-surface-foreground">{customer?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={project.status} />
                </td>
                <td className="px-4 py-3 text-right text-surface-foreground">{project.estimatedHours}h</td>
                <td className="px-4 py-3 text-right text-surface-foreground">{allocated}h</td>
                <td className={`px-4 py-3 text-right font-medium ${remaining < 0 ? "text-destructive" : "text-surface-foreground"}`}>{remaining}h</td>
                <td className="px-4 py-3 text-right text-surface-foreground">{phaseCount}</td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/projects/${project.id}`} aria-label={`Open ${project.name}`} className="inline-flex text-muted-foreground hover:text-surface-foreground">
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
