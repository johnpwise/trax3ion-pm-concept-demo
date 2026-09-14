import http from "../../lib/http";
import type { ChatContext, ChatRequestBody, ChatResponseBody } from "./chat.types";

export async function sendChatMessage(
  message: string,
  previousResponseId?: string,
  context?: ChatContext,
): Promise<ChatResponseBody> {
  const body: ChatRequestBody = { message, previousResponseId, context };
  const response = await http.post<ChatResponseBody>("/chat", body);
  return response.data;
}
