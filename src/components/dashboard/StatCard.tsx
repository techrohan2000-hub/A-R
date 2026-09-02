import type { LucideIcon } from "lucide-react";
import { Card } from "../common/Card";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: "default" | "warning" | "success";
  sublabel?: string;
}

const toneStyles: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-peach/50 text-maroon-deep",
  warning: "bg-[#f6e3d3] text-[#8a4a1f]",
  success: "bg-[#e3ecd9] text-[#3f6b2c]",
};

export function StatCard({ icon: Icon, label, value, tone = "default", sublabel }: StatCardProps) {
  return (
    <Card className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${toneStyles[tone]}`}>
        <Icon size={18} strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="truncate font-data text-lg font-semibold leading-tight text-charcoal sm:text-2xl">{value}</p>
        <p className="mt-0.5 truncate text-xs text-charcoal-soft sm:text-sm">{label}</p>
        {sublabel && <p className="mt-0.5 truncate text-[11px] text-charcoal-soft/70 sm:text-xs">{sublabel}</p>}
      </div>
    </Card>
  );
}
