import { type FormEvent, useState } from "react";

import FormField, { inputClassName } from "../../../components/common/FormField";
import Modal from "../../../components/common/Modal";
import { useToastStore } from "../../../components/common/toastStore";
import { getPhaseRemainingHours } from "../../../store/selectors/projectSelectors";
import { useTraxionDemoStore } from "../../../store/useTraxionDemoStore";
import type { EntityStatus } from "../../../types/domain";

type TaskFormModalProps = {
  phaseId: string;
  onClose: () => void;
};

export default function TaskFormModal({ phaseId, onClose }: TaskFormModalProps) {
  const phase = useTraxionDemoStore((state) => state.phases.find((item) => item.id === phaseId));
  const tasks = useTraxionDemoStore((state) => state.tasks);
  const createTask = useTraxionDemoStore((state) => state.createTask);
  const showToast = useToastStore((state) => state.showToast);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [status, setStatus] = useState<EntityStatus>("active");
  const [formError, setFormError] = useState<string | undefined>();

  if (!phase) return null;

  const remaining = getPhaseRemainingHours(phase, tasks);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setFormError(undefined);

    const result = createTask({ phaseId, name, description: description || undefined, estimatedHours: Number(estimatedHours), status });

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    showToast(`Task "${name.trim()}" added to ${phase.name}.`);
    onClose();
  };

  return (
    <Modal title="Add Task" description={`${remaining}h remaining of ${phase.estimatedHours}h on ${phase.name}.`} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <FormField label="Task Name" htmlFor="task-name">
          <input id="task-name" required type="text" value={name} onChange={(event) => setName(event.target.value)} className={inputClassName} placeholder="e.g. Scoping" />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Estimated Hours" htmlFor="task-hours">
            <input
              id="task-hours"
              required
              type="number"
              min={1}
              step={1}
              value={estimatedHours}
              onChange={(event) => setEstimatedHours(event.target.value)}
              className={inputClassName}
            />
          </FormField>
          <FormField label="Status" htmlFor="task-status">
            <select id="task-status" value={status} onChange={(event) => setStatus(event.target.value as EntityStatus)} className={inputClassName}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </FormField>
        </div>

        <FormField label="Description" htmlFor="task-description" optional>
          <textarea id="task-description" rows={2} value={description} onChange={(event) => setDescription(event.target.value)} className={inputClassName} />
        </FormField>

        {formError ? <p className="mb-4 text-sm text-destructive">{formError}</p> : null}

        <div className="mt-2 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md border border-border px-3 py-2 text-sm font-medium text-surface-foreground transition-colors hover:bg-muted">
            Cancel
          </button>
          <button type="submit" className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover">
            Add Task
          </button>
        </div>
      </form>
    </Modal>
  );
}
