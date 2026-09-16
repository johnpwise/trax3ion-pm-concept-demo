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
  /** Blank/undefined represents an ad-hoc Action with no pre-agreed estimate (PRD FR-005). */
  estimatedHours?: number;
  status: EntityStatus;
  sortOrder: number;
  resourceId?: string;
  scheduledDate?: string;
  scheduledTime?: string;
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

/**
 * Time Cat is not unique on its own (e.g. `CC` denotes both the standard and the `BK -` banked
 * variant of the same category), so `id` — not `timeCat` — is the stable identity for a Time Type.
 */
export type TimeType = {
  id: string;
  timeCat: string;
  timeTag: string;
  allocateAgainstInvoice: boolean;
  allocateAgainstEst: boolean;
  sltInternal: boolean;
  bankedInternal: boolean;
  status: EntityStatus;
};

/** A discrete record of time worked against an Action, replacing the old rolling `Action.actualHours` total. */
export type TimeEntry = {
  id: string;
  actionId: string;
  resourceId: string;
  workDate: string;
  durationHours: number;
  description?: string;
  timeTypeId: string;
  scheduleBookingId?: string;
  createdAt: string;
  createdBy: string;
};

export type AdHocContext = "other-customer" | "internal-bau" | "presales" | "admin-overhead" | "other";

/**
 * Time a Resource logs that isn't against any Project Action — deliberately kept in its own
 * collection, separate from `TimeEntry`, so it never rolls up into a Project's actual hours or
 * Finance figures (client scenario: a Consultant interrupted by unplanned/unbooked work, e.g. a
 * P1 for a Customer with no open Project). Still requires a Time Type so it can be reported
 * alongside project time (FR-016) without being counted as project time.
 */
export type AdHocTimeEntry = {
  id: string;
  resourceId: string;
  workDate: string;
  startTime?: string;
  durationHours: number;
  context: AdHocContext;
  description: string;
  timeTypeId: string;
  createdAt: string;
  createdBy: string;
};
