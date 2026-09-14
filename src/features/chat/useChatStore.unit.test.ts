import { beforeEach, describe, expect, it, vi } from "vitest";

import { sendChatMessage } from "./chatApi";
import { buildChatContext } from "./chatContext";
import { useChatStore } from "./useChatStore";
import type { ChatContext } from "./chat.types";

vi.mock("./chatApi", () => ({
  sendChatMessage: vi.fn(),
}));

vi.mock("./chatContext", () => ({
  buildChatContext: vi.fn(),
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

describe("useChatStore", () => {
  beforeEach(() => {
    useChatStore.setState({ isOpen: false, messages: [], isSending: false, error: undefined, lastResponseId: undefined });
    vi.mocked(sendChatMessage).mockReset();
    vi.mocked(buildChatContext).mockReset().mockReturnValue(FAKE_CONTEXT);
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
    expect(sendChatMessage).toHaveBeenLastCalledWith("Second message", "resp_1", FAKE_CONTEXT);
  });

  it("should pass the current chat context with every call", async () => {
    // Arrange
    vi.mocked(sendChatMessage).mockResolvedValue({ responseId: "resp_1", message: "Reply" });

    // Act
    await useChatStore.getState().sendMessage("Hi there");

    // Assert
    expect(sendChatMessage).toHaveBeenCalledWith("Hi there", undefined, FAKE_CONTEXT);
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
