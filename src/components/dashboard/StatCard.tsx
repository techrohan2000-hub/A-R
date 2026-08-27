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
    <Card className="flex items-start gap-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneStyles[tone]}`}>
        <Icon size={20} strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="font-data text-2xl font-semibold leading-tight text-charcoal">{value}</p>
        <p className="mt-0.5 truncate text-sm text-charcoal-soft">{label}</p>
        {sublabel && <p className="mt-0.5 text-xs text-charcoal-soft/70">{sublabel}</p>}
      </div>
    </Card>
  );
}
