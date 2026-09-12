import { PX_PER_HOUR, TIME_GUTTER_WIDTH_PX, formatHourLabel, getHourMarks, type HourRange } from "../calendar-grid";

type CalendarHourGutterProps = {
  range: HourRange;
};

export default function CalendarHourGutter({ range }: CalendarHourGutterProps) {
  const hours = getHourMarks(range);

  return (
    <div className="relative shrink-0 border-r border-border" style={{ width: TIME_GUTTER_WIDTH_PX }}>
      {hours.map((hour) => (
        <div
          key={hour}
          className="absolute right-2 -translate-y-1/2 text-[11px] text-muted-foreground"
          style={{ top: (hour - range.startHour) * PX_PER_HOUR }}
        >
          {formatHourLabel(hour)}
        </div>
      ))}
    </div>
  );
}
