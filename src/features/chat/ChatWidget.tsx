import { LoaderCircle, MessageCircle, MessageSquarePlus, Send, X } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { CHAT_WIDGET_TEST_IDS } from "./ChatWidget.testIds";
import ChatMessageContent from "./ChatMessageContent";
import { useChatStore } from "./useChatStore";

export default function ChatWidget() {
  const isOpen = useChatStore((state) => state.isOpen);
  const messages = useChatStore((state) => state.messages);
  const isSending = useChatStore((state) => state.isSending);
  const error = useChatStore((state) => state.error);
  const toggleChat = useChatStore((state) => state.toggleChat);
  const closeChat = useChatStore((state) => state.closeChat);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const resetChat = useChatStore((state) => state.resetChat);

  const [draft, setDraft] = useState("");

  const launcherRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const messageList = messageListRef.current;
    if (!messageList) return;
    messageList.scrollTop = messageList.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") closeChat();
    };
    const handlePointerDown = (event: MouseEvent): void => {
      const target = event.target as Node;
      if (launcherRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      closeChat();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen, closeChat]);

  const handleSubmit = (event: FormEvent): void => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || isSending) return;
    setDraft("");
    void sendMessage(text);
  };

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        data-id={CHAT_WIDGET_TEST_IDS.launcher}
        onClick={toggleChat}
        aria-label={isOpen ? "Close Trax3ion Nexus" : "Open Trax3ion Nexus"}
        aria-expanded={isOpen}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {isOpen
        ? createPortal(
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Trax3ion Nexus"
              data-id={CHAT_WIDGET_TEST_IDS.panel}
              className="fixed bottom-24 right-6 z-50 flex h-[32rem] max-h-[70vh] w-96 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
            >
              <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold text-surface-foreground">Trax3ion Nexus</h2>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    data-id={CHAT_WIDGET_TEST_IDS.newChatButton}
                    onClick={resetChat}
                    disabled={messages.length === 0 || isSending}
                    aria-label="Start a new conversation"
                    title="Start a new conversation"
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-surface-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <MessageSquarePlus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={closeChat}
                    aria-label="Close Trax3ion Nexus"
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-surface-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div ref={messageListRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Ask me anything about Trax3ion PM.</p>
                ) : null}
                {messages.map((message) =>
                  message.role === "user" ? (
                    <div
                      key={message.id}
                      className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                    >
                      {message.content}
                    </div>
                  ) : (
                    <div
                      key={message.id}
                      className="max-w-[85%] rounded-lg bg-muted px-3 py-2 text-surface-foreground"
                    >
                      <ChatMessageContent content={message.content} />
                    </div>
                  ),
                )}
              </div>

              {error ? <p className="mx-4 mb-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

              <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-border p-3">
                <input
                  ref={inputRef}
                  type="text"
                  data-id={CHAT_WIDGET_TEST_IDS.messageInput}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Ask a question…"
                  disabled={isSending}
                  className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-surface-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
                />
                <button
                  type="submit"
                  data-id={CHAT_WIDGET_TEST_IDS.sendButton}
                  disabled={isSending || draft.trim().length === 0}
                  aria-label="Send message"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
