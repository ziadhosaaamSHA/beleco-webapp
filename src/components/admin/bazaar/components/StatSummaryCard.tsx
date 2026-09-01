"use client";

import React from "react";
import { Card } from "@/components/ui/Card/Card";
import { Heading } from "@/components/ui/Heading/Heading";

export interface StatSummaryCardProps {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
}

export const StatSummaryCard: React.FC<StatSummaryCardProps> = ({
  label,
  value,
  suffix,
  icon,
}) => {
  return (
    <Card className="flex-1 p-3.5 flex flex-col gap-1 bg-white border border-brand-neutral-200/90 shadow-2xs">
      <div className="flex items-center gap-1.5 text-xs font-sans text-brand-neutral-500">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex items-baseline gap-1 mt-1">
        <Heading variant="metric-value" className="text-xl font-bold text-brand-neutral-950 font-mono">
          {value.toLocaleString()}
        </Heading>
        {suffix && (
          <span className="text-[11px] font-sans font-bold text-brand-neutral-500">
            {suffix}
          </span>
        )}
      </div>
    </Card>
  );
};
