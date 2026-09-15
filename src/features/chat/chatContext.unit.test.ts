import { afterEach, describe, expect, it } from "vitest";

import { useAuthStore } from "../../store/authStore";
import { useTraxionDemoStore } from "../../store/useTraxionDemoStore";
import { toLocalIsoLikeString } from "../../views/scheduler/calendar-utils";
import { buildChatContext } from "./chatContext";

describe("buildChatContext", () => {
  afterEach(() => {
    useAuthStore.getState().logout();
  });

  it("should reflect the current state of the demo store", () => {
    // Act
    const context = buildChatContext();

    // Assert
    const state = useTraxionDemoStore.getState();
    expect(context).toEqual({
      customers: state.customers,
      projects: state.projects,
      phases: state.phases,
      tasks: state.tasks,
      actions: state.actions,
      resources: state.resources,
      calendarEvents: state.calendarEvents.map((event) => ({
        ...event,
        start: toLocalIsoLikeString(event.start),
        end: toLocalIsoLikeString(event.end),
      })),
    });
  });

  it("should convert calendar event times from UTC storage to local wall-clock time", () => {
    // Arrange
    const state = useTraxionDemoStore.getState();

    // Act
    const context = buildChatContext();

    // Assert
    expect(context.calendarEvents.length).toBeGreaterThan(0);
    context.calendarEvents.forEach((event, index) => {
      const rawEvent = state.calendarEvents[index];
      expect(event.start).toBe(toLocalIsoLikeString(rawEvent.start));
      expect(event.end).toBe(toLocalIsoLikeString(rawEvent.end));
      // sanity check: local representation carries no UTC "Z" marker
      expect(event.start).not.toMatch(/Z$/);
    });
  });

  it("should pick up changes made to the store", () => {
    // Arrange
    const before = buildChatContext();
    const result = useTraxionDemoStore.getState().createCustomer({ name: "Test Customer" });

    // Act
    const after = buildChatContext();

    // Assert
    expect(result.ok).toBe(true);
    expect(after.customers.length).toBe(before.customers.length + 1);
    expect(after.customers).toEqual(expect.arrayContaining([expect.objectContaining({ name: "Test Customer" })]));
  });

  it("should return the full unscoped context for a project manager", () => {
    // Arrange
    useAuthStore.getState().login("pm@trax3ion.demo", "trax3ion-pm");
    const state = useTraxionDemoStore.getState();

    // Act
    const context = buildChatContext();

    // Assert
    expect(context.customers).toEqual(state.customers);
    expect(context.projects).toEqual(state.projects);
    expect(context.resources).toEqual(state.resources);
  });

  it("should scope a non-project-manager user's context to their own projects and schedule", () => {
    // Arrange - Graham starts the demo unbooked and unassigned, so his scope should be empty
    // except for himself as a Resource.
    useAuthStore.getState().login("user@trax3ion.demo", "trax3ion-user");
    const state = useTraxionDemoStore.getState();

    // Act
    const context = buildChatContext();

    // Assert - no projects/customers, since he isn't assigned to any yet
    expect(context.projects).toEqual([]);
    expect(context.customers).toEqual([]);
    expect(context.projects.length).toBeLessThan(state.projects.length);

    // Assert - no calendar events, since he has none booked
    expect(context.calendarEvents).toEqual([]);

    // Assert - only himself as a Resource, never anyone else's
    expect(context.resources.map((resource) => resource.id)).toEqual(["res-graham"]);
  });
});
