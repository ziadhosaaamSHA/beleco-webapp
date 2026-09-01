"use client";

import { useState, useEffect, useCallback } from "react";

export interface UseLoadingTimeoutOptions {
  timeoutMs?: number;
  onTimeout?: () => void;
}

export function useLoadingTimeout(
  isLoading: boolean,
  options: UseLoadingTimeoutOptions = {}
) {
  const { timeoutMs = 8000, onTimeout } = options;
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setHasTimedOut(false);
      return;
    }

    const timer = setTimeout(() => {
      setHasTimedOut(true);
      onTimeout?.();
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [isLoading, timeoutMs, onTimeout]);

  const resetTimeout = useCallback(() => {
    setHasTimedOut(false);
  }, []);

  return { hasTimedOut, resetTimeout };
}
