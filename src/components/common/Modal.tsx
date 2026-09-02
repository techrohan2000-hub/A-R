import { useEffect, useId, type ReactNode } from "react";
import { X } from "lucide-react";
import { useLockBodyScroll } from "../../hooks/useLockBodyScroll";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, onClose, children }: ModalProps) {
  const titleId = useId();
  useLockBodyScroll(true);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/40 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button className="absolute inset-0 cursor-default" aria-label="Close" onClick={onClose} />
      <div
        className="anim-sheet relative max-h-[88dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-3xl bg-cream p-5 shadow-xl sm:rounded-2xl sm:p-6 sm:animate-none"
        style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-beige sm:hidden" />
        <div className="sticky top-0 z-10 mb-4 flex items-center justify-between bg-cream py-1">
          <h3 id={titleId} className="pr-4 text-xl text-maroon-deep">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-2 text-charcoal-soft hover:bg-peach/40 hover:text-charcoal">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
