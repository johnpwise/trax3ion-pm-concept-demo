import type { StateCreator } from "zustand";

import type { TimeEntry, TimeType } from "../../types/domain";
import { isNonNegativeQuarterHour } from "../selectors/projectSelectors";
import type { DemoStore } from "../useTraxionDemoStore";
import type { MutationResult, UpdateResult } from "./types";

export type TimeEntrySlice = {
  timeTypes: TimeType[];
  timeEntries: TimeEntry[];

  createTimeEntry: (input: {
    actionId: string;
    resourceId: string;
    workDate: string;
    durationHours: number;
    description?: string;
    timeTypeId: string;
    scheduleBookingId?: string;
    createdBy: string;
  }) => MutationResult;
  deleteTimeEntry: (id: string) => UpdateResult;
};

export const createTimeEntrySlice: StateCreator<DemoStore, [], [], TimeEntrySlice> = (set, get) => ({
  timeTypes: [],
  timeEntries: [],

  createTimeEntry: (input) => {
    const action = get().actions.find((item) => item.id === input.actionId);
    if (!action) {
      return { ok: false, error: "Action not found." };
    }
    if (!get().timeTypes.some((timeType) => timeType.id === input.timeTypeId)) {
      return { ok: false, error: "Time Type not found." };
    }
    if (!isNonNegativeQuarterHour(input.durationHours) || input.durationHours <= 0) {
      return { ok: false, error: "Duration must be greater than zero, in 15-minute (0.25h) increments." };
    }

    const timeEntry: TimeEntry = {
      id: crypto.randomUUID(),
      actionId: input.actionId,
      resourceId: input.resourceId,
      workDate: input.workDate,
      durationHours: input.durationHours,
      description: input.description?.trim() || undefined,
      timeTypeId: input.timeTypeId,
      scheduleBookingId: input.scheduleBookingId,
      createdAt: new Date().toISOString(),
      createdBy: input.createdBy,
    };

    set((state) => ({ timeEntries: [...state.timeEntries, timeEntry] }));
    return { ok: true, id: timeEntry.id };
  },

  deleteTimeEntry: (id) => {
    const timeEntry = get().timeEntries.find((item) => item.id === id);
    if (!timeEntry) {
      return { ok: false, error: "Time Entry not found." };
    }

    set((state) => ({ timeEntries: state.timeEntries.filter((item) => item.id !== id) }));
    return { ok: true };
  },
});
