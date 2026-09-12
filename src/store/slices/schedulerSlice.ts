import type { StateCreator } from "zustand";

import type { CalendarEvent, Resource } from "../../types/domain";
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
};

export const createSchedulerSlice: StateCreator<DemoStore, [], [], SchedulerSlice> = (set) => ({
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
});
