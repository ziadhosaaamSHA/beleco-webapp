"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "skeleton-shimmer rounded-xl select-none pointer-events-none",
        className
      )}
      {...props}
    />
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-brand-neutral-200/80 rounded-2xl overflow-hidden flex flex-col shadow-xs">
      <Skeleton className="w-full aspect-[4/5] rounded-none" />
      <div className="flex flex-col gap-2 p-3">
        <Skeleton className="h-4 w-3/4 rounded-md" />
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-9 w-full rounded-xl mt-0.5" />
      </div>
    </div>
  );
};

export const OrderCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-brand-neutral-200/90 rounded-2xl p-4 flex flex-col gap-3 shadow-xs">
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-28 rounded-md" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
      <div className="flex justify-between items-center pt-2 border-t border-brand-neutral-100">
        <Skeleton className="h-4 w-32 rounded-md" />
        <Skeleton className="h-5 w-20 rounded-md" />
      </div>
    </div>
  );
};

export const HomePageSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 p-4 animate-in fade-in duration-150">
      {/* Welcome Title */}
      <Skeleton className="h-7 w-44 rounded-lg" />

      {/* Subtabs shimmer */}
      <div className="flex items-center gap-2 overflow-hidden py-1">
        <Skeleton className="h-8 w-20 rounded-full shrink-0" />
        <Skeleton className="h-8 w-18 rounded-full shrink-0" />
        <Skeleton className="h-8 w-22 rounded-full shrink-0" />
        <Skeleton className="h-8 w-20 rounded-full shrink-0" />
      </div>

      {/* Search bar shimmer */}
      <Skeleton className="h-11 w-full rounded-2xl" />

      {/* Categories shimmer */}
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-6 w-16 rounded-md" />
        <Skeleton className="h-6 w-16 rounded-md" />
        <Skeleton className="h-6 w-16 rounded-md" />
        <Skeleton className="h-6 w-16 rounded-md" />
      </div>

      {/* Picks Carousel shimmer */}
      <Skeleton className="h-[150px] w-full rounded-3xl" />

      {/* Product grid shimmer */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export const AdminPageSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 p-4 animate-in fade-in duration-150">
      {/* Header title */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-7 w-40 rounded-lg" />
          <Skeleton className="h-4 w-56 rounded-md" />
        </div>
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>

      {/* Subtabs */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-xl" />
        <Skeleton className="h-9 w-24 rounded-xl" />
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>

      {/* Content cards shimmer */}
      <div className="flex flex-col gap-3 pt-1">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    </div>
  );
};

export const AccountPageSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 p-4 animate-in fade-in duration-150">
      {/* User Hero Card */}
      <div className="p-4 bg-white border border-brand-neutral-200/90 rounded-2xl flex items-center gap-3.5 shadow-xs">
        <Skeleton className="w-14 h-14 rounded-full shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-5 w-32 rounded-md" />
          <Skeleton className="h-3.5 w-48 rounded-md" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>

      {/* Action list */}
      <div className="flex flex-col gap-2 pt-1">
        <Skeleton className="h-4 w-28 rounded-md" />
        <div className="p-2 bg-white border border-brand-neutral-200/90 rounded-2xl flex flex-col gap-2 shadow-xs">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const OrdersPageSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 p-4 animate-in fade-in duration-150">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-7 w-36 rounded-lg" />
        <Skeleton className="h-4 w-52 rounded-md" />
      </div>
      <div className="flex flex-col gap-3 pt-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <OrderCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export const AddressesPageSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 p-4 animate-in fade-in duration-150">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-7 w-36 rounded-lg" />
          <Skeleton className="h-3.5 w-48 rounded-md" />
        </div>
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
      <div className="flex flex-col gap-3 pt-1">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
    </div>
  );
};

export const TrackingPageSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 p-4 animate-in fade-in duration-150">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-7 w-36 rounded-lg" />
        <Skeleton className="h-3.5 w-60 rounded-md" />
      </div>
      <Skeleton className="h-14 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-2xl mt-1" />
    </div>
  );
};

export const HelpPageSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 p-4 animate-in fade-in duration-150">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-7 w-44 rounded-lg" />
        <Skeleton className="h-3.5 w-56 rounded-md" />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
      <div className="flex flex-col gap-2 pt-2">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-2xl" />
      </div>
    </div>
  );
};

export const CartPageSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 p-4 animate-in fade-in duration-150">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-7 w-32 rounded-lg" />
        <Skeleton className="h-3.5 w-44 rounded-md" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
      <Skeleton className="h-36 w-full rounded-2xl mt-2" />
      <Skeleton className="h-48 w-full rounded-2xl mt-1" />
    </div>
  );
};

export const ProductDetailsSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 p-4 animate-in fade-in duration-150">
      <Skeleton className="w-full aspect-[4/5] rounded-3xl" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-3/4 rounded-lg" />
        <Skeleton className="h-7 w-24 rounded-md" />
      </div>
      <Skeleton className="h-12 w-full rounded-2xl mt-2" />
      <Skeleton className="h-14 w-full rounded-2xl mt-2" />
    </div>
  );
};

export const CalculatorSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 p-4 animate-in fade-in duration-150">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-7 w-36 rounded-lg" />
        <Skeleton className="h-4 w-64 rounded-md" />
      </div>
      <Skeleton className="h-44 w-full rounded-3xl" />
      <Skeleton className="h-32 w-full rounded-3xl" />
    </div>
  );
};

export const NotificationsPageSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 p-4 animate-in fade-in duration-150">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-7 w-40 rounded-lg" />
          <Skeleton className="h-3.5 w-60 rounded-md" />
        </div>
        <Skeleton className="h-8 w-24 rounded-xl" />
      </div>
      <div className="flex gap-2 py-1">
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      <div className="flex flex-col gap-3 pt-1">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
    </div>
  );
};

export const ReelsSkeleton: React.FC = () => {
  return (
    <div className="w-full h-full min-h-screen bg-brand-neutral-950 flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-sm aspect-[9/16] rounded-3xl overflow-hidden bg-brand-neutral-900 border border-brand-neutral-800 flex flex-col justify-between p-4 animate-pulse">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-20 rounded-full bg-brand-neutral-800" />
          <Skeleton className="h-8 w-8 rounded-full bg-brand-neutral-800" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-28 rounded-md bg-brand-neutral-800" />
          <Skeleton className="h-3 w-48 rounded-md bg-brand-neutral-800" />
          <Skeleton className="h-9 w-full rounded-xl bg-brand-neutral-800 mt-2" />
        </div>
      </div>
    </div>
  );
};

