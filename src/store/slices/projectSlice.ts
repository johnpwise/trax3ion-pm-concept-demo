import type { StateCreator } from "zustand";

import type { Action, EntityStatus, Phase, Project, Task } from "../../types/domain";
import {
  canAllocateAction,
  canAllocatePhase,
  canAllocateTask,
  getPhaseAllocatedHours,
  getProjectAllocatedHours,
  getTaskAllocatedHours,
  isPositiveInteger,
} from "../selectors/projectSelectors";
import type { DemoStore } from "../useTraxionDemoStore";
import type { MutationResult, UpdateResult } from "./types";

export type ProjectSlice = {
  projects: Project[];
  phases: Phase[];
  tasks: Task[];
  actions: Action[];

  createProject: (input: {
    customerId: string;
    name: string;
    code?: string;
    description?: string;
    estimatedHours: number;
    status?: EntityStatus;
  }) => MutationResult;
  updateProject: (id: string, patch: Partial<Omit<Project, "id" | "customerId">>) => UpdateResult;

  createPhase: (input: { projectId: string; name: string; estimatedHours: number; status?: EntityStatus }) => MutationResult;
  updatePhase: (id: string, patch: Partial<Omit<Phase, "id" | "projectId">>) => UpdateResult;

  createTask: (input: { phaseId: string; name: string; description?: string; estimatedHours: number; status?: EntityStatus }) => MutationResult;
  updateTask: (id: string, patch: Partial<Omit<Task, "id" | "phaseId">>) => UpdateResult;

  createAction: (input: { taskId: string; name: string; estimatedHours?: number; status?: EntityStatus }) => MutationResult;
  updateAction: (id: string, patch: Partial<Omit<Action, "id" | "taskId">>) => UpdateResult;
};

