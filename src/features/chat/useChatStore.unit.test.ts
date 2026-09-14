import { beforeEach, describe, expect, it, vi } from "vitest";

import { sendChatMessage } from "./chatApi";
import { useChatStore } from "./useChatStore";

vi.mock("./chatApi", () => ({
  sendChatMessage: vi.fn(),
}));

describe("useChatStore", () => {
  beforeEach(() => {
    useChatStore.setState({ isOpen: false, messages: [], isSending: false, error: undefined, lastResponseId: undefined });
    vi.mocked(sendChatMessage).mockReset();
  });

  it("should open and close via openChat/closeChat/toggleChat", () => {
    // Act & Assert
    useChatStore.getState().openChat();
    expect(useChatStore.getState().isOpen).toBe(true);

    useChatStore.getState().closeChat();
    expect(useChatStore.getState().isOpen).toBe(false);

    useChatStore.getState().toggleChat();
    expect(useChatStore.getState().isOpen).toBe(true);
  });

  it("should optimistically append the user message and then the assistant reply on success", async () => {
    // Arrange
    vi.mocked(sendChatMessage).mockResolvedValue({ responseId: "resp_1", message: "Hello back" });

    // Act
    const sendPromise = useChatStore.getState().sendMessage("Hi there");
    expect(useChatStore.getState().messages).toHaveLength(1);
    expect(useChatStore.getState().messages[0]).toMatchObject({ role: "user", content: "Hi there" });
    expect(useChatStore.getState().isSending).toBe(true);
    await sendPromise;

    // Assert
    const state = useChatStore.getState();
    expect(state.messages).toHaveLength(2);
    expect(state.messages[1]).toMatchObject({ role: "assistant", content: "Hello back" });
    expect(state.lastResponseId).toBe("resp_1");
    expect(state.isSending).toBe(false);
    expect(state.error).toBeUndefined();
  });

  it("should pass the stored lastResponseId as previousResponseId on the next call", async () => {
    // Arrange
    vi.mocked(sendChatMessage).mockResolvedValue({ responseId: "resp_1", message: "First reply" });
    await useChatStore.getState().sendMessage("First message");
    vi.mocked(sendChatMessage).mockResolvedValue({ responseId: "resp_2", message: "Second reply" });

    // Act
    await useChatStore.getState().sendMessage("Second message");

    // Assert
    expect(sendChatMessage).toHaveBeenLastCalledWith("Second message", "resp_1");
  });

  it("should set an error and stop sending when the API call fails, without losing the user's message", async () => {
    // Arrange
    vi.mocked(sendChatMessage).mockRejectedValue(new Error("network down"));

    // Act
    await useChatStore.getState().sendMessage("Hi there");

    // Assert
    const state = useChatStore.getState();
    expect(state.isSending).toBe(false);
    expect(state.error).toBeTruthy();
    expect(state.messages).toHaveLength(1);
    expect(state.messages[0]).toMatchObject({ role: "user", content: "Hi there" });
  });
});
