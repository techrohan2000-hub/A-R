import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gold-soft bg-cream-soft/60 px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-peach/60 text-maroon">
        <Icon size={26} strokeWidth={1.5} />
      </div>
      <h3 className="mb-1 text-xl text-maroon-deep">{title}</h3>
      {description && <p className="mb-5 max-w-sm text-sm text-charcoal-soft">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="rounded-full bg-maroon px-5 py-2.5 text-sm font-medium text-cream transition hover:bg-maroon-deep"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
