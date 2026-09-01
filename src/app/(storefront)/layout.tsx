import React from "react";
import { FloatingNavIsland } from "@/components/layout/FloatingNavIsland";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-full w-full flex flex-col overflow-hidden">
      {children}
      <FloatingNavIsland />
    </div>
  );
}
