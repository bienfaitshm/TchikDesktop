"use client";

import { useEffect, useRef, type JSX, type ReactNode } from "react";
import { useConfigStore, useIsConfigHydrated } from "./app-store";

export interface StoreProviderProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Initializes application configuration and synchronizes data before rendering children.
 * @param props - Component props containing children and optional fallback UI.
 * @returns Fallback component while hydrating, or children once initialized.
 */
export function StoreProvider({
  children,
  fallback = null,
}: StoreProviderProps): JSX.Element {
  const initialized = useRef<boolean>(false);
  const hasHydrated = useIsConfigHydrated();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    let isMounted = true;

    const initializeStore = async (): Promise<void> => {
      const { actions } = useConfigStore.getState();

      await actions.initStore();

      if (isMounted) {
        await actions.syncFreshData();
      }
    };

    initializeStore();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!hasHydrated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
