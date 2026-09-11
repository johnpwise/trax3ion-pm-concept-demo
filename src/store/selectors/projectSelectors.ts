import type { Action, Phase, Project, StatusFilter, Task } from "../../types/domain";

export function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

export function filterByStatus<T extends { status: "active" | "inactive" }>(items: T[], filter: StatusFilter): T[] {
  if (filter === "all") return items;
  return items.filter((item) => item.status === filter);
}

// --- Hierarchy lookups -----------------------------------------------------

export function getProjectPhases(phases: Phase[], projectId: string): Phase[] {
  return phases.filter((phase) => phase.projectId === projectId).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getPhaseTasks(tasks: Task[], phaseId: string): Task[] {
  return tasks.filter((task) => task.phaseId === phaseId).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getTaskActions(actions: Action[], taskId: string): Action[] {
  return actions.filter((action) => action.taskId === taskId).sort((a, b) => a.sortOrder - b.sortOrder);
}

// --- Allocation totals -------------------------------------------------------

export function getProjectAllocatedHours(phases: Phase[], projectId: string): number {
  return getProjectPhases(phases, projectId).reduce((sum, phase) => sum + phase.estimatedHours, 0);
}

export function getProjectRemainingHours(project: Project, phases: Phase[]): number {
  return project.estimatedHours - getProjectAllocatedHours(phases, project.id);
}

export function getPhaseAllocatedHours(tasks: Task[], phaseId: string): number {
  return getPhaseTasks(tasks, phaseId).reduce((sum, task) => sum + task.estimatedHours, 0);
}

export function getPhaseRemainingHours(phase: Phase, tasks: Task[]): number {
  return phase.estimatedHours - getPhaseAllocatedHours(tasks, phase.id);
}

export function getTaskAllocatedHours(actions: Action[], taskId: string): number {
  return getTaskActions(actions, taskId).reduce((sum, action) => sum + action.estimatedHours, 0);
}

export function getTaskRemainingHours(task: Task, actions: Action[]): number {
  return task.estimatedHours - getTaskAllocatedHours(actions, task.id);
}

// --- Allocation validation ---------------------------------------------------
// When editing an existing child, its own current estimate is excluded from the
// parent's allocated total before validating the proposed new value.

export function canAllocatePhase(project: Project, phases: Phase[], hours: number, editingPhaseId?: string): boolean {
  const otherPhasesTotal = getProjectPhases(phases, project.id)
    .filter((phase) => phase.id !== editingPhaseId)
    .reduce((sum, phase) => sum + phase.estimatedHours, 0);

  return otherPhasesTotal + hours <= project.estimatedHours;
}

export function canAllocateTask(phase: Phase, tasks: Task[], hours: number, editingTaskId?: string): boolean {
  const otherTasksTotal = getPhaseTasks(tasks, phase.id)
    .filter((task) => task.id !== editingTaskId)
    .reduce((sum, task) => sum + task.estimatedHours, 0);

  return otherTasksTotal + hours <= phase.estimatedHours;
}

export function canAllocateAction(task: Task, actions: Action[], hours: number, editingActionId?: string): boolean {
  const otherActionsTotal = getTaskActions(actions, task.id)
    .filter((action) => action.id !== editingActionId)
    .reduce((sum, action) => sum + action.estimatedHours, 0);

  return otherActionsTotal + hours <= task.estimatedHours;
}

// --- Customer / project relationship ----------------------------------------

export function getProjectsForCustomer(projects: Project[], customerId: string): Project[] {
  return projects.filter((project) => project.customerId === customerId);
}

export function getActiveProjectCountForCustomer(projects: Project[], customerId: string): number {
  return getProjectsForCustomer(projects, customerId).filter((project) => project.status === "active").length;
}
