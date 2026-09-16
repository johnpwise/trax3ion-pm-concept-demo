import { beforeEach, describe, expect, it } from "vitest";

import { SEED_START_DATE } from "../../data/demo-seed";
import { findConflicts } from "../../views/scheduler/availability";
import { addDays, toDateInputValue } from "../../views/scheduler/calendar-utils";
import { getBookingForAction, getProvisionalBookingsForProject } from "../selectors/schedulerSelectors";
import { useTraxionDemoStore } from "../useTraxionDemoStore";

const WRITE_UP_ACTION_ID = "action-x3-writeup"; // seeded, unassigned, 6h estimate
const ALFRED_RESOURCE_ID = "res-alfred"; // seeded with two full-day Annual Leave events on Wed/Thu of the seed's first week
const X3_IMPL_PROJECT_ID = "proj-x3-impl"; // owns WRITE_UP_ACTION_ID via task-x3-scoping -> phase-x3-design
const WORKSHOP_PREP_ACTION_ID = "action-cb-workshop-prep"; // seeded, unassigned, belongs to proj-core-bank
const NAOMI_RESOURCE_ID = "res-naomi"; // seeded, active

function wednesdayThisWeek(): string {
  return toDateInputValue(addDays(SEED_START_DATE, 2));
}

describe("scheduling an Action against a Resource's real calendar", () => {
  beforeEach(() => {
    localStorage.clear();
    useTraxionDemoStore.getState().resetDemoData();
  });

  it("creates a provisional booking sized to the Action's estimated hours once date, time, and resource are all set", () => {
    // Arrange
    const store = useTraxionDemoStore.getState();
    const action = store.actions.find((item) => item.id === WRITE_UP_ACTION_ID)!;

    // Act
    store.updateAction(action.id, { resourceId: ALFRED_RESOURCE_ID, scheduledDate: wednesdayThisWeek(), scheduledTime: "09:00" });
    store.syncActionBooking(action.id);

    // Assert
    const booking = getBookingForAction(action.id, useTraxionDemoStore.getState().calendarEvents);
    expect(booking).toBeDefined();
    expect(booking?.status).toBe("provisional");
    expect(booking?.resourceId).toBe(ALFRED_RESOURCE_ID);
    expect(new Date(booking!.end).getTime() - new Date(booking!.start).getTime()).toBe(action.estimatedHours! * 60 * 60 * 1000);
  });

  it("cross-references the new booking against the Resource's calendar and flags the seeded Annual Leave conflict", () => {
    // Arrange
    const store = useTraxionDemoStore.getState();
    const action = store.actions.find((item) => item.id === WRITE_UP_ACTION_ID)!;

    // Act
    store.updateAction(action.id, { resourceId: ALFRED_RESOURCE_ID, scheduledDate: wednesdayThisWeek(), scheduledTime: "09:00" });
    store.syncActionBooking(action.id);

    const state = useTraxionDemoStore.getState();
    const booking = getBookingForAction(action.id, state.calendarEvents)!;
    const conflicts = findConflicts({ start: booking.start, end: booking.end }, ALFRED_RESOURCE_ID, state.calendarEvents, booking.id);

    // Assert
    expect(conflicts.some((event) => event.title === "Annual Leave")).toBe(true);
  });

  it("removes a still-provisional booking when the schedule fields are cleared", () => {
    // Arrange
    const store = useTraxionDemoStore.getState();
    const action = store.actions.find((item) => item.id === WRITE_UP_ACTION_ID)!;
    store.updateAction(action.id, { resourceId: ALFRED_RESOURCE_ID, scheduledDate: wednesdayThisWeek(), scheduledTime: "09:00" });
    store.syncActionBooking(action.id);

    // Act
    store.updateAction(action.id, { scheduledTime: undefined });
    store.syncActionBooking(action.id);

    // Assert
    expect(getBookingForAction(action.id, useTraxionDemoStore.getState().calendarEvents)).toBeUndefined();
  });

  it("publishBookingsForProject flips only that project's provisional bookings to published", () => {
    // Arrange
    const store = useTraxionDemoStore.getState();
    const action = store.actions.find((item) => item.id === WRITE_UP_ACTION_ID)!;
    const otherAction = store.actions.find((item) => item.id === WORKSHOP_PREP_ACTION_ID)!;
    store.updateAction(action.id, { resourceId: ALFRED_RESOURCE_ID, scheduledDate: wednesdayThisWeek(), scheduledTime: "09:00" });
    store.syncActionBooking(action.id);
    store.updateAction(otherAction.id, { resourceId: NAOMI_RESOURCE_ID, scheduledDate: wednesdayThisWeek(), scheduledTime: "09:00" });
    store.syncActionBooking(otherAction.id);

    // Act
    store.publishBookingsForProject(X3_IMPL_PROJECT_ID);

    // Assert
    const state = useTraxionDemoStore.getState();
    expect(getBookingForAction(action.id, state.calendarEvents)?.status).toBe("published");
    expect(getBookingForAction(otherAction.id, state.calendarEvents)?.status).toBe("provisional");
    expect(getProvisionalBookingsForProject(state.calendarEvents, X3_IMPL_PROJECT_ID)).toHaveLength(0);
  });

  it("resets an already-published booking back to provisional when its fields are edited again", () => {
    // Arrange
    const store = useTraxionDemoStore.getState();
    const action = store.actions.find((item) => item.id === WRITE_UP_ACTION_ID)!;
    store.updateAction(action.id, { resourceId: ALFRED_RESOURCE_ID, scheduledDate: wednesdayThisWeek(), scheduledTime: "09:00" });
    store.syncActionBooking(action.id);
    store.publishBookingsForProject(X3_IMPL_PROJECT_ID);

    // Act
    store.updateAction(action.id, { scheduledTime: "10:00" });
    store.syncActionBooking(action.id);

    // Assert
    expect(getBookingForAction(action.id, useTraxionDemoStore.getState().calendarEvents)?.status).toBe("provisional");
  });

  it("discardBooking removes the booking and clears the Action's schedule fields", () => {
    // Arrange
    const store = useTraxionDemoStore.getState();
    const action = store.actions.find((item) => item.id === WRITE_UP_ACTION_ID)!;
    store.updateAction(action.id, { resourceId: ALFRED_RESOURCE_ID, scheduledDate: wednesdayThisWeek(), scheduledTime: "09:00" });
    store.syncActionBooking(action.id);
    const booking = getBookingForAction(action.id, useTraxionDemoStore.getState().calendarEvents)!;

    // Act
    store.discardBooking(booking.id);

    // Assert
    const state = useTraxionDemoStore.getState();
    expect(getBookingForAction(action.id, state.calendarEvents)).toBeUndefined();
    const updatedAction = state.actions.find((item) => item.id === action.id)!;
    expect(updatedAction.scheduledDate).toBeUndefined();
    expect(updatedAction.scheduledTime).toBeUndefined();
  });
});
