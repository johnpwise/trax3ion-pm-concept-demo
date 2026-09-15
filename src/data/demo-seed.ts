import type { Action, CalendarEvent, Customer, Phase, Project, Resource, Task } from "../types/domain";
import { addDays, atTime } from "../views/scheduler/calendar-utils";

export const SEED_VERSION = 8;

/** Fixed anchor so the demo's seeded bookings always land on the same real calendar dates (Monday 21 Sep 2026). */
export const SEED_START_DATE = new Date(2026, 8, 21);

export type DemoSeed = {
  customers: Customer[];
  projects: Project[];
  phases: Phase[];
  tasks: Task[];
  actions: Action[];
  resources: Resource[];
  calendarEvents: CalendarEvent[];
};

function iso(date: Date): string {
  return date.toISOString();
}

export function createSeedData(): DemoSeed {
  const customers: Customer[] = [
    { id: "cust-acme", name: "Acme Manufacturing Ltd", status: "active" },
    { id: "cust-meridian", name: "Meridian Financial Group", status: "active" },
    { id: "cust-northwind", name: "Northwind Logistics", status: "active" },
    { id: "cust-beacon", name: "Beacon Health Systems", status: "active" },
    { id: "cust-silverline", name: "Silverline Retail Co", status: "active" },
    { id: "cust-orion", name: "Orion Energy Partners", status: "active" },
    { id: "cust-blueharbor", name: "Blue Harbor Insurance", status: "active" },
    { id: "cust-demo-mfg", name: "Demo Manufacturing Ltd", status: "active" },
  ];

  const projects: Project[] = [
    { id: "proj-x3-impl", customerId: "cust-acme", name: "X3 Implementation", code: "ACM-001", estimatedHours: 120, status: "active", riskStatus: "green" },
    { id: "proj-wh-auto2", customerId: "cust-acme", name: "Warehouse Automation Phase 2", code: "ACM-002", estimatedHours: 80, status: "active", riskStatus: "amber" },
    { id: "proj-legacy-erp", customerId: "cust-acme", name: "Legacy ERP Support", code: "ACM-003", estimatedHours: 40, status: "inactive" },

    { id: "proj-core-bank", customerId: "cust-meridian", name: "Core Banking Platform Upgrade", code: "MER-001", estimatedHours: 100, status: "active", riskStatus: "green" },
    { id: "proj-reg-report", customerId: "cust-meridian", name: "Regulatory Reporting Enhancement", code: "MER-002", estimatedHours: 60, status: "active" },

    { id: "proj-fleet-track", customerId: "cust-northwind", name: "Fleet Tracking Rollout", code: "NW-001", estimatedHours: 90, status: "active" },
    { id: "proj-wms-upgrade", customerId: "cust-northwind", name: "Warehouse Management Upgrade", code: "NW-002", estimatedHours: 70, status: "active", riskStatus: "red" },
    { id: "proj-route-opt", customerId: "cust-northwind", name: "Route Optimisation Pilot", code: "NW-003", estimatedHours: 25, status: "inactive" },

    { id: "proj-patient-portal", customerId: "cust-beacon", name: "Patient Portal Refresh", code: "BHS-001", estimatedHours: 55, status: "active" },
    { id: "proj-ehr-migration", customerId: "cust-beacon", name: "EHR Data Migration", code: "BHS-002", estimatedHours: 45, status: "inactive" },

    { id: "proj-pos-rollout", customerId: "cust-silverline", name: "POS Rollout — Phase 1", code: "SLR-001", estimatedHours: 65, status: "active" },
    { id: "proj-loyalty-app", customerId: "cust-silverline", name: "Loyalty App Integration", code: "SLR-002", estimatedHours: 30, status: "active" },
    { id: "proj-store-refresh", customerId: "cust-silverline", name: "Store Refresh Programme", code: "SLR-003", estimatedHours: 20, status: "inactive" },

    { id: "proj-grid-analytics", customerId: "cust-orion", name: "Grid Analytics Dashboard", code: "ORN-001", estimatedHours: 50, status: "active" },
    { id: "proj-field-mobility", customerId: "cust-orion", name: "Field Mobility App", code: "ORN-002", estimatedHours: 35, status: "active" },

    { id: "proj-claims-auto", customerId: "cust-blueharbor", name: "Claims Automation", code: "BHI-001", estimatedHours: 48, status: "active" },
    { id: "proj-policy-archive", customerId: "cust-blueharbor", name: "Policy Archive Cleanup", code: "BHI-002", estimatedHours: 15, status: "inactive" },
  ];

  const phases: Phase[] = [
    { id: "phase-x3-design", projectId: "proj-x3-impl", name: "Design", estimatedHours: 35, status: "active", sortOrder: 1 },
    { id: "phase-x3-build", projectId: "proj-x3-impl", name: "Build", estimatedHours: 50, status: "active", sortOrder: 2 },

    { id: "phase-cb-discovery", projectId: "proj-core-bank", name: "Discovery", estimatedHours: 40, status: "active", sortOrder: 1 },
    { id: "phase-cb-delivery", projectId: "proj-core-bank", name: "Delivery", estimatedHours: 60, status: "active", sortOrder: 2 },

    { id: "phase-wh-integration", projectId: "proj-wh-auto2", name: "Integration Testing", estimatedHours: 30, status: "active", sortOrder: 1 },
    { id: "phase-wh-rollout", projectId: "proj-wh-auto2", name: "Rollout", estimatedHours: 25, status: "active", sortOrder: 2 },
  ];

  const tasks: Task[] = [
    { id: "task-x3-scoping", phaseId: "phase-x3-design", name: "Scoping", estimatedHours: 20, status: "active", sortOrder: 1 },
    { id: "task-x3-review", phaseId: "phase-x3-design", name: "Internal Review", estimatedHours: 5, status: "active", sortOrder: 2 },

    { id: "task-cb-workshops", phaseId: "phase-cb-discovery", name: "Stakeholder Workshops", estimatedHours: 18, status: "active", sortOrder: 1 },
    { id: "task-cb-assessment", phaseId: "phase-cb-discovery", name: "Current-State Assessment", estimatedHours: 15, status: "active", sortOrder: 2 },
    { id: "task-cb-config", phaseId: "phase-cb-delivery", name: "Configuration", estimatedHours: 35, status: "active", sortOrder: 1 },
    { id: "task-cb-cutover", phaseId: "phase-cb-delivery", name: "Cutover Planning", estimatedHours: 10, status: "active", sortOrder: 2 },

    { id: "task-wh-test-planning", phaseId: "phase-wh-integration", name: "Test Planning", estimatedHours: 12, status: "active", sortOrder: 1 },
    { id: "task-wh-test-exec", phaseId: "phase-wh-integration", name: "Test Execution", estimatedHours: 15, status: "active", sortOrder: 2 },
  ];

  const actions: Action[] = [
    { id: "action-x3-scope-session1", taskId: "task-x3-scoping", name: "Scoping Session 1", estimatedHours: 3, status: "active", sortOrder: 1, resourceId: "res-naomi", scheduledDate: "2026-09-21", scheduledTime: "09:00" },
    { id: "action-x3-writeup", taskId: "task-x3-scoping", name: "Write-up", estimatedHours: 6, status: "active", sortOrder: 2, resourceId: "res-naomi", scheduledDate: "2026-09-25", scheduledTime: "09:00" },

    { id: "action-cb-workshop-prep", taskId: "task-cb-workshops", name: "Workshop Prep", estimatedHours: 4, status: "active", sortOrder: 1 },
    { id: "action-cb-facilitate", taskId: "task-cb-workshops", name: "Facilitate Workshops", estimatedHours: 10, status: "active", sortOrder: 2 },
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

  const w0 = SEED_START_DATE;
  const w1 = addDays(w0, 7);
  const w2 = addDays(w0, 14);
  const w3 = addDays(w0, 21);
  const day = (week: Date, offset: number) => addDays(week, offset);

  let eventCounter = 0;
  const nextEventId = () => `evt-${(eventCounter += 1)}`;

  const event = (input: Omit<CalendarEvent, "id">): CalendarEvent => ({ id: nextEventId(), ...input });

  const calendarEvents: CalendarEvent[] = [
    // res-maya — Project Manager's own calendar: light, mostly free
    event({ resourceId: "res-maya", title: "Internal Standup", start: iso(atTime(day(w0, 0), 9)), end: iso(atTime(day(w0, 0), 9, 30)), source: "outlook" }),
    event({ resourceId: "res-maya", title: "Client Check-in — X3 Implementation", start: iso(atTime(day(w0, 2), 13)), end: iso(atTime(day(w0, 2), 14)), source: "trax3ion", customerId: "cust-acme", projectId: "proj-x3-impl" }),
    event({ resourceId: "res-maya", title: "PMO Sync", start: iso(atTime(day(w1, 3), 10)), end: iso(atTime(day(w1, 3), 11)), source: "outlook" }),

    // res-graham — heavily booked across both weeks
    event({ resourceId: "res-graham", title: "Core Banking Platform Upgrade", start: iso(atTime(day(w0, 0), 9)), end: iso(atTime(day(w0, 0), 17)), source: "trax3ion", customerId: "cust-meridian", projectId: "proj-core-bank" }),
    event({ resourceId: "res-graham", title: "Core Banking Platform Upgrade", start: iso(atTime(day(w0, 1), 9)), end: iso(atTime(day(w0, 1), 12)), source: "trax3ion", customerId: "cust-meridian", projectId: "proj-core-bank" }),
    event({ resourceId: "res-graham", title: "Regulatory Reporting Enhancement", start: iso(atTime(day(w0, 1), 13)), end: iso(atTime(day(w0, 1), 17)), source: "trax3ion", customerId: "cust-meridian", projectId: "proj-reg-report" }),
    event({ resourceId: "res-graham", title: "Core Banking Platform Upgrade", start: iso(atTime(day(w0, 2), 9)), end: iso(atTime(day(w0, 2), 17)), source: "trax3ion", customerId: "cust-meridian", projectId: "proj-core-bank" }),
    event({ resourceId: "res-graham", title: "Team Planning", start: iso(atTime(day(w0, 3), 9)), end: iso(atTime(day(w0, 3), 12)), source: "outlook" }),
    event({ resourceId: "res-graham", title: "Core Banking Platform Upgrade", start: iso(atTime(day(w0, 3), 13)), end: iso(atTime(day(w0, 3), 17)), source: "trax3ion", customerId: "cust-meridian", projectId: "proj-core-bank" }),
    event({ resourceId: "res-graham", title: "Core Banking Platform Upgrade", start: iso(atTime(day(w0, 4), 9)), end: iso(atTime(day(w0, 4), 15)), source: "trax3ion", customerId: "cust-meridian", projectId: "proj-core-bank" }),
    event({ resourceId: "res-graham", title: "Core Banking Platform Upgrade", start: iso(atTime(day(w1, 0), 9)), end: iso(atTime(day(w1, 0), 17)), source: "trax3ion", customerId: "cust-meridian", projectId: "proj-core-bank" }),
    event({ resourceId: "res-graham", title: "Regulatory Reporting Enhancement", start: iso(atTime(day(w1, 1), 9)), end: iso(atTime(day(w1, 1), 13)), source: "trax3ion", customerId: "cust-meridian", projectId: "proj-reg-report" }),

    // res-naomi — a booking and a separate calendar commitment on the same day
    event({ resourceId: "res-naomi", title: "X3 Implementation — Scoping", start: iso(atTime(day(w0, 0), 9)), end: iso(atTime(day(w0, 0), 12)), source: "trax3ion", customerId: "cust-acme", projectId: "proj-x3-impl", actionId: "action-x3-scope-session1" }),
    event({ resourceId: "res-naomi", title: "Teams Meeting — Internal Sync", start: iso(atTime(day(w0, 0), 13)), end: iso(atTime(day(w0, 0), 14)), source: "outlook" }),
    event({ resourceId: "res-naomi", title: "Teams Meeting", start: iso(atTime(day(w0, 2), 10)), end: iso(atTime(day(w0, 2), 12)), source: "outlook" }),
    event({ resourceId: "res-naomi", title: "Warehouse Automation Phase 2", start: iso(atTime(day(w0, 3), 9)), end: iso(atTime(day(w0, 3), 13)), source: "trax3ion", customerId: "cust-acme", projectId: "proj-wh-auto2" }),
    event({ resourceId: "res-naomi", title: "X3 Implementation — Write-up", start: iso(atTime(day(w0, 4), 9)), end: iso(atTime(day(w0, 4), 15)), source: "trax3ion", customerId: "cust-acme", projectId: "proj-x3-impl", actionId: "action-x3-writeup" }),
    event({ resourceId: "res-naomi", title: "Warehouse Automation Phase 2", start: iso(atTime(day(w1, 1), 9)), end: iso(atTime(day(w1, 1), 12)), source: "trax3ion", customerId: "cust-acme", projectId: "proj-wh-auto2" }),

    // res-alfred — annual leave plus a booking later in the week
    event({ resourceId: "res-alfred", title: "Annual Leave", start: iso(atTime(day(w0, 1), 9)), end: iso(atTime(day(w0, 1), 17)), source: "outlook" }),
    event({ resourceId: "res-alfred", title: "Annual Leave", start: iso(atTime(day(w0, 2), 9)), end: iso(atTime(day(w0, 2), 17)), source: "outlook" }),
    event({ resourceId: "res-alfred", title: "Claims Automation", start: iso(atTime(day(w0, 3), 9)), end: iso(atTime(day(w0, 3), 12)), source: "trax3ion", customerId: "cust-blueharbor", projectId: "proj-claims-auto" }),

    // res-chris — light-moderate
    event({ resourceId: "res-chris", title: "Fleet Tracking Rollout", start: iso(atTime(day(w0, 0), 9)), end: iso(atTime(day(w0, 0), 12)), source: "trax3ion", customerId: "cust-northwind", projectId: "proj-fleet-track" }),
    event({ resourceId: "res-chris", title: "Grid Analytics Dashboard", start: iso(atTime(day(w0, 2), 14)), end: iso(atTime(day(w0, 2), 17)), source: "trax3ion", customerId: "cust-orion", projectId: "proj-grid-analytics" }),
    event({ resourceId: "res-chris", title: "Teams Meeting", start: iso(atTime(day(w1, 4), 9)), end: iso(atTime(day(w1, 4), 11)), source: "outlook" }),

    // res-kim — mostly free
    event({ resourceId: "res-kim", title: "Internal Standup", start: iso(atTime(day(w0, 2), 9)), end: iso(atTime(day(w0, 2), 9, 30)), source: "outlook" }),

    // --- Weeks 3 and 4 (w2, w3) — deliberately sparser than w0/w1, leaving clear gaps ---
    // so a PM can demonstrate assigning a Resource against a Task/Action without hitting conflicts.

    // res-maya — one light touch, otherwise fully open
    event({ resourceId: "res-maya", title: "Client Check-in — X3 Implementation", start: iso(atTime(day(w2, 1), 13)), end: iso(atTime(day(w2, 1), 14)), source: "trax3ion", customerId: "cust-acme", projectId: "proj-x3-impl" }),

    // res-graham — busy early in w2, then fully open for the rest of w2 and all of w3
    event({ resourceId: "res-graham", title: "Core Banking Platform Upgrade", start: iso(atTime(day(w2, 0), 9)), end: iso(atTime(day(w2, 0), 17)), source: "trax3ion", customerId: "cust-meridian", projectId: "proj-core-bank" }),
    event({ resourceId: "res-graham", title: "Regulatory Reporting Enhancement", start: iso(atTime(day(w2, 1), 9)), end: iso(atTime(day(w2, 1), 12)), source: "trax3ion", customerId: "cust-meridian", projectId: "proj-reg-report" }),

    // res-naomi — a booking and a commitment in w2, one booking in w3, rest open
    event({ resourceId: "res-naomi", title: "X3 Implementation — Scoping", start: iso(atTime(day(w2, 0), 9)), end: iso(atTime(day(w2, 0), 12)), source: "trax3ion", customerId: "cust-acme", projectId: "proj-x3-impl" }),
    event({ resourceId: "res-naomi", title: "Teams Meeting", start: iso(atTime(day(w2, 2), 10)), end: iso(atTime(day(w2, 2), 11)), source: "outlook" }),
    event({ resourceId: "res-naomi", title: "Warehouse Automation Phase 2", start: iso(atTime(day(w3, 1), 9)), end: iso(atTime(day(w3, 1), 13)), source: "trax3ion", customerId: "cust-acme", projectId: "proj-wh-auto2" }),

    // res-alfred — a single day of annual leave in w2, a booking in w3, rest open
    event({ resourceId: "res-alfred", title: "Annual Leave", start: iso(atTime(day(w2, 0), 9)), end: iso(atTime(day(w2, 0), 17)), source: "outlook" }),
    event({ resourceId: "res-alfred", title: "Claims Automation", start: iso(atTime(day(w3, 3), 9)), end: iso(atTime(day(w3, 3), 12)), source: "trax3ion", customerId: "cust-blueharbor", projectId: "proj-claims-auto" }),

    // res-kim — mostly free across both weeks, one meeting and one booking
    event({ resourceId: "res-kim", title: "Internal Standup", start: iso(atTime(day(w2, 2), 9)), end: iso(atTime(day(w2, 2), 9, 30)), source: "outlook" }),
    event({ resourceId: "res-kim", title: "Grid Analytics Dashboard", start: iso(atTime(day(w2, 3), 13)), end: iso(atTime(day(w2, 3), 16)), source: "trax3ion", customerId: "cust-orion", projectId: "proj-grid-analytics" }),

    // res-ragini — otherwise fully unbooked; one booking to keep her calendar realistic
    event({ resourceId: "res-ragini", title: "Fleet Tracking Rollout", start: iso(atTime(day(w2, 1), 9)), end: iso(atTime(day(w2, 1), 12)), source: "trax3ion", customerId: "cust-northwind", projectId: "proj-fleet-track" }),
  ];

  return { customers, projects, phases, tasks, actions, resources, calendarEvents };
}
