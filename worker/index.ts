import OpenAI from "openai";

import { getEventsForDate, type ToolCalendarEvent } from "./availability";

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

const MAX_TOOL_ROUNDS = 4;

const GET_EVENTS_FOR_DATE_TOOL: OpenAI.Responses.FunctionTool = {
  type: "function",
  name: "get_events_for_date",
  description:
    "Returns the calendarEvents that fall on a specific local calendar date, optionally filtered to one resource. " +
    "Always call this for any question about what is scheduled, or who is on leave or available/busy, on a specific " +
    "date or day of the week - do not try to work out which calendarEvents entries fall on that date yourself. " +
    "Look up the resource's id from the resources list already supplied to filter to one person; omit resourceId to " +
    "get every resource's events for that date.",
  parameters: {
    type: "object",
    properties: {
      date: {
        type: "string",
        description: "The calendar date to look up, as YYYY-MM-DD, in the same local calendar as the supplied data.",
      },
      resourceId: {
        type: ["string", "null"],
        description: "Optional resource id to filter to a single person. Pass null to return events for all resources.",
      },
    },
    required: ["date", "resourceId"],
    additionalProperties: false,
  },
  strict: true,
};

const TOOLS: OpenAI.Responses.Tool[] = [GET_EVENTS_FOR_DATE_TOOL];

const CHAT_INSTRUCTIONS = `
You are the Trax3ion PM Assistant.

You are embedded inside the Trax3ion PM project-management application.

Be concise, practical and professional.
Do not invent project, customer, resource or scheduling information.
If information has not been supplied to you, say that you do not have it.

For any question about what is scheduled, or who is on leave or available/busy, on a specific date or day of the
week, call the get_events_for_date tool with that date rather than scanning the calendarEvents JSON yourself.

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

function extractCalendarEvents(context: unknown): ToolCalendarEvent[] {
  if (typeof context !== "object" || context === null || !("calendarEvents" in context)) {
    return [];
  }

  const { calendarEvents } = context as { calendarEvents: unknown };
  return Array.isArray(calendarEvents) ? (calendarEvents as ToolCalendarEvent[]) : [];
}

function runTool(name: string, argsJson: string, calendarEvents: ToolCalendarEvent[]): unknown {
  if (name !== "get_events_for_date") {
    return { error: `Unknown tool: ${name}` };
  }

  const args = JSON.parse(argsJson) as { date: string; resourceId: string | null };
  return getEventsForDate(calendarEvents, args.date, args.resourceId ?? undefined);
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
    const calendarEvents = extractCalendarEvents(body.context);

    let response = await openai.responses.create({
      model: env.OPENAI_MODEL ?? "gpt-5.6-luna",
      instructions: buildInstructions(body.context),
      input: body.message,
      previous_response_id: body.previousResponseId,
      tools: TOOLS,
    });

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const calls = response.output.filter(
        (item): item is OpenAI.Responses.ResponseFunctionToolCall => item.type === "function_call",
      );

      if (calls.length === 0) {
        break;
      }

      const outputs: OpenAI.Responses.ResponseInputItem.FunctionCallOutput[] = calls.map((call) => ({
        type: "function_call_output",
        call_id: call.call_id,
        output: JSON.stringify(runTool(call.name, call.arguments, calendarEvents)),
      }));

      response = await openai.responses.create({
        model: env.OPENAI_MODEL ?? "gpt-5.6-luna",
        previous_response_id: response.id,
        input: outputs,
        tools: TOOLS,
      });
    }

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
