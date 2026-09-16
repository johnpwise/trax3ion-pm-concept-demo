import { ChevronDown, ChevronRight, Plus, TriangleAlert } from "lucide-react";
import type { KeyboardEvent, ReactNode } from "react";

import AllocationBar from "../../../components/common/AllocationBar";
import HoursDifferenceValue from "../../../components/common/HoursDifferenceValue";
import ResourceSelect from "../../../components/common/ResourceSelect";
import ScheduledDateInput from "../../../components/common/ScheduledDateInput";
import ScheduledTimeInput from "../../../components/common/ScheduledTimeInput";
import { StatusBadge } from "../../../components/common/StatusBadge";
import type { EntityStatus, Resource } from "../../../types/domain";

type HierarchyRowProps = {
  kind: string;
  name: string;
  status: EntityStatus;
  estimatedHours?: number;
  allocatedHours?: number;
  actualHours?: number;
  resourceId?: string;
  resources?: Resource[];
  onResourceChange?: (resourceId: string | undefined) => void;
  scheduledDate?: string;
  onScheduledDateChange?: (date: string | undefined) => void;
  scheduledTime?: string;
  onScheduledTimeChange?: (time: string | undefined) => void;
  depth: 0 | 1 | 2;
  hasConflict?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  hasChildren?: boolean;
  addChildLabel?: string;
  onAddChild?: () => void;
  onClick?: () => void;
  children?: ReactNode;
};

const DEPTH_PADDING = ["pl-0", "pl-8", "pl-16"] as const;

export default function HierarchyRow({
  kind,
  name,
  status,
  estimatedHours,
  allocatedHours,
  actualHours,
  resourceId,
  resources,
  onResourceChange,
  scheduledDate,
  onScheduledDateChange,
  scheduledTime,
  onScheduledTimeChange,
  depth,
  hasConflict,
  isExpanded,
  onToggleExpand,
  hasChildren,
  addChildLabel,
  onAddChild,
  onClick,
  children,
}: HierarchyRowProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  const handleDoubleClick = (): void => {
    if (hasChildren !== undefined) onToggleExpand?.();
  };

  return (
    <div className={depth > 0 ? "border-t border-border" : ""}>
      <div
        className={`flex flex-wrap items-center gap-3 py-3 pr-4 ${DEPTH_PADDING[depth]} ${
          hasConflict ? "border-l-2 border-l-destructive bg-destructive/10" : ""
        } ${onClick ? `cursor-pointer transition-colors ${hasConflict ? "hover:bg-destructive/15" : "hover:bg-muted"}` : ""}`}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onDoubleClick={hasChildren !== undefined ? handleDoubleClick : undefined}
        onKeyDown={onClick ? handleKeyDown : undefined}
      >
        {hasChildren !== undefined ? (
          <button
            type="button"
            onClick={onToggleExpand}
            onDoubleClick={(event) => event.stopPropagation()}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted"
            aria-label={isExpanded ? `Collapse ${name}` : `Expand ${name}`}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}

        <div className="min-w-[220px] flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{kind}</span>
            <StatusBadge status={status} />
            {hasConflict ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
                <TriangleAlert className="h-3 w-3" />
                Conflict
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-sm font-medium text-surface-foreground">{name}</p>
        </div>

        {resources ? (
          <>
            <div className="w-full shrink-0 sm:w-36" onDoubleClick={(event) => event.stopPropagation()}>
              <ScheduledDateInput value={scheduledDate} onChange={onScheduledDateChange} />
            </div>
            <div className="w-full shrink-0 sm:w-28" onDoubleClick={(event) => event.stopPropagation()}>
              <ScheduledTimeInput value={scheduledTime} onChange={onScheduledTimeChange} />
            </div>
            <div className="w-full shrink-0 sm:w-44" onDoubleClick={(event) => event.stopPropagation()}>
              <ResourceSelect resources={resources} value={resourceId} onChange={onResourceChange} placeholder="Unassigned" />
            </div>
          </>
        ) : null}

        <div className="w-full max-w-[260px] sm:w-64">
          {allocatedHours !== undefined ? (
            <AllocationBar estimatedHours={estimatedHours ?? 0} allocatedHours={allocatedHours} size="sm" />
          ) : (
            <div className="grid grid-cols-3 gap-2 text-right">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Booked</p>
                <p className="text-sm text-surface-foreground">{estimatedHours !== undefined ? `${estimatedHours}h` : "Ad hoc"}</p>
              </div>
              {actualHours !== undefined ? (
                <>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Actual</p>
                    <p className="text-sm text-surface-foreground">{actualHours}h</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Diff.</p>
                    {estimatedHours !== undefined ? (
                      <HoursDifferenceValue estimatedHours={estimatedHours} actualHours={actualHours} />
                    ) : (
                      <span className="font-medium text-muted-foreground">—</span>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>

        {onAddChild ? (
          <button
            type="button"
            onClick={onAddChild}
            onDoubleClick={(event) => event.stopPropagation()}
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-surface-foreground transition-colors hover:bg-muted"
          >
            <Plus className="h-3.5 w-3.5" />
            {addChildLabel}
          </button>
        ) : null}
      </div>

      {isExpanded ? children : null}
    </div>
  );
}
