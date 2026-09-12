import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import { StatusBadge } from "../../../components/common/StatusBadge";
import { useMediaQuery } from "../../../lib/useMediaQuery";
import { getProjectAllocatedHours } from "../../../store/selectors/projectSelectors";
import type { Phase, Project } from "../../../types/domain";

type CustomerProjectTableProps = {
  projects: Project[];
  phases: Phase[];
};

export default function CustomerProjectTable({ projects, phases }: CustomerProjectTableProps) {
  const isDesktopViewport = useMediaQuery("(min-width: 768px)");

  const rows = projects.map((project) => {
    const allocated = getProjectAllocatedHours(phases, project.id);

    return { project, allocated, remaining: project.estimatedHours - allocated };
  });

  if (!isDesktopViewport) {
    return (
      <div className="space-y-3">
        {rows.map(({ project, allocated, remaining }) => (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            aria-label={`Open ${project.name}`}
            className="block rounded-xl border border-border bg-surface p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-primary">{project.name}</p>
                {project.code ? <p className="text-xs text-muted-foreground">{project.code}</p> : null}
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
            </div>

            <div className="mt-3">
              <StatusBadge status={project.status} />
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Estimated</dt>
                <dd className="text-surface-foreground">{project.estimatedHours}h</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Allocated</dt>
                <dd className="text-surface-foreground">{allocated}h</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Remaining</dt>
                <dd className={`font-medium ${remaining < 0 ? "text-destructive" : "text-surface-foreground"}`}>{remaining}h</dd>
              </div>
            </dl>
          </Link>
        ))}
      </div>
    );
  }

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
          {rows.map(({ project, allocated, remaining }) => (
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
