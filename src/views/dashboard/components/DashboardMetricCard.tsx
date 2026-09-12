import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type DashboardMetricCardProps = {
  icon: LucideIcon;
  iconClassName?: string;
  label: string;
  value: ReactNode;
  helperText?: string;
  to?: string;
};

export default function DashboardMetricCard({ icon: Icon, iconClassName, label, value, helperText, to }: DashboardMetricCardProps) {
  const content = (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${iconClassName ?? "bg-primary/10 text-primary"}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold text-surface-foreground">{value}</p>
        {helperText ? <p className="mt-0.5 text-xs text-muted-foreground">{helperText}</p> : null}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        {content}
      </Link>
    );
  }

  return content;
}
