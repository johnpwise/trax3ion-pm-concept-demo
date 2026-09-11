import { CalendarClock, FolderKanban, Gauge, TriangleAlert, Users, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";

import PageHeader from "../../app/PageHeader";
import {
  getActiveCustomerCount,
  getActiveProjectCount,
  getProjectsAtRiskCount,
  getResourceUtilisationPercent,
  getUnallocatedEstimateHours,
  getUpcomingBookingsCount,
} from "../../store/selectors/dashboardSelectors";
import { useTraxionDemoStore } from "../../store/useTraxionDemoStore";
import DashboardMetricCard from "./components/DashboardMetricCard";
import UtilisationRing from "./components/UtilisationRing";

export default function DashboardView() {
  const projects = useTraxionDemoStore((state) => state.projects);
  const customers = useTraxionDemoStore((state) => state.customers);
  const phases = useTraxionDemoStore((state) => state.phases);
  const resources = useTraxionDemoStore((state) => state.resources);
  const calendarEvents = useTraxionDemoStore((state) => state.calendarEvents);
  const visibleWeekStart = useTraxionDemoStore((state) => state.visibleWeekStart);

  const activeProjects = getActiveProjectCount(projects);
  const activeCustomers = getActiveCustomerCount(customers);
  const projectsAtRisk = getProjectsAtRiskCount(projects);
  const upcomingBookings = getUpcomingBookingsCount(calendarEvents);
  const unallocatedEstimate = getUnallocatedEstimateHours(projects, phases);
  const utilisation = getResourceUtilisationPercent(resources, calendarEvents, new Date(visibleWeekStart));

  return (
    <div>
      <PageHeader title="Dashboard" description="An operational snapshot of active work across the practice." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardMetricCard icon={FolderKanban} label="Active Projects" value={activeProjects} to="/projects?status=active" />
        <DashboardMetricCard
          icon={Users}
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          label="Active Customers"
          value={activeCustomers}
          to="/customers"
        />

        <Link
          to="/scheduler"
          className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <UtilisationRing percent={utilisation} />
          <div>
            <p className="text-sm text-muted-foreground">Resource Utilisation</p>
            <p className="text-xs text-muted-foreground">Booked hours this week across active Resources</p>
          </div>
        </Link>

        <DashboardMetricCard
          icon={TriangleAlert}
          iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          label="Projects at Risk"
          value={projectsAtRisk}
          helperText="Active projects flagged amber or red"
        />
        <DashboardMetricCard
          icon={CalendarClock}
          label="Upcoming Bookings"
          value={upcomingBookings}
          to="/scheduler"
          helperText="Trax3ion bookings from now onward"
        />
        <DashboardMetricCard
          icon={Clock3}
          iconClassName="bg-primary/10 text-primary"
          label="Unallocated Estimate"
          value={`${unallocatedEstimate}h`}
          helperText="Remaining hours yet to allocate to phases"
        />
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-border bg-surface p-5 text-sm text-muted-foreground">
        <div className="flex items-start gap-3">
          <Gauge className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            This is a concept demonstration of Trax3ion PM. All figures are derived from seeded demo data held in this browser session — no
            production data, database or Microsoft 365 connection is involved.
          </p>
        </div>
      </div>
    </div>
  );
}
