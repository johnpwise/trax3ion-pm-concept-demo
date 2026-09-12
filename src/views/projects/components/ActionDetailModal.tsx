import { type FormEvent, type ReactNode, useState } from "react";

import FormField, { inputClassName } from "../../../components/common/FormField";
import HoursDifferenceValue from "../../../components/common/HoursDifferenceValue";
import Modal from "../../../components/common/Modal";
import { StatusBadge } from "../../../components/common/StatusBadge";
import { useToastStore } from "../../../components/common/toastStore";
import { useTraxionDemoStore } from "../../../store/useTraxionDemoStore";

type ActionDetailModalProps = {
  actionId: string;
  onClose: () => void;
};

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-2.5 text-sm last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-surface-foreground">{value}</span>
    </div>
  );
}

export default function ActionDetailModal({ actionId, onClose }: ActionDetailModalProps) {
  const action = useTraxionDemoStore((state) => state.actions.find((item) => item.id === actionId));
  const task = useTraxionDemoStore((state) => (action ? state.tasks.find((item) => item.id === action.taskId) : undefined));
  const updateAction = useTraxionDemoStore((state) => state.updateAction);
  const showToast = useToastStore((state) => state.showToast);

  const [actualHoursInput, setActualHoursInput] = useState(action?.actualHours !== undefined ? String(action.actualHours) : "");
  const [formError, setFormError] = useState<string | undefined>();

  if (!action) return null;

  const parsedActualHours = actualHoursInput.trim() === "" ? undefined : Number(actualHoursInput);
  const hasValidPreview = parsedActualHours !== undefined && !Number.isNaN(parsedActualHours);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setFormError(undefined);

    const result = updateAction(actionId, {
      actualHours: parsedActualHours,
    });

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    showToast(`Actual hours updated for "${action.name}".`);
    onClose();
  };

  return (
    <Modal title={action.name} description={task?.name} onClose={onClose} widthClassName="max-w-md">
      <div>
        <DetailRow label="Status" value={<StatusBadge status={action.status} />} />
        <DetailRow label="Booked Hours" value={`${action.estimatedHours}h`} />
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-4">
        <FormField label="Actual Hours" htmlFor="action-actual-hours" optional>
          <input
            id="action-actual-hours"
            type="number"
            min={0}
            step={1}
            value={actualHoursInput}
            onChange={(event) => setActualHoursInput(event.target.value)}
            className={inputClassName}
          />
        </FormField>

        {hasValidPreview ? (
          <p className="mb-4 -mt-2 text-sm text-muted-foreground">
            Difference: <HoursDifferenceValue estimatedHours={action.estimatedHours} actualHours={parsedActualHours} />
          </p>
        ) : null}

        {formError ? <p className="mb-4 text-sm text-destructive">{formError}</p> : null}

        <div className="mt-2 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md border border-border px-3 py-2 text-sm font-medium text-surface-foreground transition-colors hover:bg-muted">
            Cancel
          </button>
          <button type="submit" className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover">
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
}
