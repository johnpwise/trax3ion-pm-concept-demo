import { type FormEvent, useState } from "react";

import FormField, { inputClassName } from "../../../components/common/FormField";
import Modal from "../../../components/common/Modal";
import { useToastStore } from "../../../components/common/toastStore";
import type { EntityStatus } from "../../../types/domain";
import { useTraxionDemoStore } from "../../../store/useTraxionDemoStore";

type ProjectFormModalProps = {
  onClose: () => void;
  onCreated?: (projectId: string) => void;
  initialCustomerId?: string;
};

export default function ProjectFormModal({ onClose, onCreated, initialCustomerId }: ProjectFormModalProps) {
  const customers = useTraxionDemoStore((state) => state.customers);
  const createProject = useTraxionDemoStore((state) => state.createProject);
  const showToast = useToastStore((state) => state.showToast);

  const [customerId, setCustomerId] = useState(initialCustomerId ?? "");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [status, setStatus] = useState<EntityStatus>("active");
  const [formError, setFormError] = useState<string | undefined>();

  const selectableCustomers = customers.filter((customer) => customer.status === "active" || customer.id === initialCustomerId);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setFormError(undefined);

    const result = createProject({
      customerId,
      name,
      code: code || undefined,
      description: description || undefined,
      estimatedHours: Number(estimatedHours),
      status,
    });

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    showToast(`Project "${name.trim()}" created.`);
    onCreated?.(result.id);
    onClose();
  };

  return (
    <Modal title="New Project" description="Create a project for a customer and set its estimated hours." onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <FormField label="Customer" htmlFor="project-customer">
          <select
            id="project-customer"
            required
            value={customerId}
            onChange={(event) => setCustomerId(event.target.value)}
            className={inputClassName}
          >
            <option value="" disabled>
              Select a customer
            </option>
            {selectableCustomers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Project Name" htmlFor="project-name">
          <input
            id="project-name"
            required
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClassName}
            placeholder="e.g. ERP Rollout"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Estimated Hours" htmlFor="project-hours">
            <input
              id="project-hours"
              required
              type="number"
              min={1}
              step={1}
              value={estimatedHours}
              onChange={(event) => setEstimatedHours(event.target.value)}
              className={inputClassName}
              placeholder="e.g. 120"
            />
          </FormField>

          <FormField label="Status" htmlFor="project-status">
            <select
              id="project-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as EntityStatus)}
              className={inputClassName}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </FormField>
        </div>

        <FormField label="Project Code" htmlFor="project-code" optional>
          <input id="project-code" type="text" value={code} onChange={(event) => setCode(event.target.value)} className={inputClassName} />
        </FormField>

        <FormField label="Description" htmlFor="project-description" optional>
          <textarea
            id="project-description"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={inputClassName}
          />
        </FormField>

        {formError ? <p className="mb-4 text-sm text-destructive">{formError}</p> : null}

        <div className="mt-2 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md border border-border px-3 py-2 text-sm font-medium text-surface-foreground transition-colors hover:bg-muted">
            Cancel
          </button>
          <button type="submit" className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover">
            Create Project
          </button>
        </div>
      </form>
    </Modal>
  );
}
