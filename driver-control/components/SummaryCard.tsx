import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export default function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
}: SummaryCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 hover:shadow-soft transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-800 mt-1 leading-none">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1.5">{subtitle}</p>
          )}
          {trend && (
            <div
              className={cn(
                "inline-flex items-center gap-1 text-xs font-medium mt-2 px-1.5 py-0.5 rounded-full",
                trend.positive
                  ? "text-green-700 bg-green-50"
                  : "text-red-600 bg-red-50"
              )}
            >
              <span>{trend.positive ? "↑" : "↓"}</span>
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", iconBg)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
      </div>
    </div>
  );
}
