import { type FormEvent, useState } from "react";

import FormField, { inputClassName } from "../../../components/common/FormField";
import Modal from "../../../components/common/Modal";
import { useToastStore } from "../../../components/common/toastStore";
import { getTaskRemainingHours } from "../../../store/selectors/projectSelectors";
import { useTraxionDemoStore } from "../../../store/useTraxionDemoStore";
import type { EntityStatus } from "../../../types/domain";

type ActionFormModalProps = {
  taskId: string;
  onClose: () => void;
};

export default function ActionFormModal({ taskId, onClose }: ActionFormModalProps) {
  const task = useTraxionDemoStore((state) => state.tasks.find((item) => item.id === taskId));
  const actions = useTraxionDemoStore((state) => state.actions);
  const createAction = useTraxionDemoStore((state) => state.createAction);
  const showToast = useToastStore((state) => state.showToast);

  const [name, setName] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [status, setStatus] = useState<EntityStatus>("active");
  const [formError, setFormError] = useState<string | undefined>();

  if (!task) return null;

  const remaining = getTaskRemainingHours(task, actions);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setFormError(undefined);

    const trimmedHours = estimatedHours.trim();
    const result = createAction({ taskId, name, estimatedHours: trimmedHours === "" ? undefined : Number(trimmedHours), status });

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    showToast(`Action "${name.trim()}" added to ${task.name}.`);
    onClose();
  };

  return (
    <Modal title="Add Action" description={`${remaining}h remaining of ${task.estimatedHours}h on ${task.name}.`} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <FormField label="Action Name" htmlFor="action-name">
          <input id="action-name" required type="text" value={name} onChange={(event) => setName(event.target.value)} className={inputClassName} placeholder="e.g. Scoping Session 1" />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Estimated Hours" htmlFor="action-hours" optional>
            <input
              id="action-hours"
              type="number"
              min={1}
              step={1}
              value={estimatedHours}
              onChange={(event) => setEstimatedHours(event.target.value)}
              className={inputClassName}
            />
          </FormField>
          <FormField label="Status" htmlFor="action-status">
            <select id="action-status" value={status} onChange={(event) => setStatus(event.target.value as EntityStatus)} className={inputClassName}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </FormField>
        </div>

        {formError ? <p className="mb-4 text-sm text-destructive">{formError}</p> : null}

        <div className="mt-2 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md border border-border px-3 py-2 text-sm font-medium text-surface-foreground transition-colors hover:bg-muted">
            Cancel
          </button>
          <button type="submit" className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover">
            Add Action
          </button>
        </div>
      </form>
    </Modal>
  );
}
