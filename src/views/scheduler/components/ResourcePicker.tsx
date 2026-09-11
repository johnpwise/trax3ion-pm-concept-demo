import type { Resource } from "../../../types/domain";

type ResourcePickerProps = {
  resources: Resource[];
  selectedResourceIds: string[];
  onToggle: (resourceId: string) => void;
};

export default function ResourcePicker({ resources, selectedResourceIds, onToggle }: ResourcePickerProps) {
  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <p className="text-sm font-medium text-surface-foreground">Resources</p>
        <p className="text-xs text-muted-foreground">Select Resources to compare availability</p>
      </div>
      <ul className="max-h-[420px] overflow-y-auto p-2">
        {resources.map((resource) => {
          const isSelected = selectedResourceIds.includes(resource.id);
          return (
            <li key={resource.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-muted/60">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggle(resource.id)}
                  className="h-4 w-4 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-surface-foreground">
                    {resource.name}
                    {resource.isCurrentUser ? <span className="ml-1.5 text-xs font-normal text-muted-foreground">(you)</span> : null}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">{resource.role}</span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
