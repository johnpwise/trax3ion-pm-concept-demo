import type { StatusFilter } from "../../types/domain";

const OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "all", label: "All" },
];

type StatusFilterTabsProps = {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
};

export default function StatusFilterTabs({ value, onChange }: StatusFilterTabsProps) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-surface p-1" role="tablist" aria-label="Filter by status">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            value === option.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-surface-foreground"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
