import { FolderKanban, UserX, Plus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import PageHeader from "../../app/PageHeader";
import EmptyState from "../../components/common/EmptyState";
import StatusFilterTabs from "../../components/common/StatusFilterTabs";
import { StatusBadge } from "../../components/common/StatusBadge";
import { filterByStatus, getActiveProjectCountForCustomer, getProjectsForCustomer } from "../../store/selectors/projectSelectors";
import { useTraxionDemoStore } from "../../store/useTraxionDemoStore";
import type { StatusFilter } from "../../types/domain";
import ProjectFormModal from "../projects/components/ProjectFormModal";
import CustomerProjectTable from "./components/CustomerProjectTable";

export default function CustomerDetailView() {
  const { customerId = "" } = useParams();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const customer = useTraxionDemoStore((state) => state.getCustomerById(customerId));
  const projects = useTraxionDemoStore((state) => state.projects);
  const phases = useTraxionDemoStore((state) => state.phases);

  if (!customer) {
    return (
      <EmptyState
        icon={UserX}
        title="Customer not found"
        description="This customer may have been removed by a demo reset."
        action={
          <Link to="/customers" className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover">
            Back to Customers
          </Link>
        }
      />
    );
  }

  const customerProjects = getProjectsForCustomer(projects, customer.id);
  const activeCount = getActiveProjectCountForCustomer(projects, customer.id);
  const filteredProjects = filterByStatus(customerProjects, statusFilter);

  return (
    <div>
      <PageHeader
        title={customer.name}
        breadcrumbs={[{ label: "Customers", to: "/customers" }, { label: customer.name }]}
      >
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <StatusBadge status={customer.status} />
          <span>
            <span className="font-medium text-surface-foreground">{activeCount}</span> active project{activeCount === 1 ? "" : "s"}
          </span>
          <span>
            <span className="font-medium text-surface-foreground">{customerProjects.length}</span> total project{customerProjects.length === 1 ? "" : "s"}
          </span>
        </div>
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <StatusFilterTabs value={statusFilter} onChange={setStatusFilter} />
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          New Project for Customer
        </button>
      </div>

      {customerProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects for this customer yet"
          description="Create the first project for this customer to get started."
          action={
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              <Plus className="h-4 w-4" />
              New Project for Customer
            </button>
          }
        />
      ) : filteredProjects.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects match this filter" description="Switch filters to see this customer's other projects." />
      ) : (
        <CustomerProjectTable projects={filteredProjects} phases={phases} />
      )}

      {isCreateOpen ? (
        <ProjectFormModal
          initialCustomerId={customer.id}
          onClose={() => setIsCreateOpen(false)}
          onCreated={(projectId) => navigate(`/projects/${projectId}`)}
        />
      ) : null}
    </div>
  );
}
