import { useTraxionDemoStore } from "../../store/useTraxionDemoStore";
import type { ChatContext } from "./chat.types";

export function buildChatContext(): ChatContext {
  const { customers, projects, phases, tasks, actions, resources, calendarEvents } = useTraxionDemoStore.getState();
  return { customers, projects, phases, tasks, actions, resources, calendarEvents };
}
