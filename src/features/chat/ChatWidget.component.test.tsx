import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

import { sendChatMessage } from "./chatApi";
import ChatWidget from "./ChatWidget";
import { CHAT_WIDGET_TEST_IDS } from "./ChatWidget.testIds";
import { useChatStore } from "./useChatStore";

vi.mock("./chatApi", () => ({
  sendChatMessage: vi.fn(),
}));

afterEach(cleanup);

beforeEach(() => {
  useChatStore.setState({ isOpen: false, messages: [], isSending: false, error: undefined, lastResponseId: undefined });
  vi.mocked(sendChatMessage).mockReset();
});

describe("ChatWidget", () => {
  it("should open the panel when the launcher is clicked, and close it when the launcher is clicked again", () => {
    // Arrange
    render(<ChatWidget />);

    // Act & Assert
    expect(screen.queryByTestId(CHAT_WIDGET_TEST_IDS.panel)).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId(CHAT_WIDGET_TEST_IDS.launcher));
    expect(screen.getByTestId(CHAT_WIDGET_TEST_IDS.panel)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId(CHAT_WIDGET_TEST_IDS.launcher));
    expect(screen.queryByTestId(CHAT_WIDGET_TEST_IDS.panel)).not.toBeInTheDocument();
  });

  it("should close the panel on Escape", () => {
    // Arrange
    render(<ChatWidget />);
    fireEvent.click(screen.getByTestId(CHAT_WIDGET_TEST_IDS.launcher));
    expect(screen.getByTestId(CHAT_WIDGET_TEST_IDS.panel)).toBeInTheDocument();

    // Act
    fireEvent.keyDown(document, { key: "Escape" });

    // Assert
    expect(screen.queryByTestId(CHAT_WIDGET_TEST_IDS.panel)).not.toBeInTheDocument();
  });

  it("should close the panel on an outside click", () => {
    // Arrange
    render(<ChatWidget />);
    fireEvent.click(screen.getByTestId(CHAT_WIDGET_TEST_IDS.launcher));
    expect(screen.getByTestId(CHAT_WIDGET_TEST_IDS.panel)).toBeInTheDocument();

    // Act
    fireEvent.mouseDown(document.body);

    // Assert
    expect(screen.queryByTestId(CHAT_WIDGET_TEST_IDS.panel)).not.toBeInTheDocument();
  });

  it("should send a message and render the assistant's reply", async () => {
    // Arrange
    vi.mocked(sendChatMessage).mockResolvedValue({ responseId: "resp_1", message: "I can help with that." });
    render(<ChatWidget />);
    fireEvent.click(screen.getByTestId(CHAT_WIDGET_TEST_IDS.launcher));

    // Act
    fireEvent.change(screen.getByTestId(CHAT_WIDGET_TEST_IDS.messageInput), { target: { value: "How is Project X doing?" } });
    fireEvent.click(screen.getByTestId(CHAT_WIDGET_TEST_IDS.sendButton));

    // Assert
    expect(await screen.findByText("How is Project X doing?")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("I can help with that.")).toBeInTheDocument());
    expect(sendChatMessage).toHaveBeenCalledWith("How is Project X doing?", undefined);
  });
});
