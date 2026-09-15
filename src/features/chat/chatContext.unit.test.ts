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
    // Arrange
    useAuthStore.getState().login("user@trax3ion.demo", "trax3ion-user");
    const state = useTraxionDemoStore.getState();

    // Act
    const context = buildChatContext();

    // Assert - only projects/customers Graham is assigned to
    expect(context.projects.map((project) => project.id).sort()).toEqual(["proj-core-bank", "proj-reg-report"]);
    expect(context.customers.map((customer) => customer.id)).toEqual(["cust-meridian"]);
    expect(context.projects.length).toBeLessThan(state.projects.length);

    // Assert - only his own calendar events, never anyone else's
    expect(context.calendarEvents.length).toBeGreaterThan(0);
    context.calendarEvents.forEach((event) => expect(event.resourceId).toBe("res-graham"));
    expect(context.calendarEvents.length).toBeLessThan(state.calendarEvents.length);

    // Assert - no data belonging to projects/customers outside his scope
    expect(context.projects.some((project) => project.id === "proj-x3-impl")).toBe(false);
    expect(context.customers.some((customer) => customer.id === "cust-acme")).toBe(false);
  });
});
