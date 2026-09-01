"use client";

import React from "react";
import { useLoadingTimeout } from "@/hooks/useLoadingTimeout";
import { LoadingTimeoutState } from "./LoadingTimeoutState";

export interface PageLoadingWrapperProps {
  isLoading: boolean;
  skeleton: React.ReactNode;
  onRetry?: () => void;
  timeoutMs?: number;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export const PageLoadingWrapper: React.FC<PageLoadingWrapperProps> = ({
  isLoading,
  skeleton,
  onRetry,
  timeoutMs = 8000,
  title,
  description,
  children,
}) => {
  const { hasTimedOut, resetTimeout } = useLoadingTimeout(isLoading, {
    timeoutMs,
  });

  if (isLoading) {
    if (hasTimedOut) {
      return (
        <LoadingTimeoutState
          title={title}
          description={description}
          onRetry={
            onRetry
              ? () => {
                  resetTimeout();
                  onRetry();
                }
              : undefined
          }
        />
      );
    }
    return <>{skeleton}</>;
  }

  return <>{children}</>;
};
