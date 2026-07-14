import React, { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router";
import {
  useCurrentConfig,
  useIsConfigHydrated,
  useConfigActions,
} from "@/renderer/libs/stores/app-store";

interface ConfigGuardProps {
  loader?: React.ReactNode;
  redirectTo: string;
}

/**
 * ConfigGuard
 * Garantit que l'application est configurée localement avant d'autoriser l'accès aux routes privées,
 * puis rafraîchit les données de manière asynchrone en arrière-plan.
 */
export const ConfigGuard: React.FC<
  React.PropsWithChildren<ConfigGuardProps>
> = ({ children, loader = null, redirectTo }) => {
  const isHydrated = useIsConfigHydrated();
  const { isConfigured } = useCurrentConfig();
  const { syncFreshData } = useConfigActions();
  const location = useLocation();
  const startTime = useRef(performance.now());

  useEffect(() => {
    if (isHydrated && process.env.NODE_ENV === "development") {
      const duration = performance.now() - startTime.current;
      console.log(
        `[ConfigGuard] App store réhydraté en ${duration.toFixed(2)}ms`,
      );
    }
  }, [isHydrated]);

  useEffect(() => {
    if (isHydrated && isConfigured) {
      syncFreshData();
    }
  }, [isHydrated, isConfigured, syncFreshData]);

  if (!isHydrated) {
    return <>{loader}</>;
  }

  if (!isConfigured) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
