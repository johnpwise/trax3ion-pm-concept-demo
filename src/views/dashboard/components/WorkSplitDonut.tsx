type WorkSplitDonutProps = {
  projectHours: number;
  adHocHours: number;
  projectPercent: number;
  adHocPercent: number;
  mode: "percent" | "hours";
  size?: number;
};

export default function WorkSplitDonut({ projectHours, adHocHours, projectPercent, adHocPercent, mode, size = 104 }: WorkSplitDonutProps) {
  const totalHours = projectHours + adHocHours;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const isEmpty = totalHours === 0;
  const projectLength = isEmpty ? 0 : (projectHours / totalHours) * circumference;
  const adHocLength = circumference - projectLength;

  const centerLabel = isEmpty ? "—" : mode === "hours" ? `${totalHours}h` : "100%";

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shrink-0"
        role="img"
        aria-label={isEmpty ? "No time logged yet this week" : `${projectPercent}% Project Actions, ${adHocPercent}% Ad-Hoc this week`}
      >
        <circle cx={center} cy={center} r={radius} strokeWidth={strokeWidth} className="fill-none stroke-muted" />
        {!isEmpty ? (
          <>
            <circle
              cx={center}
              cy={center}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={`${projectLength} ${circumference - projectLength}`}
              strokeDashoffset={0}
              strokeLinecap="butt"
              className="fill-none stroke-primary transition-all"
              transform={`rotate(-90 ${center} ${center})`}
            />
            <circle
              cx={center}
              cy={center}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={`${adHocLength} ${circumference - adHocLength}`}
              strokeDashoffset={-projectLength}
              strokeLinecap="butt"
              className="fill-none stroke-chart-5 transition-all"
              transform={`rotate(-90 ${center} ${center})`}
            />
          </>
        ) : null}
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="fill-surface-foreground text-[15px] font-semibold">
          {centerLabel}
        </text>
      </svg>

      {isEmpty ? (
        <p className="text-xs text-muted-foreground">No time logged yet this week</p>
      ) : (
        <div className="flex w-full flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
              Project Actions
            </span>
            <span className="font-medium text-surface-foreground">{mode === "hours" ? `${projectHours}h` : `${projectPercent}%`}</span>
          </div>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-2 w-2 shrink-0 rounded-full bg-chart-5" />
              Ad-Hoc
            </span>
            <span className="font-medium text-surface-foreground">{mode === "hours" ? `${adHocHours}h` : `${adHocPercent}%`}</span>
          </div>
        </div>
      )}
    </div>
  );
}
