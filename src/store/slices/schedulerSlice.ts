import type { StateCreator } from "zustand";

import type { CalendarEvent, Resource } from "../../types/domain";
import { computeBookingWindow } from "../../views/scheduler/availability";
import { addDays, getStartOfWeek } from "../../views/scheduler/calendar-utils";
import type { DemoStore } from "../useTraxionDemoStore";

export type SchedulerSlice = {
  resources: Resource[];
  calendarEvents: CalendarEvent[];
  selectedResourceIds: string[];
  visibleWeekStart: string;

  toggleResource: (resourceId: string) => void;
  setSelectedResources: (resourceIds: string[]) => void;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  goToCurrentWeek: () => void;
  selectWeek: (weekStartIso: string) => void;

  syncActionBooking: (actionId: string) => void;
  publishBookingsForProject: (projectId: string) => void;
  discardBooking: (eventId: string) => void;
};

export const createSchedulerSlice: StateCreator<DemoStore, [], [], SchedulerSlice> = (set, get) => ({
  resources: [],
  calendarEvents: [],
  selectedResourceIds: [],
  visibleWeekStart: getStartOfWeek(new Date()).toISOString(),

  toggleResource: (resourceId) => {
    set((state) => ({
      selectedResourceIds: state.selectedResourceIds.includes(resourceId)
        ? state.selectedResourceIds.filter((id) => id !== resourceId)
        : [...state.selectedResourceIds, resourceId],
    }));
  },

  setSelectedResources: (resourceIds) => set({ selectedResourceIds: resourceIds }),

  goToPreviousWeek: () => {
    set((state) => ({ visibleWeekStart: addDays(new Date(state.visibleWeekStart), -7).toISOString() }));
  },

  goToNextWeek: () => {
    set((state) => ({ visibleWeekStart: addDays(new Date(state.visibleWeekStart), 7).toISOString() }));
  },

  goToCurrentWeek: () => set({ visibleWeekStart: getStartOfWeek(new Date()).toISOString() }),

  selectWeek: (weekStartIso) => set({ visibleWeekStart: weekStartIso }),

  syncActionBooking: (actionId) => {
    const state = get();
    const action = state.actions.find((item) => item.id === actionId);
    const existing = state.calendarEvents.find((event) => event.source === "trax3ion" && event.actionId === actionId);

    if (!action || !action.resourceId || !action.scheduledDate || !action.scheduledTime) {
      if (existing && existing.status === "provisional") {
        set((s) => ({ calendarEvents: s.calendarEvents.filter((event) => event.id !== existing.id) }));
      }
      return;
    }

    const task = state.tasks.find((item) => item.id === action.taskId);
    const phase = task ? state.phases.find((item) => item.id === task.phaseId) : undefined;
    const project = phase ? state.projects.find((item) => item.id === phase.projectId) : undefined;

    const { start, end } = computeBookingWindow(action.scheduledDate, action.scheduledTime, action.estimatedHours);

    if (existing) {
      set((s) => ({
        calendarEvents: s.calendarEvents.map((event) =>
          event.id === existing.id
            ? {
                ...event,
                resourceId: action.resourceId!,
                title: action.name,
                start,
                end,
                status: "provisional",
                customerId: project?.customerId,
                projectId: project?.id,
              }
            : event,
        ),
      }));
      return;
    }

    const newEvent: CalendarEvent = {
      id: crypto.randomUUID(),
      resourceId: action.resourceId,
      title: action.name,
      start,
      end,
      source: "trax3ion",
      status: "provisional",
      customerId: project?.customerId,
      projectId: project?.id,
      actionId,
    };
    set((s) => ({ calendarEvents: [...s.calendarEvents, newEvent] }));
  },

  publishBookingsForProject: (projectId) => {
    set((s) => ({
      calendarEvents: s.calendarEvents.map((event) =>
        event.status === "provisional" && event.projectId === projectId ? { ...event, status: "published" } : event,
      ),
    }));
  },

  discardBooking: (eventId) => {
    const event = get().calendarEvents.find((item) => item.id === eventId);
    if (!event || event.status !== "provisional") return;

    set((s) => ({ calendarEvents: s.calendarEvents.filter((item) => item.id !== eventId) }));

    if (event.actionId) {
      get().updateAction(event.actionId, { scheduledDate: undefined, scheduledTime: undefined });
    }
  },
});
