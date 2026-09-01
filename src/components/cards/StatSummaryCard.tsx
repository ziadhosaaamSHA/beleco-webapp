import React from "react";
import { Card } from "@/components/ui/Card/Card";
import { Heading } from "@/components/ui/Heading/Heading";

interface StatSummaryCardProps {
  label: string;
  value: number | string;
  suffix?: string;
  icon?: React.ReactNode;
}

export const StatSummaryCard: React.FC<StatSummaryCardProps> = ({
  label,
  value,
  suffix,
  icon,
}) => {
  return (
    <Card className="p-4 flex flex-col justify-between gap-2 bg-white flex-1 min-w-[140px]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-sans font-bold text-brand-neutral-500">
          {label}
        </span>
        {icon && (
          <div className="w-7 h-7 rounded-lg bg-brand-neutral-100 text-brand-neutral-700 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1 mt-1">
        <Heading variant="metric-value" className="text-2xl sm:text-3xl text-brand-neutral-900">
          {value}
        </Heading>
        {suffix && (
          <span className="text-xs font-sans font-medium text-brand-neutral-500">
            {suffix}
          </span>
        )}
      </div>
    </Card>
  );
};
