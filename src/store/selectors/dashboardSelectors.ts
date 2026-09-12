import type { CalendarEvent, Customer, Phase, Project, Resource } from "../../types/domain";
import { getEventDurationHours } from "../../views/scheduler/calendar-utils";
import { getProjectRemainingHours } from "./projectSelectors";

export function getActiveProjectCount(projects: Project[]): number {
  return projects.filter((project) => project.status === "active").length;
}

export function getActiveCustomerCount(customers: Customer[]): number {
  return customers.filter((customer) => customer.status === "active").length;
}

export function getProjectsAtRiskCount(projects: Project[]): number {
  return projects.filter((project) => project.status === "active" && (project.riskStatus === "amber" || project.riskStatus === "red")).length;
}

export function getUpcomingBookingsCount(calendarEvents: CalendarEvent[], now: Date = new Date()): number {
  return calendarEvents.filter((event) => event.source === "trax3ion" && new Date(event.start) >= now).length;
}

export function getUnallocatedEstimateHours(projects: Project[], phases: Phase[]): number {
  return projects
    .filter((project) => project.status === "active")
    .reduce((sum, project) => sum + Math.max(0, getProjectRemainingHours(project, phases)), 0);
}

export function getResourceUtilisationPercent(resources: Resource[], calendarEvents: CalendarEvent[], weekStart: Date): number {
  const activeResources = resources.filter((resource) => resource.status === "active");
  if (activeResources.length === 0) return 0;

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 5);

  const activeResourceIds = new Set(activeResources.map((resource) => resource.id));
  const bookedHours = calendarEvents
    .filter((event) => activeResourceIds.has(event.resourceId))
    .filter((event) => {
      const start = new Date(event.start);
      return start >= weekStart && start < weekEnd;
    })
    .reduce((sum, event) => sum + getEventDurationHours(event.start, event.end), 0);

  const availableHours = activeResources.length * 5 * 8;
  return Math.min(100, Math.round((bookedHours / availableHours) * 100));
}
