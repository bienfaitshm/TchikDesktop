import React, { ComponentType } from "react";
import { useGetCurrentYearSchool } from "@/renderer/libs/stores/app-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/renderer/components/ui/card";
import { WithSchoolAndYearId } from "@/commons/types/services";

/**
 * Composant de repli (Fallback) affiché lorsque la configuration requise est manquante.
 * @returns {JSX.Element} L'interface invitant l'utilisateur à configurer l'application.
 */
export const MissingConfigFallback: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-4">
            <Card className="w-full max-w-md text-center shadow-lg">
                <CardHeader className="pb-3">
                    <CardTitle className="text-2xl font-bold text-destructive">
                        Configuration manquante !
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                        L'application a besoin d'une configuration de base pour fonctionner.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">
                        Veuillez vous rendre dans les <span className="font-semibold text-primary">paramètres de l'application</span> pour sélectionner l'école et l'année scolaire en cours.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

/**
 * Higher-Order Component (HOC) qui injecte `schoolId` et `yearId` dans le composant enveloppé.
 * Si ces informations sont absentes du store, il bloque le rendu et affiche un message d'erreur.
 *
 * @template TProps - Les props originelles (hors schoolId et yearId) attendues par le composant.
 * @param {ComponentType<WithSchoolAndYearId<TProps>>} WrappedComponent - Le composant à envelopper.
 * @returns {React.FC<TProps>} Un nouveau composant sécurisé avec la configuration injectée.
 */
export function withSchoolConfig<TProps extends object>(
    WrappedComponent: ComponentType<WithSchoolAndYearId<TProps>>
) {
    const ComponentWithConfig: React.FC<TProps> = (props) => {
        const { schoolId, yearId } = useGetCurrentYearSchool();

        // Vérification de la configuration
        if (!schoolId || !yearId) {
            return <MissingConfigFallback />;
        }

        // Rendu du composant avec les props d'origine + les props injectées
        return (
            <WrappedComponent
                {...(props as TProps)}
                schoolId={schoolId}
                yearId={yearId}
            />
        );
    };

    // Configuration du nom d'affichage pour les React DevTools
    const displayName = WrappedComponent.displayName || WrappedComponent.name || "Component";
    ComponentWithConfig.displayName = `withSchoolConfig(${displayName})`;
    console.log("withShoolConfig", ComponentWithConfig.displayName)
    return ComponentWithConfig;
}