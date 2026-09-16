import type { AdHocTimeEntry, Action, CalendarEvent, Customer, Phase, Project, Resource, Task, TimeEntry, TimeType } from "../types/domain";
import { addDays, atTime, toDateInputValue } from "../views/scheduler/calendar-utils";

export const SEED_VERSION = 11;

/**
 * Mirrors the PRD's supplied TIME TYPE reference data (section on Core Domain Model / Time Type).
 * Time Cat is not unique — the Banked rows reuse CC/CD/CPM with a `BK -` prefixed Time Tag — so
 * `id` is the stable identity, per the PRD's explicit "identify independently of Time Cat" requirement.
 */
const TIME_TYPES: TimeType[] = [
  { id: "tt-cc", timeCat: "CC", timeTag: "Chargeable Consultancy", allocateAgainstInvoice: true, allocateAgainstEst: true, sltInternal: true, bankedInternal: false, status: "active" },
  { id: "tt-cd", timeCat: "CD", timeTag: "Chargeable Development", allocateAgainstInvoice: true, allocateAgainstEst: true, sltInternal: true, bankedInternal: false, status: "active" },
  { id: "tt-cpm", timeCat: "CPM", timeTag: "Chargeable Project Management", allocateAgainstInvoice: true, allocateAgainstEst: true, sltInternal: true, bankedInternal: false, status: "active" },

  { id: "tt-focc", timeCat: "FOCC", timeTag: "FOC - Consultancy", allocateAgainstInvoice: true, allocateAgainstEst: true, sltInternal: true, bankedInternal: false, status: "active" },
  { id: "tt-focd", timeCat: "FOCD", timeTag: "FOC - Development", allocateAgainstInvoice: true, allocateAgainstEst: true, sltInternal: true, bankedInternal: false, status: "active" },
  { id: "tt-focpm", timeCat: "FOCPM", timeTag: "FOC - Project Management", allocateAgainstInvoice: true, allocateAgainstEst: true, sltInternal: true, bankedInternal: false, status: "active" },

  { id: "tt-bk-cc", timeCat: "CC", timeTag: "BK - Chargeable Consultancy", allocateAgainstInvoice: true, allocateAgainstEst: true, sltInternal: true, bankedInternal: true, status: "active" },
  { id: "tt-bk-cd", timeCat: "CD", timeTag: "BK - Chargeable Development", allocateAgainstInvoice: true, allocateAgainstEst: true, sltInternal: true, bankedInternal: true, status: "active" },
  { id: "tt-bk-cpm", timeCat: "CPM", timeTag: "BK - Chargeable Project Management", allocateAgainstInvoice: true, allocateAgainstEst: true, sltInternal: true, bankedInternal: true, status: "active" },

  { id: "tt-ncc", timeCat: "NCC", timeTag: "NC - Consultancy", allocateAgainstInvoice: false, allocateAgainstEst: false, sltInternal: true, bankedInternal: false, status: "active" },
  { id: "tt-ncd", timeCat: "NCD", timeTag: "NC - Development", allocateAgainstInvoice: false, allocateAgainstEst: false, sltInternal: true, bankedInternal: false, status: "active" },
  { id: "tt-ncpm", timeCat: "NCPM", timeTag: "NC - Project Management", allocateAgainstInvoice: false, allocateAgainstEst: false, sltInternal: true, bankedInternal: false, status: "active" },
];

/**
 * Fixed anchor so the demo's seeded dates always land on the same real calendar dates — the
 * Monday of the current real-world week as of the last reseed (2026-09-16). Keep this current
 * (and bump SEED_VERSION) periodically so seeded Actions never drift into the past.
 */
export const SEED_START_DATE = new Date(2026, 8, 14);

export type DemoSeed = {
  customers: Customer[];
  projects: Project[];
  phases: Phase[];
  tasks: Task[];
  actions: Action[];
  resources: Resource[];
  calendarEvents: CalendarEvent[];
  timeTypes: TimeType[];
  timeEntries: TimeEntry[];
  adHocTimeEntries: AdHocTimeEntry[];
};

