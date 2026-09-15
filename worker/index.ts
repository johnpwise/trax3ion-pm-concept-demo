import OpenAI from "openai";

interface Env {
  OPENAI_API_KEY: string;
  OPENAI_MODEL?: string;
  ASSETS: Fetcher;
}

interface ChatRequestBody {
  message: string;
  previousResponseId?: string;
  context?: unknown;
}

const CHAT_INSTRUCTIONS = `
You are the Trax3ion PM Assistant.

You are embedded inside the Trax3ion PM project-management application.

Be concise, practical and professional.
Do not invent project, customer, resource or scheduling information.
If information has not been supplied to you, say that you do not have it.

Format responses in Markdown where it improves readability: use short paragraphs, bullet or numbered lists for multiple items, and **bold** for key terms. Only use tables for genuinely tabular data. Avoid headings for short answers.
`;

function buildInstructions(context: unknown): string {
  if (context === undefined) {
    return CHAT_INSTRUCTIONS;
  }

  return `${CHAT_INSTRUCTIONS}
Here is the current state of this demo's project data, as JSON. It reflects live data from the app right now, including anything the user has just changed.

Use it to answer questions about specific customers, projects, phases, tasks, actions, resources and scheduled calendar events. Never dump the raw JSON back to the user - answer naturally, as a PM assistant would. If something is genuinely absent from this data, say so rather than guessing.

All calendarEvents start/end timestamps are already given in the user's local wall-clock time (e.g. "2026-09-21T09:00:00" means 09:00 local). Read the hour and minute digits as-is - do not treat them as UTC and do not apply any timezone conversion.

${JSON.stringify(context)}
`;
}

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
      instructions: buildInstructions(body.context),
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
