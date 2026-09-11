import { type FormEvent, useState } from "react";

import FormField, { inputClassName } from "../../../components/common/FormField";
import Modal from "../../../components/common/Modal";
import { useToastStore } from "../../../components/common/toastStore";
import { getProjectRemainingHours } from "../../../store/selectors/projectSelectors";
import { useTraxionDemoStore } from "../../../store/useTraxionDemoStore";
import type { EntityStatus } from "../../../types/domain";

type PhaseFormModalProps = {
  projectId: string;
  onClose: () => void;
};

export default function PhaseFormModal({ projectId, onClose }: PhaseFormModalProps) {
  const project = useTraxionDemoStore((state) => state.projects.find((item) => item.id === projectId));
  const phases = useTraxionDemoStore((state) => state.phases);
  const createPhase = useTraxionDemoStore((state) => state.createPhase);
  const showToast = useToastStore((state) => state.showToast);

  const [name, setName] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [status, setStatus] = useState<EntityStatus>("active");
  const [formError, setFormError] = useState<string | undefined>();

  if (!project) return null;

  const remaining = getProjectRemainingHours(project, phases);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setFormError(undefined);

    const result = createPhase({ projectId, name, estimatedHours: Number(estimatedHours), status });

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    showToast(`Phase "${name.trim()}" added to ${project.name}.`);
    onClose();
  };

  return (
    <Modal title="Add Phase" description={`${remaining}h remaining of ${project.estimatedHours}h on ${project.name}.`} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <FormField label="Phase Name" htmlFor="phase-name">
          <input id="phase-name" required type="text" value={name} onChange={(event) => setName(event.target.value)} className={inputClassName} placeholder="e.g. Design" />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Estimated Hours" htmlFor="phase-hours">
            <input
              id="phase-hours"
              required
              type="number"
              min={1}
              step={1}
              value={estimatedHours}
              onChange={(event) => setEstimatedHours(event.target.value)}
              className={inputClassName}
            />
          </FormField>
          <FormField label="Status" htmlFor="phase-status">
            <select id="phase-status" value={status} onChange={(event) => setStatus(event.target.value as EntityStatus)} className={inputClassName}>
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
            Add Phase
          </button>
        </div>
      </form>
    </Modal>
  );
}
