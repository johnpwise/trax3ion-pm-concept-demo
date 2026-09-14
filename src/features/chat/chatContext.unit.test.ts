import { describe, expect, it } from "vitest";

import { useTraxionDemoStore } from "../../store/useTraxionDemoStore";
import { buildChatContext } from "./chatContext";

describe("buildChatContext", () => {
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
      calendarEvents: state.calendarEvents,
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
});