export const createProjectSlice: StateCreator<DemoStore, [], [], ProjectSlice> = (set, get) => ({
  projects: [],
  phases: [],
  tasks: [],
  actions: [],

  createProject: (input) => {
    const name = input.name.trim();
    if (!input.customerId) {
      return { ok: false, error: "A Customer must be selected." };
    }
    if (!name) {
      return { ok: false, error: "Project Name is required." };
    }
    if (!isPositiveInteger(input.estimatedHours)) {
      return { ok: false, error: "Estimated Hours must be a whole number greater than zero." };
    }

    const project: Project = {
      id: crypto.randomUUID(),
      customerId: input.customerId,
      name,
      code: input.code?.trim() || undefined,
      description: input.description?.trim() || undefined,
      estimatedHours: input.estimatedHours,
      status: input.status ?? "active",
    };

    set((state) => ({ projects: [...state.projects, project] }));
    return { ok: true, id: project.id };
  },

  updateProject: (id, patch) => {
    const project = get().projects.find((item) => item.id === id);
    if (!project) {
      return { ok: false, error: "Project not found." };
    }

    if (patch.estimatedHours !== undefined) {
      if (!isPositiveInteger(patch.estimatedHours)) {
        return { ok: false, error: "Estimated Hours must be a whole number greater than zero." };
      }
      const allocated = getProjectAllocatedHours(get().phases, id);
      if (patch.estimatedHours < allocated) {
        return { ok: false, error: `This Project cannot be reduced below ${allocated}h because ${allocated}h is already allocated to Phases.` };
      }
    }

    set((state) => ({
      projects: state.projects.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
    return { ok: true };
  },

  createPhase: (input) => {
    const project = get().projects.find((item) => item.id === input.projectId);
    if (!project) {
      return { ok: false, error: "Project not found." };
    }

    const name = input.name.trim();
    if (!name) {
      return { ok: false, error: "Phase Name is required." };
    }
    if (!isPositiveInteger(input.estimatedHours)) {
      return { ok: false, error: "Estimated Hours must be a whole number greater than zero." };
    }
    if (!canAllocatePhase(project, get().phases, input.estimatedHours)) {
      const remaining = project.estimatedHours - getProjectAllocatedHours(get().phases, project.id);
      return { ok: false, error: `Only ${remaining} project hours remain available for allocation.` };
    }

    const phase: Phase = {
      id: crypto.randomUUID(),
      projectId: input.projectId,
      name,
      estimatedHours: input.estimatedHours,
      status: input.status ?? "active",
      sortOrder: get().phases.filter((p) => p.projectId === input.projectId).length + 1,
    };

    set((state) => ({ phases: [...state.phases, phase] }));
    return { ok: true, id: phase.id };
  },

  updatePhase: (id, patch) => {
    const phase = get().phases.find((item) => item.id === id);
    if (!phase) {
      return { ok: false, error: "Phase not found." };
    }
    const project = get().projects.find((item) => item.id === phase.projectId);
    if (!project) {
      return { ok: false, error: "Project not found." };
    }

    if (patch.estimatedHours !== undefined) {
      if (!isPositiveInteger(patch.estimatedHours)) {
        return { ok: false, error: "Estimated Hours must be a whole number greater than zero." };
      }
      const allocatedToTasks = getPhaseAllocatedHours(get().tasks, id);
      if (patch.estimatedHours < allocatedToTasks) {
        return { ok: false, error: `This Phase cannot be reduced below ${allocatedToTasks}h because ${allocatedToTasks}h is already allocated to Tasks.` };
      }
      if (!canAllocatePhase(project, get().phases, patch.estimatedHours, id)) {
        const remaining = project.estimatedHours - getProjectAllocatedHours(get().phases, project.id) + phase.estimatedHours;
        return { ok: false, error: `Only ${remaining} project hours remain available for allocation.` };
      }
    }

    set((state) => ({
      phases: state.phases.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
    return { ok: true };
  },

  createTask: (input) => {
    const phase = get().phases.find((item) => item.id === input.phaseId);
    if (!phase) {
      return { ok: false, error: "Phase not found." };
    }

    const name = input.name.trim();
    if (!name) {
      return { ok: false, error: "Task Name is required." };
    }
    if (!isPositiveInteger(input.estimatedHours)) {
      return { ok: false, error: "Estimated Hours must be a whole number greater than zero." };
    }
    if (!canAllocateTask(phase, get().tasks, input.estimatedHours)) {
      const remaining = phase.estimatedHours - getPhaseAllocatedHours(get().tasks, phase.id);
      return { ok: false, error: `Only ${remaining} phase hours remain available for allocation.` };
    }

    const task: Task = {
      id: crypto.randomUUID(),
      phaseId: input.phaseId,
      name,
      description: input.description?.trim() || undefined,
      estimatedHours: input.estimatedHours,
      status: input.status ?? "active",
      sortOrder: get().tasks.filter((t) => t.phaseId === input.phaseId).length + 1,
    };

    set((state) => ({ tasks: [...state.tasks, task] }));
    return { ok: true, id: task.id };
  },

  updateTask: (id, patch) => {
    const task = get().tasks.find((item) => item.id === id);
    if (!task) {
      return { ok: false, error: "Task not found." };
    }
    const phase = get().phases.find((item) => item.id === task.phaseId);
    if (!phase) {
      return { ok: false, error: "Phase not found." };
    }

    if (patch.estimatedHours !== undefined) {
      if (!isPositiveInteger(patch.estimatedHours)) {
        return { ok: false, error: "Estimated Hours must be a whole number greater than zero." };
      }
      const allocatedToActions = getTaskAllocatedHours(get().actions, id);
      if (patch.estimatedHours < allocatedToActions) {
        return { ok: false, error: `This Task cannot be reduced below ${allocatedToActions}h because ${allocatedToActions}h is already allocated to Actions.` };
      }
      if (!canAllocateTask(phase, get().tasks, patch.estimatedHours, id)) {
        const remaining = phase.estimatedHours - getPhaseAllocatedHours(get().tasks, phase.id) + task.estimatedHours;
        return { ok: false, error: `Only ${remaining} phase hours remain available for allocation.` };
      }
    }

    set((state) => ({
      tasks: state.tasks.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
    return { ok: true };
  },

  createAction: (input) => {
    const task = get().tasks.find((item) => item.id === input.taskId);
    if (!task) {
      return { ok: false, error: "Task not found." };
    }

    const name = input.name.trim();
    if (!name) {
      return { ok: false, error: "Action Name is required." };
    }
    if (input.estimatedHours !== undefined) {
      if (!isPositiveInteger(input.estimatedHours)) {
        return { ok: false, error: "Estimated Hours must be a whole number greater than zero." };
      }
      if (!canAllocateAction(task, get().actions, input.estimatedHours)) {
        const remaining = task.estimatedHours - getTaskAllocatedHours(get().actions, task.id);
        return { ok: false, error: `Only ${remaining} task hours remain available for allocation.` };
      }
    }

    const action: Action = {
      id: crypto.randomUUID(),
      taskId: input.taskId,
      name,
      estimatedHours: input.estimatedHours,
      status: input.status ?? "active",
      sortOrder: get().actions.filter((a) => a.taskId === input.taskId).length + 1,
    };

    set((state) => ({ actions: [...state.actions, action] }));
    return { ok: true, id: action.id };
  },

  updateAction: (id, patch) => {
    const action = get().actions.find((item) => item.id === id);
    if (!action) {
      return { ok: false, error: "Action not found." };
    }
    const task = get().tasks.find((item) => item.id === action.taskId);
    if (!task) {
      return { ok: false, error: "Task not found." };
    }

    if (patch.estimatedHours !== undefined) {
      if (!isPositiveInteger(patch.estimatedHours)) {
        return { ok: false, error: "Estimated Hours must be a whole number greater than zero." };
      }
      if (!canAllocateAction(task, get().actions, patch.estimatedHours, id)) {
        const remaining = task.estimatedHours - getTaskAllocatedHours(get().actions, task.id) + (action.estimatedHours ?? 0);
        return { ok: false, error: `Only ${remaining} task hours remain available for allocation.` };
      }
    }

    set((state) => ({
      actions: state.actions.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
    return { ok: true };
  },
});
