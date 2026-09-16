import { create } from "zustand";
import { persist } from "zustand/middleware";

import { SEED_VERSION } from "../data/demo-seed";
import { createCustomerSlice, type CustomerSlice } from "./slices/customerSlice";
import { createDemoSlice, type DemoSlice } from "./slices/demoSlice";
import { createProjectSlice, type ProjectSlice } from "./slices/projectSlice";
import { createSchedulerSlice, type SchedulerSlice } from "./slices/schedulerSlice";
import { createTimeEntrySlice, type TimeEntrySlice } from "./slices/timeEntrySlice";

export type DemoStore = CustomerSlice & ProjectSlice & SchedulerSlice & TimeEntrySlice & DemoSlice;

export const DEMO_STORE_STORAGE_KEY = "trax3ion-pm-demo-v1";

export const useTraxionDemoStore = create<DemoStore>()(
  persist(
    (...args) => ({
      ...createCustomerSlice(...args),
      ...createProjectSlice(...args),
      ...createSchedulerSlice(...args),
      ...createTimeEntrySlice(...args),
      ...createDemoSlice(...args),
    }),
    {
      name: DEMO_STORE_STORAGE_KEY,
      version: SEED_VERSION,
    },
  ),
);

const initialState = useTraxionDemoStore.getState();
if (initialState.seedVersion !== SEED_VERSION || initialState.customers.length === 0) {
  initialState.resetDemoData();
}
