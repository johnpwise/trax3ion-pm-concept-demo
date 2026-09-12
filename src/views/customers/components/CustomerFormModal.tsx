import { type FormEvent, useState } from "react";

import FormField, { inputClassName } from "../../../components/common/FormField";
import Modal from "../../../components/common/Modal";
import { useToastStore } from "../../../components/common/toastStore";
import { useTraxionDemoStore } from "../../../store/useTraxionDemoStore";
import type { EntityStatus } from "../../../types/domain";

type CustomerFormModalProps = {
  onClose: () => void;
  onCreated?: (customerId: string) => void;
};

export default function CustomerFormModal({ onClose, onCreated }: CustomerFormModalProps) {
  const createCustomer = useTraxionDemoStore((state) => state.createCustomer);
  const showToast = useToastStore((state) => state.showToast);

  const [name, setName] = useState("");
  const [status, setStatus] = useState<EntityStatus>("active");
  const [formError, setFormError] = useState<string | undefined>();

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setFormError(undefined);

    const result = createCustomer({ name, status });

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    showToast(`Customer "${name.trim()}" created.`);
    onCreated?.(result.id);
    onClose();
  };

  return (
    <Modal title="New Customer" description="Add a customer so projects can be created for them." onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <FormField label="Customer Name" htmlFor="customer-name">
          <input
            id="customer-name"
            required
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClassName}
            placeholder="e.g. Demo Manufacturing Ltd"
          />
        </FormField>

        <FormField label="Status" htmlFor="customer-status">
          <select id="customer-status" value={status} onChange={(event) => setStatus(event.target.value as EntityStatus)} className={inputClassName}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </FormField>

        {formError ? <p className="mb-4 text-sm text-destructive">{formError}</p> : null}

        <div className="mt-2 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md border border-border px-3 py-2 text-sm font-medium text-surface-foreground transition-colors hover:bg-muted">
            Cancel
          </button>
          <button type="submit" className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover">
            Create Customer
          </button>
        </div>
      </form>
    </Modal>
  );
}
