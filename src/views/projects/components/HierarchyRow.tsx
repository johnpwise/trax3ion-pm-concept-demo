import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import type { ReactNode } from "react";

import AllocationBar from "../../../components/common/AllocationBar";
import { StatusBadge } from "../../../components/common/StatusBadge";
import type { EntityStatus } from "../../../types/domain";

type HierarchyRowProps = {
  kind: string;
  name: string;
  status: EntityStatus;
  estimatedHours: number;
  allocatedHours?: number;
  depth: 0 | 1 | 2;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  hasChildren?: boolean;
  addChildLabel?: string;
  onAddChild?: () => void;
  children?: ReactNode;
};

const DEPTH_PADDING = ["pl-0", "pl-8", "pl-16"] as const;

export default function HierarchyRow({
  kind,
  name,
  status,
  estimatedHours,
  allocatedHours,
  depth,
  isExpanded,
  onToggleExpand,
  hasChildren,
  addChildLabel,
  onAddChild,
  children,
}: HierarchyRowProps) {
  return (
    <div className={depth > 0 ? "border-t border-border" : ""}>
      <div className={`flex flex-wrap items-center gap-3 py-3 pr-4 ${DEPTH_PADDING[depth]}`}>
        {hasChildren !== undefined ? (
          <button
            type="button"
            onClick={onToggleExpand}
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
          </div>
          <p className="mt-0.5 text-sm font-medium text-surface-foreground">{name}</p>
        </div>

        <div className="w-full max-w-[260px] sm:w-64">
          {allocatedHours !== undefined ? (
            <AllocationBar estimatedHours={estimatedHours} allocatedHours={allocatedHours} size="sm" />
          ) : (
            <p className="text-right text-sm text-surface-foreground">{estimatedHours}h</p>
          )}
        </div>

        {onAddChild ? (
          <button
            type="button"
            onClick={onAddChild}
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
