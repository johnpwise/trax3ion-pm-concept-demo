import type { StateCreator } from "zustand";

import { createSeedData, SEED_START_DATE, SEED_VERSION } from "../../data/demo-seed";
import type { DemoStore } from "../useTraxionDemoStore";

export type DemoSlice = {
  seedVersion: number;
  resetDemoData: () => void;
};

export const createDemoSlice: StateCreator<DemoStore, [], [], DemoSlice> = (set) => ({
  seedVersion: SEED_VERSION,

  resetDemoData: () => {
    const seed = createSeedData();
    const currentUser = seed.resources.find((resource) => resource.isCurrentUser);

    set({
      customers: seed.customers,
      projects: seed.projects,
      phases: seed.phases,
      tasks: seed.tasks,
      actions: seed.actions,
      resources: seed.resources,
      calendarEvents: seed.calendarEvents,
      selectedResourceIds: currentUser ? [currentUser.id] : [],
      visibleWeekStart: SEED_START_DATE.toISOString(),
      seedVersion: SEED_VERSION,
    });
  },
});
