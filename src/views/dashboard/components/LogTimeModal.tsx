import { type FormEvent, useMemo, useState } from "react";

import FormField, { inputClassName } from "../../../components/common/FormField";
import Modal from "../../../components/common/Modal";
import { useToastStore } from "../../../components/common/toastStore";
import { useAuthStore } from "../../../store/authStore";
import { useTraxionDemoStore } from "../../../store/useTraxionDemoStore";
import type { Action, Customer, Phase, Project, Task } from "../../../types/domain";

type LogTimeModalProps = {
  onClose: () => void;
};

type QuickPick = { label: string; hours: number; minutes: number };

const QUICK_PICKS: QuickPick[] = [
  { label: "2h", hours: 2, minutes: 0 },
  { label: "1h", hours: 1, minutes: 0 },
  { label: "45m", hours: 0, minutes: 45 },
  { label: "30m", hours: 0, minutes: 30 },
  { label: "15m", hours: 0, minutes: 15 },
];

type Lookups = {
  myActions: Action[];
  taskById: Map<string, Task>;
  phaseById: Map<string, Phase>;
  projectById: Map<string, Project>;
};

/** Projects a resource can log time against: those with at least one Action assigned to them, under the given Customer. */
function getProjectOptions(lookups: Lookups, allProjects: Project[], customerId: string): Project[] {
  const projectIds = new Set<string>();
  for (const action of lookups.myActions) {
    const task = lookups.taskById.get(action.taskId);
    const phase = task ? lookups.phaseById.get(task.phaseId) : undefined;
    const project = phase ? lookups.projectById.get(phase.projectId) : undefined;
    if (project && project.customerId === customerId) projectIds.add(project.id);
  }
  return allProjects.filter((project) => projectIds.has(project.id)).sort((a, b) => a.name.localeCompare(b.name));
}

/** Tasks a resource can log time against: those with at least one Action assigned to them, under the given Project. */
function getTaskOptions(lookups: Lookups, allTasks: Task[], projectId: string): Task[] {
  const taskIds = new Set<string>();
  for (const action of lookups.myActions) {
    const task = lookups.taskById.get(action.taskId);
    const phase = task ? lookups.phaseById.get(task.phaseId) : undefined;
    if (task && phase?.projectId === projectId) taskIds.add(task.id);
  }
  return allTasks.filter((task) => taskIds.has(task.id)).sort((a, b) => a.sortOrder - b.sortOrder);
}

function getActionOptions(lookups: Lookups, taskId: string): Action[] {
  return lookups.myActions.filter((action) => action.taskId === taskId).sort((a, b) => a.sortOrder - b.sortOrder);
}

