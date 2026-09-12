import { SCHEDULED_TIME_INPUT_TEST_IDS } from "./ScheduledTimeInput.testIds";

type ScheduledTimeInputProps = {
  value?: string;
  onChange?: (time: string | undefined) => void;
  placeholder?: string;
};

export default function ScheduledTimeInput({ value, onChange, placeholder = "No time" }: ScheduledTimeInputProps) {
  if (!onChange) {
    return (
      <span className={`block truncate text-sm ${value ? "text-surface-foreground" : "text-muted-foreground"}`}>
        {value ?? placeholder}
      </span>
    );
  }

  return (
    <input
      type="time"
      step={900}
      data-id={SCHEDULED_TIME_INPUT_TEST_IDS.input}
      value={value ?? ""}
      onClick={(event) => event.stopPropagation()}
      onChange={(event) => onChange(event.target.value || undefined)}
      className="flex w-full items-center rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-surface-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    />
  );
}
