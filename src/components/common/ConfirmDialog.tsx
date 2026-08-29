interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-2xl bg-cream p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-2 text-lg text-maroon-deep">{title}</h3>
        <p className="mb-5 text-sm text-charcoal-soft">{description}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-full px-4 py-2 text-sm font-medium text-charcoal-soft">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-full bg-[#c85a5a] px-4 py-2 text-sm font-medium text-white"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
