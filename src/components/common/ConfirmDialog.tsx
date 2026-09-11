import Modal from "./Modal";

type ConfirmDialogProps = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "destructive";
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel} widthClassName="max-w-sm">
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-border px-3 py-2 text-sm font-medium text-surface-foreground transition-colors hover:bg-muted"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            tone === "destructive"
              ? "bg-destructive text-destructive-foreground hover:bg-destructive-hover"
              : "bg-primary text-primary-foreground hover:bg-primary-hover"
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
