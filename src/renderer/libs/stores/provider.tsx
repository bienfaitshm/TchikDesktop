"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useConfigStore, useIsConfigHydrated } from "./app-store";

interface StoreProviderProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function StoreProvider({
  children,
  fallback = null,
}: StoreProviderProps) {
  const initialized = useRef(false);
  const _hasHydrated = useIsConfigHydrated();

  useEffect(() => {
    // Évite la double exécution en React Strict Mode
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      const actions = useConfigStore.getState().actions;

      // 1. Charger la config locale depuis electron-store
      await actions.initStore();

      // 2. Vérifier/Synchroniser la fraîcheur des données avec la BDD
      await actions.syncFreshData();
    };

    init();
  }, []);

  // On attend l'hydratation initiale pour éviter d'afficher des vues sans config
  if (!_hasHydrated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
