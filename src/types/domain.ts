export type EntityStatus = "active" | "inactive";

export type StatusFilter = "active" | "inactive" | "all";

export type RiskStatus = "green" | "amber" | "red";

export type Customer = {
  id: string;
  name: string;
  status: EntityStatus;
};

export type Project = {
  id: string;
  customerId: string;
  name: string;
  code?: string;
  description?: string;
  estimatedHours: number;
  status: EntityStatus;
  riskStatus?: RiskStatus;
};

export type Phase = {
  id: string;
  projectId: string;
  name: string;
  estimatedHours: number;
  status: EntityStatus;
  sortOrder: number;
};

export type Task = {
  id: string;
  phaseId: string;
  name: string;
  description?: string;
  estimatedHours: number;
  status: EntityStatus;
  sortOrder: number;
};

export type Action = {
  id: string;
  taskId: string;
  name: string;
  estimatedHours: number;
  actualHours?: number;
  status: EntityStatus;
  sortOrder: number;
  resourceId?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  workNotes?: string;
};

export type Resource = {
  id: string;
  name: string;
  role: string;
  status: EntityStatus;
  isCurrentUser?: boolean;
};

export type CalendarEventSource = "trax3ion" | "outlook";

export type BookingStatus = "provisional" | "published";

export type CalendarEvent = {
  id: string;
  resourceId: string;
  title: string;
  start: string;
  end: string;
  source: CalendarEventSource;
  status?: BookingStatus;
  customerId?: string;
  projectId?: string;
  actionId?: string;
};
