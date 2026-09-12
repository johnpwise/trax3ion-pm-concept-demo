import type { EntityStatus, RiskStatus } from "../../types/domain";

const STATUS_STYLES: Record<EntityStatus, string> = {
  active: "bg-primary/10 text-primary border-primary-line",
  inactive: "bg-muted text-muted-foreground border-border",
};

const RISK_STYLES: Record<RiskStatus, { label: string; className: string }> = {
  green: { label: "On track", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400" },
  amber: { label: "At risk", className: "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400" },
  red: { label: "At risk", className: "bg-red-500/10 text-red-600 border-red-500/30 dark:text-red-400" },
};

export function StatusBadge({ status }: { status: EntityStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

export function RiskBadge({ riskStatus }: { riskStatus: RiskStatus }) {
  const { label, className } = RISK_STYLES[riskStatus];
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}>{label}</span>;
}
