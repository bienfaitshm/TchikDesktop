import { useState, useEffect, useCallback, useRef } from "react";
import { DEFAULT_TIMEOUT_MS } from "./constant";

const IDLE_EVENTS: readonly (keyof WindowEventMap)[] = [
  "mousemove",
  "keydown",
  "wheel",
  "touchstart",
  "click",
];

const THROTTLE_DELAY_MS = 250;

export interface UseIdleReturn {
  isIdle: boolean;
  resetIdle: () => void;
  triggerIdle: () => void;
}

/**
 * Tracks user inactivity and triggers idle state after a specified timeout.
 * @param timeoutInMs - Timeout duration in milliseconds before becoming idle.
 * @returns Object containing current idle status, reset callback, and manual trigger callback.
 */
export function useIdle(
  timeoutInMs: number = DEFAULT_TIMEOUT_MS,
): UseIdleReturn {
  const [isIdle, setIsIdle] = useState<boolean>(false);
  const lastCallTime = useRef<number>(0);

  const triggerIdle = useCallback(() => {
    setIsIdle(true);
  }, []);

  const resetIdle = useCallback(() => {
    lastCallTime.current = 0;
    setIsIdle(false);
  }, []);

  useEffect(() => {
    if (isIdle) return;

    let timer: ReturnType<typeof setTimeout>;

    const updateTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setIsIdle(true), timeoutInMs);
    };

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastCallTime.current >= THROTTLE_DELAY_MS) {
        lastCallTime.current = now;
        updateTimer();
      }
    };

    IDLE_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    updateTimer();

    return () => {
      IDLE_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearTimeout(timer);
    };
  }, [timeoutInMs, isIdle]);

  return { isIdle, resetIdle, triggerIdle };
}
