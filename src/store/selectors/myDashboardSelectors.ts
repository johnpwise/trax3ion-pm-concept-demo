import type { Action, AdHocTimeEntry, CalendarEvent, Customer, Phase, Project, Task, TimeEntry } from "../../types/domain";
import { addDays, parseLocalDate } from "../../views/scheduler/calendar-utils";
import { getActionActualHours } from "./projectSelectors";

export type MyProjectSummary = {
  project: Project;
  customerName: string;
  assignedActionCount: number;
  bookingOnly: boolean;
};

/** Projects relevant to a resource: either they have an Action assigned under it, or a calendar booking against it. */
export function getMyProjects(
  resourceId: string,
  actions: Action[],
  tasks: Task[],
  phases: Phase[],
  projects: Project[],
  customers: Customer[],
  calendarEvents: CalendarEvent[],
): MyProjectSummary[] {
  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const phaseById = new Map(phases.map((phase) => [phase.id, phase]));
  const projectById = new Map(projects.map((project) => [project.id, project]));
  const customerById = new Map(customers.map((customer) => [customer.id, customer]));

  const actionCountByProjectId = new Map<string, number>();
  for (const action of actions) {
    if (action.resourceId !== resourceId) continue;
    const task = taskById.get(action.taskId);
    const phase = task ? phaseById.get(task.phaseId) : undefined;
    if (!phase) continue;
    actionCountByProjectId.set(phase.projectId, (actionCountByProjectId.get(phase.projectId) ?? 0) + 1);
  }

  const bookingProjectIds = new Set(
    calendarEvents
      .filter((event) => event.resourceId === resourceId && event.source === "trax3ion" && event.projectId)
      .map((event) => event.projectId as string),
  );

  const projectIds = new Set<string>([...actionCountByProjectId.keys(), ...bookingProjectIds]);

  return Array.from(projectIds)
    .map((projectId) => projectById.get(projectId))
    .filter((project): project is Project => Boolean(project))
    .map((project) => {
      const assignedActionCount = actionCountByProjectId.get(project.id) ?? 0;
      return {
        project,
        customerName: customerById.get(project.customerId)?.name ?? "Unknown customer",
        assignedActionCount,
        bookingOnly: assignedActionCount === 0,
      };
    })
    .sort((a, b) => a.project.name.localeCompare(b.project.name));
}

