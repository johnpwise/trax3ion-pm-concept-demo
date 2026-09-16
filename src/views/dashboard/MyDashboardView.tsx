import { CalendarClock, CheckCircle2, Clock, FolderKanban } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import PageHeader from "../../app/PageHeader";
import { useAuthStore } from "../../store/authStore";
import { getMyActionsNeedingAttention, getMyProjects, getMyUpcomingBookings, getMyWeekUtilisation } from "../../store/selectors/myDashboardSelectors";
import { useTraxionDemoStore } from "../../store/useTraxionDemoStore";
import type { Action } from "../../types/domain";
import { formatEventTime, getStartOfWeek } from "../scheduler/calendar-utils";
import LogTimeModal from "./components/LogTimeModal";
import UtilisationRing from "./components/UtilisationRing";

function formatRelativeDay(date: Date, now: Date): string {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(date) - startOfDay(now)) / (1000 * 60 * 60 * 24));

  const weekday = date.toLocaleDateString("en-GB", { weekday: "short" });
  const label = `${weekday} ${date.getDate()} ${date.toLocaleDateString("en-GB", { month: "short" })}`;

  if (diffDays === 0) return `${label} · Today`;
  if (diffDays === 1) return `${label} · Tomorrow`;
  return label;
}

export default function MyDashboardView() {
  const [isLogTimeModalOpen, setIsLogTimeModalOpen] = useState(false);
  const currentUser = useAuthStore((state) => state.currentUser);
  const projects = useTraxionDemoStore((state) => state.projects);
  const customers = useTraxionDemoStore((state) => state.customers);
  const phases = useTraxionDemoStore((state) => state.phases);
  const tasks = useTraxionDemoStore((state) => state.tasks);
  const actions = useTraxionDemoStore((state) => state.actions);
  const calendarEvents = useTraxionDemoStore((state) => state.calendarEvents);
  const timeEntries = useTraxionDemoStore((state) => state.timeEntries);

  const resourceId = currentUser?.resourceId;

  if (!resourceId) {
    return (
      <div>
        <PageHeader title="My Dashboard" description="What's yours, this week." />
        <p className="text-sm text-muted-foreground">No Resource is linked to your account, so there's nothing to show here yet.</p>
      </div>
    );
  }

  const now = new Date();
  const weekStart = getStartOfWeek(now);

  const myProjects = getMyProjects(resourceId, actions, tasks, phases, projects, customers, calendarEvents);
  const upcomingBookings = getMyUpcomingBookings(resourceId, calendarEvents, now).slice(0, 4);
  const actionsNeedingAttention = getMyActionsNeedingAttention(resourceId, actions, timeEntries, now);
  const utilisation = getMyWeekUtilisation(resourceId, actions, calendarEvents, timeEntries, weekStart);

  const projectNameForAction = (action: Action): string => {
    const task = tasks.find((item) => item.id === action.taskId);
    const phase = task ? phases.find((item) => item.id === task.phaseId) : undefined;
    const project = phase ? projects.find((item) => item.id === phase.projectId) : undefined;
    return project?.name ?? "Unknown project";
  };

  const projectIdForAction = (action: Action): string | undefined => {
    const task = tasks.find((item) => item.id === action.taskId);
    const phase = task ? phases.find((item) => item.id === task.phaseId) : undefined;
    return phase?.projectId;
  };

  return (
    <div>
      <PageHeader title="My Dashboard" description="What's yours, this week." />

      <button
        type="button"
        onClick={() => setIsLogTimeModalOpen(true)}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-primary-line bg-primary/10 px-5 py-4 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-primary/20"
      >
        <Clock className="h-4 w-4" />
        Log Time
      </button>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,280px)_1fr]">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-5 text-center shadow-sm">
          <p className="text-sm font-medium text-surface-foreground">This Week at a Glance</p>
          <UtilisationRing percent={utilisation.percent} size={104} />
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-surface-foreground">{utilisation.bookedHours}h</span> booked of a {utilisation.availableHours}h week
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium text-surface-foreground">My Projects</p>
          </div>
          {myProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">You're not currently assigned to any project.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {myProjects.map(({ project, customerName, assignedActionCount, bookingOnly }) => (
                <div key={project.id} className="flex flex-col gap-1.5 rounded-lg border border-border p-3">
                  <p className="text-sm font-medium text-surface-foreground">{project.name}</p>
                  <p className="text-xs text-muted-foreground">{customerName}</p>
                  {bookingOnly ? (
                    <span className="mt-1 inline-flex w-fit items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      Bookings only
                    </span>
                  ) : (
                    <span className="mt-1 inline-flex w-fit items-center rounded-full border border-primary-line bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                      {assignedActionCount} action{assignedActionCount === 1 ? "" : "s"} assigned
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium text-surface-foreground">My Upcoming Bookings</p>
          </div>
          {upcomingBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing booked on your calendar right now.</p>
          ) : (
            <div>
              {upcomingBookings.map((event) => (
                <div
                  key={event.id}
                  className="grid grid-cols-[minmax(0,auto)_1fr] items-center gap-x-4 gap-y-1 border-b border-border py-2.5 text-sm last:border-b-0 sm:grid-cols-[11.5rem_6rem_1fr]"
                >
                  <span className="font-medium text-surface-foreground">{formatRelativeDay(new Date(event.start), now)}</span>
                  <span className="tabular-nums text-muted-foreground">{formatEventTime(event.start, event.end)}</span>
                  <span className="col-span-2 truncate text-surface-foreground sm:col-span-1">{event.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium text-surface-foreground">My Actions Needing Attention</p>
          </div>
          {actionsNeedingAttention.length === 0 ? (
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm text-muted-foreground">Nothing overdue right now — actual hours are all caught up.</p>
            </div>
          ) : (
            <div>
              {actionsNeedingAttention.map((action) => {
                const projectId = projectIdForAction(action);
                return (
                  <Link
                    key={action.id}
                    to={projectId ? `/projects/${projectId}` : "#"}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-2.5 text-sm transition-colors last:border-b-0 hover:bg-muted"
                  >
                    <span className="font-medium text-surface-foreground">{action.name}</span>
                    <span className="text-muted-foreground">{projectNameForAction(action)}</span>
                    <span className="text-xs text-muted-foreground">Scheduled {action.scheduledDate} — no actual hours logged</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {isLogTimeModalOpen ? <LogTimeModal onClose={() => setIsLogTimeModalOpen(false)} /> : null}
    </div>
  );
}
