import { formatScheduledDate } from "./scheduledDate";
import { SCHEDULED_DATE_INPUT_TEST_IDS } from "./ScheduledDateInput.testIds";

type ScheduledDateInputProps = {
  value?: string;
  onChange?: (date: string | undefined) => void;
  placeholder?: string;
};

export default function ScheduledDateInput({ value, onChange, placeholder = "No date" }: ScheduledDateInputProps) {
  if (!onChange) {
    return (
      <span className={`block truncate text-sm ${value ? "text-surface-foreground" : "text-muted-foreground"}`}>
        {value ? formatScheduledDate(value) : placeholder}
      </span>
    );
  }

  return (
    <input
      type="date"
      data-id={SCHEDULED_DATE_INPUT_TEST_IDS.input}
      value={value ?? ""}
      onClick={(event) => event.stopPropagation()}
      onChange={(event) => onChange(event.target.value || undefined)}
      className="flex w-full items-center rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-surface-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    />
  );
}
