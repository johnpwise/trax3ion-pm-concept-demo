import { beforeEach, describe, expect, it } from "vitest";

import { SEED_START_DATE } from "../../data/demo-seed";
import { addDays, atTime, toDateInputValue } from "../../views/scheduler/calendar-utils";
import { useTraxionDemoStore } from "../useTraxionDemoStore";
import { getMyActionsNeedingAttention } from "./myDashboardSelectors";

const WRITE_UP_ACTION_ID = "action-x3-writeup"; // seeded, unassigned, 6h estimate
const WORKSHOP_PREP_ACTION_ID = "action-cb-workshop-prep"; // seeded, unassigned, 4h estimate
const ALFRED_RESOURCE_ID = "res-alfred";
const NAOMI_RESOURCE_ID = "res-naomi";

const bookingDay = addDays(SEED_START_DATE, 2); // Wed of the seed's first week
const bookingDateStr = toDateInputValue(bookingDay);

describe("getMyActionsNeedingAttention", () => {
  beforeEach(() => {
    localStorage.clear();
    useTraxionDemoStore.getState().resetDemoData();
  });

  it("excludes an assigned Action whose booked window hasn't finished yet", () => {
    const store = useTraxionDemoStore.getState();
    store.updateAction(WRITE_UP_ACTION_ID, { resourceId: ALFRED_RESOURCE_ID, scheduledDate: bookingDateStr, scheduledTime: "09:00" });
    store.syncActionBooking(WRITE_UP_ACTION_ID);

    const state = useTraxionDemoStore.getState();
    const now = atTime(bookingDay, 14, 0); // booking runs 09:00-15:00

    const result = getMyActionsNeedingAttention(ALFRED_RESOURCE_ID, state.actions, state.calendarEvents, state.timeEntries, now);

    expect(result.map((action) => action.id)).not.toContain(WRITE_UP_ACTION_ID);
  });

  it("flags an assigned Action once its booked window has fully elapsed with no actual hours logged", () => {
    const store = useTraxionDemoStore.getState();
    store.updateAction(WRITE_UP_ACTION_ID, { resourceId: ALFRED_RESOURCE_ID, scheduledDate: bookingDateStr, scheduledTime: "09:00" });
    store.syncActionBooking(WRITE_UP_ACTION_ID);

    const state = useTraxionDemoStore.getState();
    const now = atTime(bookingDay, 15, 1); // just past the 15:00 booking end

    const result = getMyActionsNeedingAttention(ALFRED_RESOURCE_ID, state.actions, state.calendarEvents, state.timeEntries, now);

    expect(result.map((action) => action.id)).toContain(WRITE_UP_ACTION_ID);
  });

  it("never flags an Action with actual hours logged, even after its booking has elapsed", () => {
    const store = useTraxionDemoStore.getState();
    store.updateAction(WRITE_UP_ACTION_ID, { resourceId: ALFRED_RESOURCE_ID, scheduledDate: bookingDateStr, scheduledTime: "09:00" });
    store.syncActionBooking(WRITE_UP_ACTION_ID);
    const created = store.createTimeEntry({
      actionId: WRITE_UP_ACTION_ID,
      resourceId: ALFRED_RESOURCE_ID,
      workDate: bookingDateStr,
      durationHours: 1,
      timeTypeId: "tt-cc",
      createdBy: "test",
    });
    expect(created.ok).toBe(true);

    const state = useTraxionDemoStore.getState();
    const now = atTime(bookingDay, 15, 1);

    const result = getMyActionsNeedingAttention(ALFRED_RESOURCE_ID, state.actions, state.calendarEvents, state.timeEntries, now);

    expect(result.map((action) => action.id)).not.toContain(WRITE_UP_ACTION_ID);
  });

  it("falls back to the Action's own scheduledDate/scheduledTime when no booking has been synced yet", () => {
    const store = useTraxionDemoStore.getState();
    // Set the schedule fields directly, without calling syncActionBooking, so no CalendarEvent exists.
    store.updateAction(WORKSHOP_PREP_ACTION_ID, { resourceId: NAOMI_RESOURCE_ID, scheduledDate: bookingDateStr, scheduledTime: "09:00" });

    const state = useTraxionDemoStore.getState();
    expect(state.calendarEvents.some((event) => event.actionId === WORKSHOP_PREP_ACTION_ID)).toBe(false);

    const beforeEnd = atTime(bookingDay, 12, 0); // 4h estimate: 09:00-13:00
    const afterEnd = atTime(bookingDay, 13, 1);

    expect(
      getMyActionsNeedingAttention(NAOMI_RESOURCE_ID, state.actions, state.calendarEvents, state.timeEntries, beforeEnd).map((a) => a.id),
    ).not.toContain(WORKSHOP_PREP_ACTION_ID);
    expect(
      getMyActionsNeedingAttention(NAOMI_RESOURCE_ID, state.actions, state.calendarEvents, state.timeEntries, afterEnd).map((a) => a.id),
    ).toContain(WORKSHOP_PREP_ACTION_ID);
  });

  it("excludes Actions assigned to a different resource, regardless of schedule", () => {
    const store = useTraxionDemoStore.getState();
    store.updateAction(WRITE_UP_ACTION_ID, { resourceId: ALFRED_RESOURCE_ID, scheduledDate: bookingDateStr, scheduledTime: "09:00" });
    store.syncActionBooking(WRITE_UP_ACTION_ID);

    const state = useTraxionDemoStore.getState();
    const now = atTime(bookingDay, 15, 1);

    const result = getMyActionsNeedingAttention(NAOMI_RESOURCE_ID, state.actions, state.calendarEvents, state.timeEntries, now);

    expect(result.map((action) => action.id)).not.toContain(WRITE_UP_ACTION_ID);
  });
});
