import { useEffect, useId, useRef } from "react";
import { useLockBodyScroll } from "../../hooks/useLockBodyScroll";
import { useI18n } from "../../hooks/useI18n";

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
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useI18n();
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  useLockBodyScroll(true);

  useEffect(() => {
    cancelRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/40 sm:items-center sm:p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <button className="absolute inset-0 cursor-default" aria-label="Cancel" onClick={onCancel} />
      <div
        className="anim-sheet relative w-full max-w-sm rounded-t-3xl border border-beige bg-cream p-6 shadow-2xl sm:rounded-2xl sm:animate-none"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-beige sm:hidden" />
        <h3 id={titleId} className="mb-2 text-lg text-maroon-deep">{title}</h3>
        <p id={descriptionId} className="mb-5 text-sm text-charcoal-soft">{description}</p>
        <div className="grid grid-cols-2 gap-3 sm:flex sm:justify-end">
          <button ref={cancelRef} onClick={onCancel} className="min-h-11 rounded-full px-4 py-2.5 text-sm font-medium text-charcoal-soft">
            {t("common.cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="min-h-11 rounded-full bg-[#c85a5a] px-4 py-2.5 text-sm font-medium text-white"
          >
            {confirmLabel ?? t("common.delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
