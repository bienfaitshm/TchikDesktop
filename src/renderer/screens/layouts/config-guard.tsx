"use client";

import React from "react";
import { Navigate, useLocation } from "react-router";
import { useCurrentConfig, useIsConfigHydrated } from "@/renderer/libs/stores/app-store";

/**
 * Props pour le ConfigGuard
 * @property {React.ReactNode} [loader] - Composant affiché pendant la réhydratation du store (ex: Spinner).
 * @property {string} redirectTo - Chemin de redirection si la configuration est manquante.
 */
interface ConfigGuardProps {
    loader?: React.ReactNode;
    redirectTo: string;
}

/**
 * ConfigGuard
 * 
 * Composant de contrôle d'accès qui garantit que l'application possède une configuration
 * scolaire valide (École + Année académique) avant de rendre ses enfants.
 * 
 * @example
 * <ConfigGuard redirectTo="/setup" loader={<FullScreenLoader />}>
 *   <Dashboard />
 * </ConfigGuard>
 */
export const ConfigGuard: React.FC<React.PropsWithChildren<ConfigGuardProps>> = ({
    children,
    loader = null,
    redirectTo,
}) => {
    const isHydrated = useIsConfigHydrated();
    const { isConfigured } = useCurrentConfig();
    const location = useLocation();

    if (!isHydrated) {
        return <>{loader}</>;
    }


    if (!isConfigured) {
        return (
            <Navigate
                to={redirectTo}
                state={{ from: location }}
                replace
            />
        );
    }

    return <>{children}</>;
};