import { describe, expect, it, vi } from "vitest";

import http from "../../lib/http";
import { sendChatMessage } from "./chatApi";

vi.mock("../../lib/http", () => ({
  default: { post: vi.fn() },
}));

describe("sendChatMessage", () => {
  it("should POST the message and previousResponseId to /chat", async () => {
    // Arrange
    const mockedPost = vi.mocked(http.post);
    mockedPost.mockResolvedValue({ data: { responseId: "resp_1", message: "Hello!" } });

    // Act
    const result = await sendChatMessage("Hi there", "resp_0");

    // Assert
    expect(mockedPost).toHaveBeenCalledWith("/chat", { message: "Hi there", previousResponseId: "resp_0" });
    expect(result).toEqual({ responseId: "resp_1", message: "Hello!" });
  });

  it("should omit previousResponseId when not supplied", async () => {
    // Arrange
    const mockedPost = vi.mocked(http.post);
    mockedPost.mockResolvedValue({ data: { responseId: "resp_1", message: "Hello!" } });

    // Act
    await sendChatMessage("Hi there");

    // Assert
    expect(mockedPost).toHaveBeenCalledWith("/chat", { message: "Hi there", previousResponseId: undefined });
  });
});