function iso(date: Date): string {
  return date.toISOString();
}

export function createSeedData(): DemoSeed {
  const customers: Customer[] = [
    { id: "cust-acme", name: "Acme Manufacturing Ltd", status: "active" },
    { id: "cust-meridian", name: "Meridian Financial Group", status: "active" },
  ];

  const projects: Project[] = [
    { id: "proj-x3-impl", customerId: "cust-acme", name: "X3 Implementation", code: "ACM-001", estimatedHours: 120, status: "active", riskStatus: "green" },
    { id: "proj-wh-auto2", customerId: "cust-acme", name: "Warehouse Automation Phase 2", code: "ACM-002", estimatedHours: 80, status: "active", riskStatus: "amber" },
    { id: "proj-legacy-erp", customerId: "cust-acme", name: "Legacy ERP Support", code: "ACM-003", estimatedHours: 40, status: "inactive" },

    { id: "proj-core-bank", customerId: "cust-meridian", name: "Core Banking Platform Upgrade", code: "MER-001", estimatedHours: 100, status: "active", riskStatus: "green" },
    { id: "proj-reg-report", customerId: "cust-meridian", name: "Regulatory Reporting Enhancement", code: "MER-002", estimatedHours: 60, status: "active" },
    { id: "proj-mer-archive", customerId: "cust-meridian", name: "Policy & Reporting Archive Cleanup", code: "MER-003", estimatedHours: 20, status: "inactive" },
  ];

  const phases: Phase[] = [
    { id: "phase-x3-design", projectId: "proj-x3-impl", name: "Design", estimatedHours: 35, status: "active", sortOrder: 1 },
    { id: "phase-x3-build", projectId: "proj-x3-impl", name: "Build", estimatedHours: 50, status: "active", sortOrder: 2 },

    { id: "phase-wh-integration", projectId: "proj-wh-auto2", name: "Integration Testing", estimatedHours: 30, status: "active", sortOrder: 1 },
    { id: "phase-wh-rollout", projectId: "proj-wh-auto2", name: "Rollout", estimatedHours: 25, status: "active", sortOrder: 2 },

    { id: "phase-legacy-support", projectId: "proj-legacy-erp", name: "Support Wind-down", estimatedHours: 10, status: "active", sortOrder: 1 },

    { id: "phase-cb-discovery", projectId: "proj-core-bank", name: "Discovery", estimatedHours: 40, status: "active", sortOrder: 1 },
    { id: "phase-cb-delivery", projectId: "proj-core-bank", name: "Delivery", estimatedHours: 60, status: "active", sortOrder: 2 },

    { id: "phase-reg-analysis", projectId: "proj-reg-report", name: "Analysis", estimatedHours: 20, status: "active", sortOrder: 1 },
    { id: "phase-reg-build", projectId: "proj-reg-report", name: "Build", estimatedHours: 30, status: "active", sortOrder: 2 },

    { id: "phase-mer-archive-cleanup", projectId: "proj-mer-archive", name: "Archive Cleanup", estimatedHours: 8, status: "active", sortOrder: 1 },
  ];

  const tasks: Task[] = [
    { id: "task-x3-scoping", phaseId: "phase-x3-design", name: "Scoping", estimatedHours: 20, status: "active", sortOrder: 1 },
    { id: "task-x3-review", phaseId: "phase-x3-design", name: "Internal Review", estimatedHours: 5, status: "active", sortOrder: 2 },
    { id: "task-x3-build-core", phaseId: "phase-x3-build", name: "Core Build", estimatedHours: 30, status: "active", sortOrder: 1 },

    { id: "task-wh-test-planning", phaseId: "phase-wh-integration", name: "Test Planning", estimatedHours: 12, status: "active", sortOrder: 1 },
    { id: "task-wh-test-exec", phaseId: "phase-wh-integration", name: "Test Execution", estimatedHours: 15, status: "active", sortOrder: 2 },
    { id: "task-wh-rollout-plan", phaseId: "phase-wh-rollout", name: "Rollout Planning", estimatedHours: 10, status: "active", sortOrder: 1 },

    { id: "task-legacy-handover", phaseId: "phase-legacy-support", name: "Handover Documentation", estimatedHours: 6, status: "active", sortOrder: 1 },

    { id: "task-cb-workshops", phaseId: "phase-cb-discovery", name: "Stakeholder Workshops", estimatedHours: 18, status: "active", sortOrder: 1 },
    { id: "task-cb-assessment", phaseId: "phase-cb-discovery", name: "Current-State Assessment", estimatedHours: 15, status: "active", sortOrder: 2 },
    { id: "task-cb-config", phaseId: "phase-cb-delivery", name: "Configuration", estimatedHours: 35, status: "active", sortOrder: 1 },
    { id: "task-cb-cutover", phaseId: "phase-cb-delivery", name: "Cutover Planning", estimatedHours: 10, status: "active", sortOrder: 2 },

    { id: "task-reg-gap-analysis", phaseId: "phase-reg-analysis", name: "Gap Analysis", estimatedHours: 12, status: "active", sortOrder: 1 },
    { id: "task-reg-report-build", phaseId: "phase-reg-build", name: "Report Build", estimatedHours: 18, status: "active", sortOrder: 1 },

    { id: "task-mer-archive-review", phaseId: "phase-mer-archive-cleanup", name: "Review Archived Policies", estimatedHours: 5, status: "active", sortOrder: 1 },
  ];

  // Week anchors, all falling this week or in the next 5 weeks (never further than 6 weeks out).
  const w0 = SEED_START_DATE; // this week (Mon 14 Sep) — only Wed/Thu/Fri are used below, since Mon/Tue have already passed
  const w1 = addDays(w0, 7);
  const w2 = addDays(w0, 14);
  const w3 = addDays(w0, 21);
  const w4 = addDays(w0, 28);
  const w5 = addDays(w0, 35);
  const day = (week: Date, offset: number) => addDays(week, offset); // offset: 0=Mon .. 4=Fri
  const dateStr = (week: Date, offset: number) => toDateInputValue(day(week, offset));

  const actions: Action[] = [
    { id: "action-x3-scope-session1", taskId: "task-x3-scoping", name: "Scoping Session 1", estimatedHours: 3, status: "active", sortOrder: 1, scheduledDate: dateStr(w0, 2), scheduledTime: "09:00" },
    { id: "action-x3-writeup", taskId: "task-x3-scoping", name: "Write-up", estimatedHours: 6, status: "active", sortOrder: 2, scheduledDate: dateStr(w0, 3), scheduledTime: "09:00" },
    { id: "action-x3-review-session", taskId: "task-x3-review", name: "Review Session", estimatedHours: 2, status: "active", sortOrder: 1, scheduledDate: dateStr(w0, 4), scheduledTime: "14:00" },
    { id: "action-x3-build-kickoff", taskId: "task-x3-build-core", name: "Build Kickoff", estimatedHours: 4, status: "active", sortOrder: 1, scheduledDate: dateStr(w1, 0), scheduledTime: "09:00" },
    { id: "action-x3-build-sprint1", taskId: "task-x3-build-core", name: "Sprint 1 Development", estimatedHours: 20, status: "active", sortOrder: 2, scheduledDate: dateStr(w1, 1), scheduledTime: "09:00" },

    { id: "action-wh-test-plan-draft", taskId: "task-wh-test-planning", name: "Draft Test Plan", estimatedHours: 5, status: "active", sortOrder: 1, scheduledDate: dateStr(w1, 2), scheduledTime: "10:00" },
    { id: "action-wh-test-exec-round1", taskId: "task-wh-test-exec", name: "Execute Test Round 1", estimatedHours: 8, status: "active", sortOrder: 1, scheduledDate: dateStr(w2, 0), scheduledTime: "09:00" },
    { id: "action-wh-rollout-comms", taskId: "task-wh-rollout-plan", name: "Prepare Rollout Comms", estimatedHours: 3, status: "active", sortOrder: 1, scheduledDate: dateStr(w2, 3), scheduledTime: "11:00" },

    { id: "action-legacy-handover-doc", taskId: "task-legacy-handover", name: "Finalise Handover Doc", estimatedHours: 4, status: "active", sortOrder: 1, scheduledDate: dateStr(w3, 1), scheduledTime: "09:00" },

    { id: "action-cb-workshop-prep", taskId: "task-cb-workshops", name: "Workshop Prep", estimatedHours: 4, status: "active", sortOrder: 1, scheduledDate: dateStr(w0, 4), scheduledTime: "09:00" },
    { id: "action-cb-facilitate", taskId: "task-cb-workshops", name: "Facilitate Workshops", estimatedHours: 10, status: "active", sortOrder: 2, scheduledDate: dateStr(w1, 2), scheduledTime: "09:00" },
    { id: "action-cb-assessment-review", taskId: "task-cb-assessment", name: "Assessment Review", estimatedHours: 6, status: "active", sortOrder: 1, scheduledDate: dateStr(w1, 4), scheduledTime: "13:00" },
    { id: "action-cb-config-env", taskId: "task-cb-config", name: "Configure Environment", estimatedHours: 12, status: "active", sortOrder: 1, scheduledDate: dateStr(w2, 1), scheduledTime: "09:00" },
    { id: "action-cb-cutover-plan", taskId: "task-cb-cutover", name: "Draft Cutover Plan", estimatedHours: 5, status: "active", sortOrder: 1, scheduledDate: dateStr(w3, 0), scheduledTime: "09:00" },

    { id: "action-reg-gap-review", taskId: "task-reg-gap-analysis", name: "Gap Analysis Review", estimatedHours: 5, status: "active", sortOrder: 1, scheduledDate: dateStr(w3, 3), scheduledTime: "10:00" },
    { id: "action-reg-report-draft", taskId: "task-reg-report-build", name: "Draft New Reports", estimatedHours: 8, status: "active", sortOrder: 1, scheduledDate: dateStr(w4, 0), scheduledTime: "09:00" },
    { id: "action-reg-report-review", taskId: "task-reg-report-build", name: "Internal QA Review", estimatedHours: 4, status: "active", sortOrder: 2, scheduledDate: dateStr(w5, 1), scheduledTime: "09:00" },

    { id: "action-mer-archive-check", taskId: "task-mer-archive-review", name: "Spot-check Archived Records", estimatedHours: 3, status: "active", sortOrder: 1, scheduledDate: dateStr(w4, 2), scheduledTime: "09:00" },
  ];

  const resources: Resource[] = [
    { id: "res-maya", name: "Maya Lad", role: "Project Manager", status: "active", isCurrentUser: true },
    { id: "res-graham", name: "Graham Gibbon", role: "Consultant", status: "active" },
    { id: "res-naomi", name: "Naomi Oates", role: "Project Manager", status: "active" },
    { id: "res-alfred", name: "Alfred Mlambo", role: "Consultant", status: "active" },
    { id: "res-chris", name: "Chris Shaw", role: "Consultant", status: "active" },
    { id: "res-kim", name: "Kim Oglesby", role: "Consultant", status: "active" },
    { id: "res-ragini", name: "Ragini Mulay", role: "Developer", status: "active" },
  ];

  let eventCounter = 0;
  const nextEventId = () => `evt-${(eventCounter += 1)}`;
  const event = (input: Omit<CalendarEvent, "id">): CalendarEvent => ({ id: nextEventId(), ...input });

  // Every resource other than Graham Gibbon (who is kept deliberately unbooked, for the PM to
  // demo assignment against) has a light spread of personal calendar commitments — Teams
  // Meetings and Annual Leave — across the six seeded weeks. No Action has a resourceId, so
  // none of these are "trax3ion"-sourced project bookings.
  const calendarEvents: CalendarEvent[] = [
    // Week 0 (this week — only non-past days used)
    event({ resourceId: "res-maya", title: "Teams Meeting — Internal Sync", start: iso(atTime(day(w0, 2), 9)), end: iso(atTime(day(w0, 2), 9, 30)), source: "outlook" }),
    event({ resourceId: "res-naomi", title: "Teams Meeting", start: iso(atTime(day(w0, 3), 10)), end: iso(atTime(day(w0, 3), 11)), source: "outlook" }),
    event({ resourceId: "res-alfred", title: "Annual Leave", start: iso(atTime(day(w0, 2), 9)), end: iso(atTime(day(w0, 2), 17)), source: "outlook" }),
    event({ resourceId: "res-alfred", title: "Annual Leave", start: iso(atTime(day(w0, 3), 9)), end: iso(atTime(day(w0, 3), 17)), source: "outlook" }),
    event({ resourceId: "res-chris", title: "Teams Meeting", start: iso(atTime(day(w0, 4), 14)), end: iso(atTime(day(w0, 4), 15)), source: "outlook" }),
    event({ resourceId: "res-ragini", title: "Teams Meeting", start: iso(atTime(day(w0, 2), 11)), end: iso(atTime(day(w0, 2), 12)), source: "outlook" }),

    // Week 1
    event({ resourceId: "res-maya", title: "Teams Meeting — PMO Sync", start: iso(atTime(day(w1, 3), 10)), end: iso(atTime(day(w1, 3), 11)), source: "outlook" }),
    event({ resourceId: "res-naomi", title: "Annual Leave", start: iso(atTime(day(w1, 1), 9)), end: iso(atTime(day(w1, 1), 17)), source: "outlook" }),
    event({ resourceId: "res-alfred", title: "Teams Meeting", start: iso(atTime(day(w1, 0), 9)), end: iso(atTime(day(w1, 0), 10)), source: "outlook" }),
    event({ resourceId: "res-chris", title: "Annual Leave", start: iso(atTime(day(w1, 2), 9)), end: iso(atTime(day(w1, 2), 17)), source: "outlook" }),
    event({ resourceId: "res-chris", title: "Annual Leave", start: iso(atTime(day(w1, 3), 9)), end: iso(atTime(day(w1, 3), 17)), source: "outlook" }),
    event({ resourceId: "res-kim", title: "Teams Meeting", start: iso(atTime(day(w1, 4), 9)), end: iso(atTime(day(w1, 4), 9, 30)), source: "outlook" }),
    event({ resourceId: "res-ragini", title: "Teams Meeting", start: iso(atTime(day(w1, 1), 13)), end: iso(atTime(day(w1, 1), 14)), source: "outlook" }),

    // Week 2
    event({ resourceId: "res-maya", title: "Teams Meeting", start: iso(atTime(day(w2, 0), 9)), end: iso(atTime(day(w2, 0), 9, 30)), source: "outlook" }),
    event({ resourceId: "res-naomi", title: "Teams Meeting", start: iso(atTime(day(w2, 2), 10)), end: iso(atTime(day(w2, 2), 11)), source: "outlook" }),
    event({ resourceId: "res-alfred", title: "Teams Meeting", start: iso(atTime(day(w2, 4), 9)), end: iso(atTime(day(w2, 4), 10)), source: "outlook" }),
    event({ resourceId: "res-chris", title: "Teams Meeting", start: iso(atTime(day(w2, 1), 14)), end: iso(atTime(day(w2, 1), 15)), source: "outlook" }),
    event({ resourceId: "res-kim", title: "Annual Leave", start: iso(atTime(day(w2, 3), 9)), end: iso(atTime(day(w2, 3), 17)), source: "outlook" }),
    event({ resourceId: "res-ragini", title: "Annual Leave", start: iso(atTime(day(w2, 0), 9)), end: iso(atTime(day(w2, 0), 17)), source: "outlook" }),
    event({ resourceId: "res-ragini", title: "Annual Leave", start: iso(atTime(day(w2, 1), 9)), end: iso(atTime(day(w2, 1), 17)), source: "outlook" }),

    // Week 3
    event({ resourceId: "res-maya", title: "Teams Meeting", start: iso(atTime(day(w3, 2), 9)), end: iso(atTime(day(w3, 2), 9, 30)), source: "outlook" }),
    event({ resourceId: "res-naomi", title: "Teams Meeting", start: iso(atTime(day(w3, 0), 10)), end: iso(atTime(day(w3, 0), 11)), source: "outlook" }),
    event({ resourceId: "res-alfred", title: "Annual Leave", start: iso(atTime(day(w3, 3), 9)), end: iso(atTime(day(w3, 3), 17)), source: "outlook" }),
    event({ resourceId: "res-chris", title: "Teams Meeting", start: iso(atTime(day(w3, 4), 11)), end: iso(atTime(day(w3, 4), 12)), source: "outlook" }),
    event({ resourceId: "res-kim", title: "Teams Meeting", start: iso(atTime(day(w3, 1), 9)), end: iso(atTime(day(w3, 1), 9, 30)), source: "outlook" }),
    event({ resourceId: "res-ragini", title: "Teams Meeting", start: iso(atTime(day(w3, 2), 13)), end: iso(atTime(day(w3, 2), 14)), source: "outlook" }),

    // Week 4
    event({ resourceId: "res-maya", title: "Annual Leave", start: iso(atTime(day(w4, 0), 9)), end: iso(atTime(day(w4, 0), 17)), source: "outlook" }),
    event({ resourceId: "res-maya", title: "Annual Leave", start: iso(atTime(day(w4, 1), 9)), end: iso(atTime(day(w4, 1), 17)), source: "outlook" }),
    event({ resourceId: "res-naomi", title: "Teams Meeting", start: iso(atTime(day(w4, 3), 9)), end: iso(atTime(day(w4, 3), 10)), source: "outlook" }),
    event({ resourceId: "res-alfred", title: "Teams Meeting", start: iso(atTime(day(w4, 2), 14)), end: iso(atTime(day(w4, 2), 15)), source: "outlook" }),
    event({ resourceId: "res-chris", title: "Teams Meeting", start: iso(atTime(day(w4, 0), 9)), end: iso(atTime(day(w4, 0), 9, 30)), source: "outlook" }),
    event({ resourceId: "res-kim", title: "Teams Meeting", start: iso(atTime(day(w4, 4), 10)), end: iso(atTime(day(w4, 4), 11)), source: "outlook" }),
    event({ resourceId: "res-ragini", title: "Teams Meeting", start: iso(atTime(day(w4, 1), 9)), end: iso(atTime(day(w4, 1), 10)), source: "outlook" }),

    // Week 5
    event({ resourceId: "res-maya", title: "Teams Meeting", start: iso(atTime(day(w5, 1), 9)), end: iso(atTime(day(w5, 1), 9, 30)), source: "outlook" }),
    event({ resourceId: "res-naomi", title: "Teams Meeting", start: iso(atTime(day(w5, 3), 13)), end: iso(atTime(day(w5, 3), 14)), source: "outlook" }),
    event({ resourceId: "res-alfred", title: "Teams Meeting", start: iso(atTime(day(w5, 0), 9)), end: iso(atTime(day(w5, 0), 10)), source: "outlook" }),
    event({ resourceId: "res-chris", title: "Annual Leave", start: iso(atTime(day(w5, 2), 9)), end: iso(atTime(day(w5, 2), 17)), source: "outlook" }),
    event({ resourceId: "res-kim", title: "Teams Meeting", start: iso(atTime(day(w5, 4), 9)), end: iso(atTime(day(w5, 4), 9, 30)), source: "outlook" }),
    event({ resourceId: "res-ragini", title: "Teams Meeting", start: iso(atTime(day(w5, 0), 10)), end: iso(atTime(day(w5, 0), 11)), source: "outlook" }),
  ];

  const adHocTimeEntries: AdHocTimeEntry[] = [];

  return { customers, projects, phases, tasks, actions, resources, calendarEvents, timeTypes: TIME_TYPES, timeEntries: [], adHocTimeEntries };
}
