type HoursSummaryProps = {
  estimatedHours: number;
  allocatedHours: number;
};

export default function HoursSummary({ estimatedHours, allocatedHours }: HoursSummaryProps) {
  const remaining = estimatedHours - allocatedHours;

  return (
    <div className="flex flex-wrap gap-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Estimate</p>
        <p className="text-lg font-semibold text-surface-foreground">{estimatedHours}h</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Allocated to children</p>
        <p className="text-lg font-semibold text-surface-foreground">{allocatedHours}h</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Remaining</p>
        <p className={`text-lg font-semibold ${remaining < 0 ? "text-destructive" : "text-primary"}`}>{remaining}h</p>
      </div>
    </div>
  );
}
