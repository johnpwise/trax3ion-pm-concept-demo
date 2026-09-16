import type { StateCreator } from "zustand";

import type { AdHocContext, AdHocTimeEntry } from "../../types/domain";
import { isNonNegativeQuarterHour } from "../selectors/projectSelectors";
import type { DemoStore } from "../useTraxionDemoStore";
import type { MutationResult, UpdateResult } from "./types";

/** Single source of truth for the ad-hoc context picklist, shared by the log-time form and reporting. */
export const AD_HOC_CONTEXTS: { value: AdHocContext; label: string }[] = [
  { value: "other-customer", label: "Other Customer (Unplanned)" },
  { value: "internal-bau", label: "Internal / BAU" },
  { value: "presales", label: "Sales / Pre-sales" },
  { value: "admin-overhead", label: "Admin / Overhead" },
  { value: "other", label: "Other" },
];

export type AdHocTimeSlice = {
  adHocTimeEntries: AdHocTimeEntry[];

  createAdHocTimeEntry: (input: {
    resourceId: string;
    workDate: string;
    startTime?: string;
    durationHours: number;
    context: AdHocContext;
    description: string;
    timeTypeId: string;
    createdBy: string;
  }) => MutationResult;
  deleteAdHocTimeEntry: (id: string) => UpdateResult;
};

export const createAdHocTimeSlice: StateCreator<DemoStore, [], [], AdHocTimeSlice> = (set, get) => ({
  adHocTimeEntries: [],

  createAdHocTimeEntry: (input) => {
    if (!get().timeTypes.some((timeType) => timeType.id === input.timeTypeId)) {
      return { ok: false, error: "Time Type not found." };
    }
    if (!isNonNegativeQuarterHour(input.durationHours) || input.durationHours <= 0) {
      return { ok: false, error: "Duration must be greater than zero, in 15-minute (0.25h) increments." };
    }
    if (!input.description.trim()) {
      return { ok: false, error: "Add a short description of the ad-hoc work." };
    }

    const entry: AdHocTimeEntry = {
      id: crypto.randomUUID(),
      resourceId: input.resourceId,
      workDate: input.workDate,
      startTime: input.startTime,
      durationHours: input.durationHours,
      context: input.context,
      description: input.description.trim(),
      timeTypeId: input.timeTypeId,
      createdAt: new Date().toISOString(),
      createdBy: input.createdBy,
    };

    set((state) => ({ adHocTimeEntries: [...state.adHocTimeEntries, entry] }));
    return { ok: true, id: entry.id };
  },

  deleteAdHocTimeEntry: (id) => {
    const entry = get().adHocTimeEntries.find((item) => item.id === id);
    if (!entry) {
      return { ok: false, error: "Ad-hoc entry not found." };
    }

    set((state) => ({ adHocTimeEntries: state.adHocTimeEntries.filter((item) => item.id !== id) }));
    return { ok: true };
  },
});
