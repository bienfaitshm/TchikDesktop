"use client"

import * as React from "react"
import { useGetCurrentYearSchool } from "@/renderer/libs/stores/app-store"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/renderer/components/ui/card"
import { AlertCircle } from "lucide-react"

/**
 * Types des propriétés injectées par le HOC
 */
export type WithSchoolAndYearId = {
    schoolId: string
    yearId: string
}

/**
 * Fallback Component - Optimisé pour être léger
 */
export const MissingConfigFallback = React.memo(() => (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] w-full p-4 animate-in fade-in duration-500">
        <Card className="w-full max-w-md border-destructive/20 shadow-xl overflow-hidden">
            <div className="h-1.5 bg-destructive" />
            <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                    <AlertCircle className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold tracking-tight text-destructive">
                    Configuration requise
                </CardTitle>
                <CardDescription className="text-balance">
                    L'accès à ces données nécessite qu'une école et une année scolaire soient actives.
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-0">
                <p className="text-sm text-muted-foreground leading-relaxed">
                    Veuillez vous rendre dans les <span className="font-semibold text-primary">paramètres</span> pour sélectionner la configuration actuelle.
                </p>
            </CardContent>
        </Card>
    </div>
))
MissingConfigFallback.displayName = "MissingConfigFallback"

/**
 * withSchoolConfig - Higher-Order Component
 * * @description Sécurise et injecte la configuration scolaire.
 * Utilise React.memo pour éviter les re-renders inutiles.
 */
export function withSchoolConfig<TProps extends WithSchoolAndYearId>(
    WrappedComponent: React.ComponentType<TProps>
) {
    const ComponentWithConfig = (props: Omit<TProps, keyof WithSchoolAndYearId>) => {
        // 1. Récupération optimisée (Shallow)
        const { schoolId, yearId, isConfigured } = useGetCurrentYearSchool()

        // // 2. Gestion de l'hydratation (optionnel selon ton setup)
        // const isHydrated = useIsStoreHydrated()
        // if (!isHydrated) return <LoadingSpinner />

        // 3. Garde-fou
        if (!isConfigured) {
            return <MissingConfigFallback />
        }

        // Ici, TS sait que schoolId et yearId ne sont plus undefined grâce au check isConfigured
        return (
            <WrappedComponent
                {...(props as any)}
                schoolId={schoolId!}
                yearId={yearId!}
            />
        )
    }

    return React.memo(ComponentWithConfig)
}