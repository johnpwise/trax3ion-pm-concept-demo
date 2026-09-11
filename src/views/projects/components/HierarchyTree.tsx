import { ListTree, Plus } from "lucide-react";
import { useState } from "react";

import EmptyState from "../../../components/common/EmptyState";
import { getPhaseTasks, getProjectPhases, getTaskActions, getPhaseAllocatedHours, getTaskAllocatedHours } from "../../../store/selectors/projectSelectors";
import { useTraxionDemoStore } from "../../../store/useTraxionDemoStore";
import HierarchyRow from "./HierarchyRow";

type HierarchyTreeProps = {
  projectId: string;
  canEdit: boolean;
  onAddPhase: () => void;
  onAddTask: (phaseId: string) => void;
  onAddAction: (taskId: string) => void;
};

export default function HierarchyTree({ projectId, canEdit, onAddPhase, onAddTask, onAddAction }: HierarchyTreeProps) {
  const phases = useTraxionDemoStore((state) => state.phases);
  const tasks = useTraxionDemoStore((state) => state.tasks);
  const actions = useTraxionDemoStore((state) => state.actions);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  const toggle = (id: string): void => {
    setCollapsedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const projectPhases = getProjectPhases(phases, projectId);

  if (projectPhases.length === 0) {
    return (
      <EmptyState
        icon={ListTree}
        title="No phases yet"
        description="Break this project down into Phases, then Tasks and Actions, to allocate its estimated hours."
        action={
          canEdit ? (
            <button
              type="button"
              onClick={onAddPhase}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              <Plus className="h-4 w-4" />
              Add Phase
            </button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-medium text-surface-foreground">Phases</p>
        {canEdit ? (
          <button
            type="button"
            onClick={onAddPhase}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-surface-foreground transition-colors hover:bg-muted"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Phase
          </button>
        ) : null}
      </div>

      <div className="px-4">
        {projectPhases.map((phase) => {
          const phaseTasks = getPhaseTasks(tasks, phase.id);

          return (
            <HierarchyRow
              key={phase.id}
              kind="Phase"
              name={phase.name}
              status={phase.status}
              depth={0}
              estimatedHours={phase.estimatedHours}
              allocatedHours={getPhaseAllocatedHours(tasks, phase.id)}
              hasChildren
              isExpanded={!collapsedIds.has(phase.id)}
              onToggleExpand={() => toggle(phase.id)}
              addChildLabel="Add Task"
              onAddChild={canEdit ? () => onAddTask(phase.id) : undefined}
            >
              {phaseTasks.length === 0 ? (
                <p className="py-3 pl-16 text-sm text-muted-foreground">No tasks yet under this phase.</p>
              ) : (
                phaseTasks.map((task) => {
                  const taskActions = getTaskActions(actions, task.id);

                  return (
                    <HierarchyRow
                      key={task.id}
                      kind="Task"
                      name={task.name}
                      status={task.status}
                      depth={1}
                      estimatedHours={task.estimatedHours}
                      allocatedHours={getTaskAllocatedHours(actions, task.id)}
                      hasChildren
                      isExpanded={!collapsedIds.has(task.id)}
                      onToggleExpand={() => toggle(task.id)}
                      addChildLabel="Add Action"
                      onAddChild={canEdit ? () => onAddAction(task.id) : undefined}
                    >
                      {taskActions.length === 0 ? (
                        <p className="py-3 pl-24 text-sm text-muted-foreground">No actions yet under this task.</p>
                      ) : (
                        taskActions.map((action) => (
                          <HierarchyRow
                            key={action.id}
                            kind="Action"
                            name={action.name}
                            status={action.status}
                            depth={2}
                            estimatedHours={action.estimatedHours}
                          />
                        ))
                      )}
                    </HierarchyRow>
                  );
                })
              )}
            </HierarchyRow>
          );
        })}
      </div>
    </div>
  );
}
