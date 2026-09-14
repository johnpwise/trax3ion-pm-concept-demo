import { describe, expect, it, vi } from "vitest";

import http from "../../lib/http";
import { sendChatMessage } from "./chatApi";
import type { ChatContext } from "./chat.types";

vi.mock("../../lib/http", () => ({
  default: { post: vi.fn() },
}));

const FAKE_CONTEXT: ChatContext = {
  customers: [],
  projects: [],
  phases: [],
  tasks: [],
  actions: [],
  resources: [],
  calendarEvents: [],
};

describe("sendChatMessage", () => {
  it("should POST the message, previousResponseId and context to /chat", async () => {
    // Arrange
    const mockedPost = vi.mocked(http.post);
    mockedPost.mockResolvedValue({ data: { responseId: "resp_1", message: "Hello!" } });

    // Act
    const result = await sendChatMessage("Hi there", "resp_0", FAKE_CONTEXT);

    // Assert
    expect(mockedPost).toHaveBeenCalledWith("/chat", {
      message: "Hi there",
      previousResponseId: "resp_0",
      context: FAKE_CONTEXT,
    });
    expect(result).toEqual({ responseId: "resp_1", message: "Hello!" });
  });

  it("should omit previousResponseId and context when not supplied", async () => {
    // Arrange
    const mockedPost = vi.mocked(http.post);
    mockedPost.mockResolvedValue({ data: { responseId: "resp_1", message: "Hello!" } });

    // Act
    await sendChatMessage("Hi there");

    // Assert
    expect(mockedPost).toHaveBeenCalledWith("/chat", {
      message: "Hi there",
      previousResponseId: undefined,
      context: undefined,
    });
  });
});
