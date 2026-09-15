import { useTraxionDemoStore } from "../../store/useTraxionDemoStore";
import { toLocalIsoLikeString } from "../../views/scheduler/calendar-utils";
import type { ChatContext } from "./chat.types";

export function buildChatContext(): ChatContext {
  const { customers, projects, phases, tasks, actions, resources, calendarEvents } = useTraxionDemoStore.getState();

  // calendarEvents are persisted as UTC ISO strings. The assistant reads timestamps
  // literally rather than parsing timezone offsets, so convert to the user's local
  // wall-clock time here - the same conversion the scheduler UI applies when displaying
  // these events - instead of asking the model to do timezone math.
  const localCalendarEvents = calendarEvents.map((event) => ({
    ...event,
    start: toLocalIsoLikeString(event.start),
    end: toLocalIsoLikeString(event.end),
  }));

  return { customers, projects, phases, tasks, actions, resources, calendarEvents: localCalendarEvents };
}
