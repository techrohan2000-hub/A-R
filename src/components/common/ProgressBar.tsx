interface ProgressBarProps {
  value: number; // 0-100
  colorClassName?: string;
  trackClassName?: string;
  label?: string;
}

export function ProgressBar({
  value,
  colorClassName = "bg-maroon",
  trackClassName = "bg-beige",
  label,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full">
      {label && (
        <div className="mb-1 flex justify-between font-data text-xs text-charcoal-soft">
          <span>{label}</span>
          <span>{Math.round(clamped)}%</span>
        </div>
      )}
      <div
        className={`h-2 w-full overflow-hidden rounded-full ${trackClassName}`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClassName}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
