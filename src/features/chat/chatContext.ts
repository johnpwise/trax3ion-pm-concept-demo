import { useAuthStore } from "../../store/authStore";
import { getMyProjects } from "../../store/selectors/myDashboardSelectors";
import { useTraxionDemoStore } from "../../store/useTraxionDemoStore";
import { toLocalIsoLikeString } from "../../views/scheduler/calendar-utils";
import type { ChatContext } from "./chat.types";

export function buildChatContext(): ChatContext {
  const { customers, projects, phases, tasks, actions, resources, calendarEvents } = useTraxionDemoStore.getState();
  const currentUser = useAuthStore.getState().currentUser;

  // calendarEvents are persisted as UTC ISO strings. The assistant reads timestamps
  // literally rather than parsing timezone offsets, so convert to the user's local
  // wall-clock time here - the same conversion the scheduler UI applies when displaying
  // these events - instead of asking the model to do timezone math.
  const localCalendarEvents = calendarEvents.map((event) => ({
    ...event,
    start: toLocalIsoLikeString(event.start),
    end: toLocalIsoLikeString(event.end),
  }));

  const fullContext: ChatContext = { customers, projects, phases, tasks, actions, resources, calendarEvents: localCalendarEvents };

  // Project managers see the full practice-wide picture. Everyone else only gets data
  // for projects they're assigned to (same definition as the "My dashboard" view) plus
  // their own schedule, so the assistant can't surface other people's or other projects' data.
  if (currentUser?.role === "project-manager" || !currentUser?.resourceId) {
    return fullContext;
  }

  return scopeChatContextToResource(currentUser.resourceId, fullContext);
}

function scopeChatContextToResource(resourceId: string, context: ChatContext): ChatContext {
  const { customers, projects, phases, tasks, actions, resources, calendarEvents } = context;

  const myProjectIds = new Set(
    getMyProjects(resourceId, actions, tasks, phases, projects, customers, calendarEvents).map((summary) => summary.project.id),
  );

  const scopedProjects = projects.filter((project) => myProjectIds.has(project.id));
  const scopedCustomers = customers.filter((customer) => scopedProjects.some((project) => project.customerId === customer.id));

  const scopedPhases = phases.filter((phase) => myProjectIds.has(phase.projectId));
  const scopedPhaseIds = new Set(scopedPhases.map((phase) => phase.id));

  const scopedTasks = tasks.filter((task) => scopedPhaseIds.has(task.phaseId));
  const scopedTaskIds = new Set(scopedTasks.map((task) => task.id));

  const scopedActions = actions.filter((action) => scopedTaskIds.has(action.taskId));

  // Calendar events are personal schedule data - only the signed-in resource's own bookings, never anyone else's.
  const scopedCalendarEvents = calendarEvents.filter((event) => event.resourceId === resourceId);

  const involvedResourceIds = new Set(
    [resourceId, ...scopedActions.map((action) => action.resourceId)].filter((id): id is string => Boolean(id)),
  );
  const scopedResources = resources.filter((resource) => involvedResourceIds.has(resource.id));

  return {
    customers: scopedCustomers,
    projects: scopedProjects,
    phases: scopedPhases,
    tasks: scopedTasks,
    actions: scopedActions,
    resources: scopedResources,
    calendarEvents: scopedCalendarEvents,
  };
}
