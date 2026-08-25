import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useIdle } from "./useIdle";
import { Screensaver } from "./screen";
import { DEFAULT_TIMEOUT_MS } from "./constant";

export interface ScreenSaveContextValue {
  isIdle: boolean;
  resetIdle: () => void;
  triggerIdle: () => void;
}

export interface ScreenSaveProviderProps {
  children: React.ReactNode;
  timeoutInMs?: number;
  requiredPin?: string;
  lockShortcutKey?: string;
  onResetPin?: () => void;
}

const ScreenSaveContext = createContext<ScreenSaveContextValue | undefined>(
  undefined,
);

/**
 * ScreenSaveProvider wraps the application, listens for global lock shortcuts (e.g. Ctrl+L / Cmd+L),
 * and renders the security screensaver upon idle timeout or manual trigger.
 * @param props - Provider configuration options.
 */
export function ScreenSaveProvider({
  children,
  timeoutInMs = DEFAULT_TIMEOUT_MS,
  requiredPin,
  lockShortcutKey = "l",
  onResetPin,
}: ScreenSaveProviderProps): React.JSX.Element {
  const { isIdle, resetIdle, triggerIdle } = useIdle(timeoutInMs);

  // Global Keyboard Shortcut listener (Ctrl+L / Cmd+L)
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      const isControlOrMeta = event.ctrlKey || event.metaKey;
      if (
        isControlOrMeta &&
        event.key.toLowerCase() === lockShortcutKey.toLowerCase()
      ) {
        event.preventDefault();
        triggerIdle();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [lockShortcutKey, triggerIdle]);

  const contextValue = useMemo<ScreenSaveContextValue>(
    () => ({ isIdle, resetIdle, triggerIdle }),
    [isIdle, resetIdle, triggerIdle],
  );

  return (
    <ScreenSaveContext.Provider value={contextValue}>
      {children}
      {isIdle && (
        <Screensaver
          onDismiss={resetIdle}
          requiredPin={requiredPin}
          onResetPin={onResetPin}
        />
      )}
    </ScreenSaveContext.Provider>
  );
}

/**
 * Hook to consume the ScreenSaveContext values and control functions.
 * @returns Object with isIdle, resetIdle, and triggerIdle.
 */
export function useScreenSave(): ScreenSaveContextValue {
  const context = useContext(ScreenSaveContext);
  if (!context) {
    throw new Error(
      "useScreenSave must be used within a ScreenSaveProvider tree.",
    );
  }
  return context;
}