/** A resource's own Trax3ion bookings from `now` onward, nearest first. */
export function getMyUpcomingBookings(resourceId: string, calendarEvents: CalendarEvent[], now: Date = new Date()): CalendarEvent[] {
  return calendarEvents
    .filter((event) => event.resourceId === resourceId && event.source === "trax3ion" && new Date(event.end) >= now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

/** Actions assigned to a resource, scheduled for a day before today, with no actual hours logged yet. */
export function getMyActionsNeedingAttention(resourceId: string, actions: Action[], timeEntries: TimeEntry[], now: Date = new Date()): Action[] {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return actions.filter((action) => {
    if (action.resourceId !== resourceId) return false;
    if (getActionActualHours(timeEntries, action.id) > 0) return false;
    if (!action.scheduledDate) return false;
    return parseLocalDate(action.scheduledDate) < startOfToday;
  });
}

export type MyWeekUtilisation = {
  bookedHours: number;
  availableHours: number;
  percent: number;
};

/**
 * A single resource's current workload against a nominal 40h week (Mon-Fri, 8h/day).
 *
 * "Booked" combines two sources: non-Action calendar bookings that fall within `weekStart`'s Mon-Fri
 * window (e.g. Outlook meetings), and every Action assigned to the resource, in full, regardless of
 * whether or which week it's scheduled for. Actions are counted this way — rather than only when their
 * scheduled date lands in the current week — because a PM can assign an Action to a resource before
 * (or without ever) picking a specific date/time slot for it, and that commitment should still show up
 * as workload against the resource straight away.
 */
export function getMyWeekUtilisation(
  resourceId: string,
  actions: Action[],
  calendarEvents: CalendarEvent[],
  timeEntries: TimeEntry[],
  weekStart: Date,
): MyWeekUtilisation {
  const weekEnd = addDays(weekStart, 5);

  const bookedFromCalendar = calendarEvents
    .filter((event) => event.resourceId === resourceId && !event.actionId)
    .filter((event) => {
      const start = new Date(event.start);
      return start >= weekStart && start < weekEnd;
    })
    .reduce((sum, event) => sum + Math.max(0, (new Date(event.end).getTime() - new Date(event.start).getTime()) / (1000 * 60 * 60)), 0);

  const bookedFromAssignedActions = actions
    .filter((action) => action.resourceId === resourceId)
    .reduce((sum, action) => sum + (getActionActualHours(timeEntries, action.id) || (action.estimatedHours ?? 0)), 0);

  const bookedHours = bookedFromCalendar + bookedFromAssignedActions;

  const availableHours = 5 * 8;
  const percent = Math.min(100, Math.round((bookedHours / availableHours) * 100));

  return { bookedHours, availableHours, percent };
}

export type MyWeekBooking = {
  bookedHours: number;
  availableHours: number;
  percent: number;
};

/**
 * Hours booked onto a resource's calendar for a given week (Mon-Fri) — every calendar booking,
 * Action-linked or not, whose start falls in that window (`syncActionBooking` keeps an Action's
 * `scheduledDate`/`scheduledTime` mirrored onto a `CalendarEvent`, so this is the single source of
 * truth for "what's been scheduled"). Reflects what the resource is booked to work that week,
 * independent of whether that work has actually been logged yet — unlike `getMyWeekWorkSplit`.
 */
export function getMyWeekBooking(resourceId: string, calendarEvents: CalendarEvent[], weekStart: Date): MyWeekBooking {
  const weekEnd = addDays(weekStart, 5);

  const bookedHours = calendarEvents
    .filter((event) => event.resourceId === resourceId)
    .filter((event) => {
      const start = new Date(event.start);
      return start >= weekStart && start < weekEnd;
    })
    .reduce((sum, event) => sum + Math.max(0, (new Date(event.end).getTime() - new Date(event.start).getTime()) / (1000 * 60 * 60)), 0);

  const availableHours = 5 * 8;
  const percent = Math.min(100, Math.round((bookedHours / availableHours) * 100));

  return { bookedHours, availableHours, percent };
}

export type MyWeekWorkSplit = {
  projectHours: number;
  adHocHours: number;
  totalHours: number;
  projectPercent: number;
  adHocPercent: number;
};

function sumHoursInWeek<T extends { resourceId: string; workDate: string; durationHours: number }>(
  resourceId: string,
  entries: T[],
  weekStart: Date,
): number {
  const weekEnd = addDays(weekStart, 5);
  return entries
    .filter((entry) => entry.resourceId === resourceId)
    .filter((entry) => {
      const workDate = new Date(entry.workDate);
      return workDate >= weekStart && workDate < weekEnd;
    })
    .reduce((sum, entry) => sum + entry.durationHours, 0);
}

/**
 * A resource's current-week split between Project Action time (`TimeEntry`) and Ad-Hoc time
 * (`AdHocTimeEntry`), both filtered by `workDate` falling in `weekStart`'s Mon-Fri window.
 * Unlike `getMyWeekUtilisation`, this reflects hours actually logged this week, not assigned workload.
 */
export function getMyWeekWorkSplit(
  resourceId: string,
  timeEntries: TimeEntry[],
  adHocTimeEntries: AdHocTimeEntry[],
  weekStart: Date,
): MyWeekWorkSplit {
  const projectHours = sumHoursInWeek(resourceId, timeEntries, weekStart);
  const adHocHours = sumHoursInWeek(resourceId, adHocTimeEntries, weekStart);
  const totalHours = projectHours + adHocHours;
  const projectPercent = totalHours === 0 ? 0 : Math.round((projectHours / totalHours) * 100);
  const adHocPercent = totalHours === 0 ? 0 : 100 - projectPercent;

  return { projectHours, adHocHours, totalHours, projectPercent, adHocPercent };
}
