import { CalendarClock, CheckCircle2, ChevronLeft, ChevronRight, Clock, FolderKanban, PieChart } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import PageHeader from "../../app/PageHeader";
import { useAuthStore } from "../../store/authStore";
import {
  getMyActionsNeedingAttention,
  getMyProjects,
  getMyUpcomingBookings,
  getMyWeekBooking,
  getMyWeekWorkSplit,
} from "../../store/selectors/myDashboardSelectors";
import { useTraxionDemoStore } from "../../store/useTraxionDemoStore";
import type { Action } from "../../types/domain";
import { addDays, addWeeks, formatEventTime, getStartOfWeek } from "../scheduler/calendar-utils";
import LogTimeModal from "./components/LogTimeModal";
import UtilisationRing from "./components/UtilisationRing";
import WorkSplitDonut from "./components/WorkSplitDonut";

function formatRelativeDay(date: Date, now: Date): string {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(date) - startOfDay(now)) / (1000 * 60 * 60 * 24));

  const weekday = date.toLocaleDateString("en-GB", { weekday: "short" });
  const label = `${weekday} ${date.getDate()} ${date.toLocaleDateString("en-GB", { month: "short" })}`;

  if (diffDays === 0) return `${label} · Today`;
  if (diffDays === 1) return `${label} · Tomorrow`;
  return label;
}

function formatWeekRange(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 4);
  const startMonth = weekStart.toLocaleDateString("en-GB", { month: "short" });
  const endMonth = weekEnd.toLocaleDateString("en-GB", { month: "short" });
  const startLabel = `${weekStart.getDate()}${startMonth === endMonth ? "" : ` ${startMonth}`}`;
  return `${startLabel} – ${weekEnd.getDate()} ${endMonth}`;
}

function getWeekRelativeLabel(weekOffset: number): string | undefined {
  if (weekOffset === 0) return "This week";
  if (weekOffset === 1) return "Next week";
  if (weekOffset === -1) return "Last week";
  return undefined;
}

export default function MyDashboardView() {
  const [isLogTimeModalOpen, setIsLogTimeModalOpen] = useState(false);
  const [workSplitMode, setWorkSplitMode] = useState<"percent" | "hours">("percent");
  const [weekOffset, setWeekOffset] = useState(0);
  const currentUser = useAuthStore((state) => state.currentUser);
  const projects = useTraxionDemoStore((state) => state.projects);
  const customers = useTraxionDemoStore((state) => state.customers);
  const phases = useTraxionDemoStore((state) => state.phases);
  const tasks = useTraxionDemoStore((state) => state.tasks);
  const actions = useTraxionDemoStore((state) => state.actions);
  const calendarEvents = useTraxionDemoStore((state) => state.calendarEvents);
  const timeEntries = useTraxionDemoStore((state) => state.timeEntries);
  const adHocTimeEntries = useTraxionDemoStore((state) => state.adHocTimeEntries);

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
  const weekStart = addWeeks(getStartOfWeek(now), weekOffset);
  const weekRelativeLabel = getWeekRelativeLabel(weekOffset);
  const weekRangeLabel = formatWeekRange(weekStart);

  const myProjects = getMyProjects(resourceId, actions, tasks, phases, projects, customers, calendarEvents);
  const upcomingBookings = getMyUpcomingBookings(resourceId, calendarEvents, now).slice(0, 4);
  const actionsNeedingAttention = getMyActionsNeedingAttention(resourceId, actions, timeEntries, now);
  const booking = getMyWeekBooking(resourceId, calendarEvents, weekStart);
  const workSplit = getMyWeekWorkSplit(resourceId, timeEntries, adHocTimeEntries, weekStart);

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
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface px-2 py-2 shadow-sm">
            <button
              type="button"
              onClick={() => setWeekOffset((offset) => offset - 1)}
              aria-label="Previous week"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-surface-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center">
              <span className="text-sm font-medium text-surface-foreground">{weekRelativeLabel ?? weekRangeLabel}</span>
              {weekRelativeLabel ? (
                <button
                  type="button"
                  onClick={() => setWeekOffset(0)}
                  disabled={weekOffset === 0}
                  className="text-xs text-muted-foreground enabled:text-primary enabled:hover:underline"
                >
                  {weekRangeLabel}
                </button>
              ) : (
                <button type="button" onClick={() => setWeekOffset(0)} className="text-xs text-primary hover:underline">
                  Jump to this week
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setWeekOffset((offset) => offset + 1)}
              aria-label="Next week"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-surface-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-5 text-center shadow-sm">
            <p className="text-sm font-medium text-surface-foreground">This Week at a Glance</p>
            <UtilisationRing percent={booking.percent} size={104} />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-surface-foreground">{booking.bookedHours}h</span> booked of a {booking.availableHours}h week
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-surface-foreground">This Week's Work Split</p>
              </div>
            </div>

            <div className="mb-3 inline-flex rounded-lg border border-border bg-muted/40 p-1" role="tablist" aria-label="Work split view">
              {(
                [
                  { value: "percent", label: "%" },
                  { value: "hours", label: "Hours" },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="tab"
                  aria-selected={workSplitMode === option.value}
                  onClick={() => setWorkSplitMode(option.value)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    workSplitMode === option.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-surface-foreground"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="flex justify-center">
              <WorkSplitDonut
                projectHours={workSplit.projectHours}
                adHocHours={workSplit.adHocHours}
                projectPercent={workSplit.projectPercent}
                adHocPercent={workSplit.adHocPercent}
                mode={workSplitMode}
                size={104}
              />
            </div>
          </div>
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