export default function LogTimeModal({ onClose }: LogTimeModalProps) {
  const currentUser = useAuthStore((state) => state.currentUser);
  const resourceId = currentUser?.resourceId;

  const customers = useTraxionDemoStore((state) => state.customers);
  const projects = useTraxionDemoStore((state) => state.projects);
  const phases = useTraxionDemoStore((state) => state.phases);
  const tasks = useTraxionDemoStore((state) => state.tasks);
  const actions = useTraxionDemoStore((state) => state.actions);
  const updateAction = useTraxionDemoStore((state) => state.updateAction);
  const showToast = useToastStore((state) => state.showToast);

  const lookups: Lookups = useMemo(
    () => ({
      myActions: actions.filter((action) => action.resourceId === resourceId),
      taskById: new Map(tasks.map((task) => [task.id, task])),
      phaseById: new Map(phases.map((phase) => [phase.id, phase])),
      projectById: new Map(projects.map((project) => [project.id, project])),
    }),
    [actions, resourceId, tasks, phases, projects],
  );

  const customerOptions: Customer[] = useMemo(() => {
    const customerIds = new Set<string>();
    for (const action of lookups.myActions) {
      const task = lookups.taskById.get(action.taskId);
      const phase = task ? lookups.phaseById.get(task.phaseId) : undefined;
      const project = phase ? lookups.projectById.get(phase.projectId) : undefined;
      if (project) customerIds.add(project.customerId);
    }
    return customers.filter((customer) => customerIds.has(customer.id)).sort((a, b) => a.name.localeCompare(b.name));
  }, [lookups, customers]);

  const [selectedCustomerId, setSelectedCustomerId] = useState(() => customerOptions[0]?.id ?? "");
  const [selectedProjectId, setSelectedProjectId] = useState(() => getProjectOptions(lookups, projects, selectedCustomerId)[0]?.id ?? "");
  const [selectedTaskId, setSelectedTaskId] = useState(() => getTaskOptions(lookups, tasks, selectedProjectId)[0]?.id ?? "");
  const [selectedActionId, setSelectedActionId] = useState(() => getActionOptions(lookups, selectedTaskId)[0]?.id ?? "");

  const projectOptions = useMemo(() => getProjectOptions(lookups, projects, selectedCustomerId), [lookups, projects, selectedCustomerId]);
  const taskOptions = useMemo(() => getTaskOptions(lookups, tasks, selectedProjectId), [lookups, tasks, selectedProjectId]);
  const actionOptions = useMemo(() => getActionOptions(lookups, selectedTaskId), [lookups, selectedTaskId]);

  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | undefined>();
  const [lastLog, setLastLog] = useState<{
    actionId: string;
    actionName: string;
    hours: number;
    minutes: number;
    previousActualHours?: number;
    previousWorkNotes?: string;
  } | null>(null);

  const handleCustomerChange = (customerId: string): void => {
    setSelectedCustomerId(customerId);
    const nextProjectId = getProjectOptions(lookups, projects, customerId)[0]?.id ?? "";
    setSelectedProjectId(nextProjectId);
    const nextTaskId = getTaskOptions(lookups, tasks, nextProjectId)[0]?.id ?? "";
    setSelectedTaskId(nextTaskId);
    setSelectedActionId(getActionOptions(lookups, nextTaskId)[0]?.id ?? "");
  };

  const handleProjectChange = (projectId: string): void => {
    setSelectedProjectId(projectId);
    const nextTaskId = getTaskOptions(lookups, tasks, projectId)[0]?.id ?? "";
    setSelectedTaskId(nextTaskId);
    setSelectedActionId(getActionOptions(lookups, nextTaskId)[0]?.id ?? "");
  };

  const handleTaskChange = (taskId: string): void => {
    setSelectedTaskId(taskId);
    setSelectedActionId(getActionOptions(lookups, taskId)[0]?.id ?? "");
  };

  const applyQuickPick = (pick: QuickPick): void => {
    setHours(pick.hours);
    setMinutes(pick.minutes);
  };

  const totalHours = hours + minutes / 60;
  const selectedAction = actionOptions.find((action) => action.id === selectedActionId);
  const selectedTask = selectedTaskId ? lookups.taskById.get(selectedTaskId) : undefined;

  const resetTimeFields = (): void => {
    setHours(0);
    setMinutes(0);
    setDescription("");
  };

  const submitLog = (): boolean => {
    setFormError(undefined);

    if (!selectedActionId) {
      setFormError("Select an Action to log time against.");
      return false;
    }
    if (totalHours <= 0) {
      setFormError("Enter a time greater than zero.");
      return false;
    }

    const previousActualHours = selectedAction?.actualHours;
    const previousWorkNotes = selectedAction?.workNotes;
    const currentActualHours = previousActualHours ?? 0;
    const trimmedDescription = description.trim();
    const entry = `[${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}] ${hours}h ${minutes}m — ${trimmedDescription}`;
    const nextWorkNotes = trimmedDescription ? [previousWorkNotes, entry].filter(Boolean).join("\n") : previousWorkNotes;

    const result = updateAction(selectedActionId, {
      actualHours: Math.round((currentActualHours + totalHours) * 4) / 4,
      workNotes: nextWorkNotes,
    });

    if (!result.ok) {
      setFormError(result.error);
      return false;
    }

    showToast(`Logged ${hours}h ${minutes}m against "${selectedAction?.name}".`);
    setLastLog({ actionId: selectedActionId, actionName: selectedAction?.name ?? "", hours, minutes, previousActualHours, previousWorkNotes });
    return true;
  };

  const handleUndoLastEntry = (): void => {
    if (!lastLog) return;

    const result = updateAction(lastLog.actionId, {
      actualHours: lastLog.previousActualHours,
      workNotes: lastLog.previousWorkNotes,
    });

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    showToast(`Undid the last time log (${lastLog.hours}h ${lastLog.minutes}m) for "${lastLog.actionName}".`);
    setLastLog(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (submitLog()) onClose();
  };

  const handleSaveAndLogAnother = (): void => {
    if (submitLog()) resetTimeFields();
  };

  if (customerOptions.length === 0) {
    return (
      <Modal title="Log Time" onClose={onClose}>
        <p className="text-sm text-muted-foreground">You don't have any Actions assigned to you yet, so there's nothing to log time against.</p>
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={onClose} className="rounded-md border border-border px-3 py-2 text-sm font-medium text-surface-foreground transition-colors hover:bg-muted">
            Close
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Log Time" description="Record actual time against one of your assigned Actions." onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <FormField label="Customer" htmlFor="log-time-customer">
          <select
            id="log-time-customer"
            value={selectedCustomerId}
            onChange={(event) => handleCustomerChange(event.target.value)}
            className={inputClassName}
          >
            {customerOptions.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Project" htmlFor="log-time-project">
          <select
            id="log-time-project"
            value={selectedProjectId}
            onChange={(event) => handleProjectChange(event.target.value)}
            className={inputClassName}
          >
            {projectOptions.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Task" htmlFor="log-time-task">
          <select id="log-time-task" value={selectedTaskId} onChange={(event) => handleTaskChange(event.target.value)} className={inputClassName}>
            {taskOptions.map((task) => (
              <option key={task.id} value={task.id}>
                {task.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Action" htmlFor="log-time-action">
          <select
            id="log-time-action"
            value={selectedActionId}
            onChange={(event) => setSelectedActionId(event.target.value)}
            className={inputClassName}
          >
            {actionOptions.map((action) => (
              <option key={action.id} value={action.id}>
                {action.name} ({action.actualHours ?? 0}h / {action.estimatedHours}h)
              </option>
            ))}
          </select>
        </FormField>

        {selectedTask ? <p className="-mt-2 mb-4 text-xs text-muted-foreground">Under task "{selectedTask.name}".</p> : null}

        <div className="mb-2 grid grid-cols-2 gap-4">
          <FormField label="Hours" htmlFor="log-time-hours">
            <input
              id="log-time-hours"
              type="number"
              min={0}
              step={1}
              value={hours}
              onChange={(event) => setHours(Math.max(0, Number(event.target.value)))}
              className={inputClassName}
            />
          </FormField>
          <FormField label="Minutes" htmlFor="log-time-minutes">
            <select
              id="log-time-minutes"
              value={minutes}
              onChange={(event) => setMinutes(Number(event.target.value))}
              className={inputClassName}
            >
              <option value={0}>0</option>
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={45}>45</option>
            </select>
          </FormField>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {QUICK_PICKS.map((pick) => (
            <button
              key={pick.label}
              type="button"
              onClick={() => applyQuickPick(pick)}
              className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-surface-foreground transition-colors hover:bg-muted"
            >
              {pick.label}
            </button>
          ))}
        </div>

        <FormField label="Description" htmlFor="log-time-description" optional>
          <textarea
            id="log-time-description"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What did you work on?"
            className={inputClassName}
          />
        </FormField>

        {formError ? <p className="mb-4 text-sm text-destructive">{formError}</p> : null}

        {lastLog ? (
          <div className="mb-4 flex items-center justify-between gap-4 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs">
            <span className="text-muted-foreground">
              Just logged {lastLog.hours}h {lastLog.minutes}m against "{lastLog.actionName}".
            </span>
            <button type="button" onClick={handleUndoLastEntry} className="shrink-0 font-medium text-primary transition-colors hover:underline">
              Undo last entry
            </button>
          </div>
        ) : null}

        <div className="mt-2 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md border border-border px-3 py-2 text-sm font-medium text-surface-foreground transition-colors hover:bg-muted">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAndLogAnother}
            className="rounded-md border border-primary-line px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
          >
            Save &amp; log another
          </button>
          <button type="submit" className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover">
            Log time
          </button>
        </div>
      </form>
    </Modal>
  );
}
