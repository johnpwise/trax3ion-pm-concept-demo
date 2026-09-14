import { create } from "zustand";

import { buildChatContext } from "./chatContext";
import { sendChatMessage } from "./chatApi";
import type { ChatMessage } from "./chat.types";

type ChatState = {
  isOpen: boolean;
  messages: ChatMessage[];
  isSending: boolean;
  error: string | undefined;
  lastResponseId: string | undefined;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  sendMessage: (text: string) => Promise<void>;
};

export const useChatStore = create<ChatState>((set, get) => ({
  isOpen: false,
  messages: [],
  isSending: false,
  error: undefined,
  lastResponseId: undefined,
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  sendMessage: async (text) => {
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
    set((state) => ({ messages: [...state.messages, userMessage], isSending: true, error: undefined }));

    try {
      const response = await sendChatMessage(text, get().lastResponseId, buildChatContext());
      const assistantMessage: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: response.message };
      set((state) => ({
        messages: [...state.messages, assistantMessage],
        lastResponseId: response.responseId,
        isSending: false,
      }));
    } catch {
      set({ isSending: false, error: "Something went wrong sending that message. Please try again." });
    }
  },
}));
