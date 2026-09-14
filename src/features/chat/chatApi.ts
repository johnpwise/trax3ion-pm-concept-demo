import http from "../../lib/http";
import type { ChatRequestBody, ChatResponseBody } from "./chat.types";

export async function sendChatMessage(message: string, previousResponseId?: string): Promise<ChatResponseBody> {
  const body: ChatRequestBody = { message, previousResponseId };
  const response = await http.post<ChatResponseBody>("/chat", body);
  return response.data;
}
