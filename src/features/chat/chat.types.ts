import type { Action, CalendarEvent, Customer, Phase, Project, Resource, Task } from "../../types/domain";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

export type ChatContext = {
  customers: Customer[];
  projects: Project[];
  phases: Phase[];
  tasks: Task[];
  actions: Action[];
  resources: Resource[];
  calendarEvents: CalendarEvent[];
};

export type ChatRequestBody = {
  message: string;
  previousResponseId?: string;
  context?: ChatContext;
};

export type ChatResponseBody = {
  responseId: string;
  message: string;
};
