import OpenAI from "openai";

interface Env {
  OPENAI_API_KEY: string;
  OPENAI_MODEL?: string;
  ASSETS: Fetcher;
}

interface ChatRequestBody {
  message: string;
  previousResponseId?: string;
}

const CHAT_INSTRUCTIONS = `
You are the Trax3ion PM Assistant.

You are embedded inside the Trax3ion PM project-management application.

Be concise, practical and professional.
Do not invent project, customer, resource or scheduling information.
If information has not been supplied to you, say that you do not have it.
`;

async function handleChat(request: Request, env: Env): Promise<Response> {
  let body: ChatRequestBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  if (typeof body.message !== "string" || body.message.trim().length === 0) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }

  try {
    const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    const response = await openai.responses.create({
      model: env.OPENAI_MODEL ?? "gpt-5.6-luna",
      instructions: CHAT_INSTRUCTIONS,
      input: body.message,
      previous_response_id: body.previousResponseId,
    });

    return Response.json({
      responseId: response.id,
      message: response.output_text,
    });
  } catch (error) {
    console.error("OpenAI request failed", error);
    return Response.json({ error: "The assistant is unavailable right now." }, { status: 500 });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat" && request.method === "POST") {
      return handleChat(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
