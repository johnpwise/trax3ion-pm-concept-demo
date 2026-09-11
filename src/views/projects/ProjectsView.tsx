import { FolderKanban, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import PageHeader from "../../app/PageHeader";
import EmptyState from "../../components/common/EmptyState";
import StatusFilterTabs from "../../components/common/StatusFilterTabs";
import { filterByStatus } from "../../store/selectors/projectSelectors";
import { useTraxionDemoStore } from "../../store/useTraxionDemoStore";
import type { StatusFilter } from "../../types/domain";
import ProjectFormModal from "./components/ProjectFormModal";
import ProjectTable from "./components/ProjectTable";

function parseStatusFilter(value: string | null): StatusFilter {
  return value === "inactive" || value === "all" ? value : "active";
}

export default function ProjectsView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const navigate = useNavigate();

  const projects = useTraxionDemoStore((state) => state.projects);
  const customers = useTraxionDemoStore((state) => state.customers);
  const phases = useTraxionDemoStore((state) => state.phases);

  const statusFilter = parseStatusFilter(searchParams.get("status"));
  const filteredProjects = filterByStatus(projects, statusFilter);
  const customersById = new Map(customers.map((customer) => [customer.id, customer]));

  return (
    <div>
      <PageHeader
        title="Projects"
        description="View every project across the practice, or narrow by status."
        actions={
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        }
      >
        <div className="mt-4">
          <StatusFilterTabs value={statusFilter} onChange={(value) => setSearchParams(value === "active" ? {} : { status: value })} />
        </div>
      </PageHeader>

      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects match this filter"
          description="Switch filters to see other projects, or create a new one."
          action={
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              <Plus className="h-4 w-4" />
              New Project
            </button>
          }
        />
      ) : (
        <ProjectTable projects={filteredProjects} customersById={customersById} phases={phases} />
      )}

      {isCreateOpen ? (
        <ProjectFormModal onClose={() => setIsCreateOpen(false)} onCreated={(projectId) => navigate(`/projects/${projectId}`)} />
      ) : null}
    </div>
  );
}
