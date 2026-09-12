import { beforeEach, describe, expect, it } from "vitest";

import { SEED_START_DATE } from "../../data/demo-seed";
import { findConflicts } from "../../views/scheduler/availability";
import { addDays, toDateInputValue } from "../../views/scheduler/calendar-utils";
import { getBookingForAction, getProvisionalBookings } from "../selectors/schedulerSelectors";
import { useTraxionDemoStore } from "../useTraxionDemoStore";

const WRITE_UP_ACTION_ID = "action-x3-writeup"; // seeded, unassigned, 6h estimate
const ALFRED_RESOURCE_ID = "res-alfred"; // seeded with two full-day Annual Leave events in the seed's first week

function tuesdayThisWeek(): string {
  return toDateInputValue(addDays(SEED_START_DATE, 1));
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
    store.updateAction(action.id, { resourceId: ALFRED_RESOURCE_ID, scheduledDate: tuesdayThisWeek(), scheduledTime: "09:00" });
    store.syncActionBooking(action.id);

    // Assert
    const booking = getBookingForAction(action.id, useTraxionDemoStore.getState().calendarEvents);
    expect(booking).toBeDefined();
    expect(booking?.status).toBe("provisional");
    expect(booking?.resourceId).toBe(ALFRED_RESOURCE_ID);
    expect(new Date(booking!.end).getTime() - new Date(booking!.start).getTime()).toBe(action.estimatedHours * 60 * 60 * 1000);
  });

  it("cross-references the new booking against the Resource's calendar and flags the seeded Annual Leave conflict", () => {
    // Arrange
    const store = useTraxionDemoStore.getState();
    const action = store.actions.find((item) => item.id === WRITE_UP_ACTION_ID)!;

    // Act
    store.updateAction(action.id, { resourceId: ALFRED_RESOURCE_ID, scheduledDate: tuesdayThisWeek(), scheduledTime: "09:00" });
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
    store.updateAction(action.id, { resourceId: ALFRED_RESOURCE_ID, scheduledDate: tuesdayThisWeek(), scheduledTime: "09:00" });
    store.syncActionBooking(action.id);

    // Act
    store.updateAction(action.id, { scheduledTime: undefined });
    store.syncActionBooking(action.id);

    // Assert
    expect(getBookingForAction(action.id, useTraxionDemoStore.getState().calendarEvents)).toBeUndefined();
  });

  it("publishBookings flips every provisional booking to published", () => {
    // Arrange
    const store = useTraxionDemoStore.getState();
    const action = store.actions.find((item) => item.id === WRITE_UP_ACTION_ID)!;
    store.updateAction(action.id, { resourceId: ALFRED_RESOURCE_ID, scheduledDate: tuesdayThisWeek(), scheduledTime: "09:00" });
    store.syncActionBooking(action.id);

    // Act
    store.publishBookings();

    // Assert
    const state = useTraxionDemoStore.getState();
    expect(getBookingForAction(action.id, state.calendarEvents)?.status).toBe("published");
    expect(getProvisionalBookings(state.calendarEvents)).toHaveLength(0);
  });

  it("resets an already-published booking back to provisional when its fields are edited again", () => {
    // Arrange
    const store = useTraxionDemoStore.getState();
    const action = store.actions.find((item) => item.id === WRITE_UP_ACTION_ID)!;
    store.updateAction(action.id, { resourceId: ALFRED_RESOURCE_ID, scheduledDate: tuesdayThisWeek(), scheduledTime: "09:00" });
    store.syncActionBooking(action.id);
    store.publishBookings();

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
    store.updateAction(action.id, { resourceId: ALFRED_RESOURCE_ID, scheduledDate: tuesdayThisWeek(), scheduledTime: "09:00" });
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
