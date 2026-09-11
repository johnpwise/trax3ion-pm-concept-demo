type AllocationBarProps = {
  estimatedHours: number;
  allocatedHours: number;
  size?: "sm" | "md";
};

export default function AllocationBar({ estimatedHours, allocatedHours, size = "md" }: AllocationBarProps) {
  const remaining = estimatedHours - allocatedHours;
  const percent = estimatedHours > 0 ? Math.min(100, Math.round((allocatedHours / estimatedHours) * 100)) : 0;
  const barColor = percent >= 100 ? "bg-primary" : percent >= 85 ? "bg-amber-500" : "bg-primary";
  const height = size === "sm" ? "h-1.5" : "h-2";

  return (
    <div className="w-full">
      <div className={`w-full overflow-hidden rounded-full bg-muted ${height}`}>
        <div className={`${height} rounded-full ${barColor} transition-all`} style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Allocated {allocatedHours}h of {estimatedHours}h ({percent}%)
        </span>
        <span>{remaining}h remaining</span>
      </div>
    </div>
  );
}
