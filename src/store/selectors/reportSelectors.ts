import type { Action, CalendarEvent, Customer, Phase, Project, Resource, Task, TimeEntry, TimeType } from "../../types/domain";
import { getMyWeekUtilisation, type MyWeekUtilisation } from "./myDashboardSelectors";

/** One Time Entry joined out to the full hierarchy and reference data it belongs to, for the Finance time report (FR-022). */
export type TimeEntryReportRow = {
  entry: TimeEntry;
  customerName: string;
  projectName: string;
  phaseName: string;
  taskName: string;
  actionName: string;
  resourceName: string;
  timeType?: TimeType;
};

export type TimeEntryReportFilters = {
  from?: string;
  to?: string;
  customerId?: string;
  projectId?: string;
  resourceId?: string;
};

/** Joins every Time Entry out to Customer/Project/Phase/Task/Action names, the logging Resource, and its Time Type. */
export function getTimeEntryReportRows(
  timeEntries: TimeEntry[],
  actions: Action[],
  tasks: Task[],
  phases: Phase[],
  projects: Project[],
  customers: Customer[],
  resources: Resource[],
  timeTypes: TimeType[],
  filters: TimeEntryReportFilters = {},
): TimeEntryReportRow[] {
  const actionById = new Map(actions.map((action) => [action.id, action]));
  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const phaseById = new Map(phases.map((phase) => [phase.id, phase]));
  const projectById = new Map(projects.map((project) => [project.id, project]));
  const customerById = new Map(customers.map((customer) => [customer.id, customer]));
  const resourceById = new Map(resources.map((resource) => [resource.id, resource]));
  const timeTypeById = new Map(timeTypes.map((timeType) => [timeType.id, timeType]));

  return timeEntries
    .filter((entry) => (filters.from ? entry.workDate >= filters.from : true))
    .filter((entry) => (filters.to ? entry.workDate <= filters.to : true))
    .filter((entry) => (filters.resourceId ? entry.resourceId === filters.resourceId : true))
    .flatMap((entry) => {
      const action = actionById.get(entry.actionId);
      const task = action ? taskById.get(action.taskId) : undefined;
      const phase = task ? phaseById.get(task.phaseId) : undefined;
      const project = phase ? projectById.get(phase.projectId) : undefined;
      const customer = project ? customerById.get(project.customerId) : undefined;

      if (filters.projectId && project?.id !== filters.projectId) return [];
      if (filters.customerId && customer?.id !== filters.customerId) return [];

      const row: TimeEntryReportRow = {
        entry,
        customerName: customer?.name ?? "Unknown customer",
        projectName: project?.name ?? "Unknown project",
        phaseName: phase?.name ?? "Unknown phase",
        taskName: task?.name ?? "Unknown task",
        actionName: action?.name ?? "Unknown action",
        resourceName: resourceById.get(entry.resourceId)?.name ?? "Unknown resource",
        timeType: timeTypeById.get(entry.timeTypeId),
      };
      return [row];
    })
    .sort((a, b) => b.entry.workDate.localeCompare(a.entry.workDate));
}

export type ResourceUtilisationRow = {
  resource: Resource;
} & MyWeekUtilisation;

/** One row per active Resource, applying {@link getMyWeekUtilisation}'s per-resource calc across all of them for the Utilisation report (FR-023). */
export function getUtilisationReportRows(
  resources: Resource[],
  actions: Action[],
  calendarEvents: CalendarEvent[],
  timeEntries: TimeEntry[],
  weekStart: Date,
): ResourceUtilisationRow[] {
  return resources
    .filter((resource) => resource.status === "active")
    .map((resource) => ({
      resource,
      ...getMyWeekUtilisation(resource.id, actions, calendarEvents, timeEntries, weekStart),
    }))
    .sort((a, b) => a.resource.name.localeCompare(b.resource.name));
}
