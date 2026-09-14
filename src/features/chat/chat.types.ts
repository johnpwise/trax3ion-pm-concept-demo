export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

export type ChatRequestBody = {
  message: string;
  previousResponseId?: string;
};

export type ChatResponseBody = {
  responseId: string;
  message: string;
};
