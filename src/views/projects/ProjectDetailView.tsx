import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import PageHeader from "../../app/PageHeader";
import EmptyState from "../../components/common/EmptyState";
import HoursSummary from "../../components/common/HoursSummary";
import { StatusBadge } from "../../components/common/StatusBadge";
import { useToastStore } from "../../components/common/toastStore";
import { useCanEdit } from "../../store/authStore";
import { getProjectAllocatedHours } from "../../store/selectors/projectSelectors";
import { getProvisionalBookingsForProject } from "../../store/selectors/schedulerSelectors";
import { useTraxionDemoStore } from "../../store/useTraxionDemoStore";
import { FolderX } from "lucide-react";
import ActionDetailModal from "./components/ActionDetailModal";
import ActionFormModal from "./components/ActionFormModal";
import HierarchyTree from "./components/HierarchyTree";
import PhaseFormModal from "./components/PhaseFormModal";
import TaskFormModal from "./components/TaskFormModal";

type ActiveModal =
  | { kind: "phase" }
  | { kind: "task"; phaseId: string }
  | { kind: "action"; taskId: string }
  | { kind: "actionDetail"; actionId: string }
  | null;

export default function ProjectDetailView() {
  const { projectId = "" } = useParams();
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const canEdit = useCanEdit();

  const project = useTraxionDemoStore((state) => state.projects.find((item) => item.id === projectId));
  const customer = useTraxionDemoStore((state) => (project ? state.getCustomerById(project.customerId) : undefined));
  const phases = useTraxionDemoStore((state) => state.phases);
  const calendarEvents = useTraxionDemoStore((state) => state.calendarEvents);
  const updateProject = useTraxionDemoStore((state) => state.updateProject);
  const publishBookingsForProject = useTraxionDemoStore((state) => state.publishBookingsForProject);
  const showToast = useToastStore((state) => state.showToast);

  if (!project) {
    return (
      <EmptyState
        icon={FolderX}
        title="Project not found"
        description="This project may have been removed by a demo reset."
        action={
          <Link to="/projects" className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover">
            Back to Projects
          </Link>
        }
      />
    );
  }

  const allocated = getProjectAllocatedHours(phases, project.id);
  const provisionalBookings = getProvisionalBookingsForProject(calendarEvents, project.id);

  const handleToggleStatus = (): void => {
    const nextStatus = project.status === "active" ? "inactive" : "active";
    const result = updateProject(project.id, { status: nextStatus });
    if (result.ok) {
      showToast(`${project.name} marked ${nextStatus}.`);
    }
  };

  const handlePublish = (): void => {
    const count = provisionalBookings.length;
    publishBookingsForProject(project.id);
    showToast(`Published ${count} scheduling change${count === 1 ? "" : "s"}.`);
  };

  return (
    <div>
      <PageHeader
        title={project.name}
        breadcrumbs={[
          { label: "Projects", to: "/projects" },
          { label: customer?.name ?? "Customer", to: customer ? `/customers/${customer.id}` : undefined },
          { label: project.name },
        ]}
        actions={
          canEdit ? (
            <button
              type="button"
              onClick={handleToggleStatus}
              className="rounded-md border border-border px-3 py-2 text-sm font-medium text-surface-foreground transition-colors hover:bg-muted"
            >
              Mark {project.status === "active" ? "Inactive" : "Active"}
            </button>
          ) : undefined
        }
      >
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <StatusBadge status={project.status} />
          {project.code ? <span className="text-sm text-muted-foreground">{project.code}</span> : null}
        </div>
        {project.description ? <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{project.description}</p> : null}

        <div className="mt-5 rounded-xl border border-border bg-surface p-5 shadow-sm">
          <HoursSummary estimatedHours={project.estimatedHours} allocatedHours={allocated} />
        </div>
      </PageHeader>

      {provisionalBookings.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
            {provisionalBookings.length} scheduling change{provisionalBookings.length === 1 ? "" : "s"} pending publish
          </p>
          {canEdit ? (
            <button
              type="button"
              onClick={handlePublish}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Publish changes
            </button>
          ) : null}
        </div>
      ) : null}

      <HierarchyTree
        projectId={project.id}
        canEdit={canEdit}
        onAddPhase={() => setActiveModal({ kind: "phase" })}
        onAddTask={(phaseId) => setActiveModal({ kind: "task", phaseId })}
        onAddAction={(taskId) => setActiveModal({ kind: "action", taskId })}
        onViewAction={(actionId) => setActiveModal({ kind: "actionDetail", actionId })}
      />

      {activeModal?.kind === "phase" ? <PhaseFormModal projectId={project.id} onClose={() => setActiveModal(null)} /> : null}
      {activeModal?.kind === "task" ? <TaskFormModal phaseId={activeModal.phaseId} onClose={() => setActiveModal(null)} /> : null}
      {activeModal?.kind === "action" ? <ActionFormModal taskId={activeModal.taskId} onClose={() => setActiveModal(null)} /> : null}
      {activeModal?.kind === "actionDetail" ? <ActionDetailModal actionId={activeModal.actionId} onClose={() => setActiveModal(null)} /> : null}
    </div>
  );
}
