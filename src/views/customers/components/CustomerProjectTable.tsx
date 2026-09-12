import { Link } from "react-router-dom";

import { StatusBadge } from "../../../components/common/StatusBadge";
import { getProjectAllocatedHours } from "../../../store/selectors/projectSelectors";
import type { Phase, Project } from "../../../types/domain";

type CustomerProjectTableProps = {
  projects: Project[];
  phases: Phase[];
};

export default function CustomerProjectTable({ projects, phases }: CustomerProjectTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-medium">Project</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Estimated</th>
            <th className="px-4 py-3 font-medium text-right">Allocated</th>
            <th className="px-4 py-3 font-medium text-right">Remaining</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const allocated = getProjectAllocatedHours(phases, project.id);
            const remaining = project.estimatedHours - allocated;

            return (
              <tr key={project.id} className="border-b border-border last:border-b-0 hover:bg-muted/40">
                <td className="px-4 py-3">
                  <Link to={`/projects/${project.id}`} className="font-medium text-primary hover:underline">
                    {project.name}
                  </Link>
                  {project.code ? <p className="text-xs text-muted-foreground">{project.code}</p> : null}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={project.status} />
                </td>
                <td className="px-4 py-3 text-right text-surface-foreground">{project.estimatedHours}h</td>
                <td className="px-4 py-3 text-right text-surface-foreground">{allocated}h</td>
                <td className={`px-4 py-3 text-right font-medium ${remaining < 0 ? "text-destructive" : "text-surface-foreground"}`}>{remaining}h</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
