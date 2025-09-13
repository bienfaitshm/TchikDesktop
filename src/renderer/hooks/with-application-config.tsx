import { useGetCurrentYearSchool } from "@/renderer/libs/stores/app-store";
import React, { ComponentType } from "react";
// Assurez-vous d'avoir installé ces composants Shadcn UI :
// npx shadcn-ui@latest add card
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/renderer/components/ui/card";
import { WithSchoolAndYearId } from "@/commons/types/services";

/**
 * `withCurrentConfig` est un Higher-Order Component (HOC) qui assure
 * que le composant enveloppé reçoit les props `schoolId` et `yearId`
 * de la configuration globale de l'application.
 *
 * Si l'école ou l'année scolaire ne sont pas configurées, le HOC affiche
 * un message convivial guidant l'utilisateur
 * vers les paramètres.
 *
 * @template TProps Le type des props attendues par le composant à envelopper.
 * Ce type *doit inclure* `schoolId: string` et `yearId: string`.
 * @param {ComponentType<TProps>} WrappedComponent Le composant React à améliorer.
 * @returns {React.FC<TProps>} Un nouveau composant fonctionnel React. Ce composant
 * accepte les mêmes props que le `WrappedComponent`,
 * mais `schoolId` et `yearId` sont automatiquement
 * fournis (ou surchargés) par le HOC à partir du store global.
 */
export function withCurrentConfig<TProps>(
    WrappedComponent: ComponentType<WithSchoolAndYearId<TProps>>
) {
    const ComponentWithConfig: React.FC<Partial<TProps>> = (props) => {
        const { schoolId, yearId } = useGetCurrentYearSchool();

        if (!schoolId || !yearId) {
            return (
                <div className="flex flex-col items-center justify-center h-full w-full p-4">
                    <Card className="w-full max-w-md text-center shadow-lg">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-2xl font-bold text-destructive">Configuration manquante !</CardTitle>
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
        }
        return (
            <WrappedComponent
                {...props}
                schoolId={schoolId}
                yearId={yearId}
            />
        );
    };

    ComponentWithConfig.displayName = `withCurrentConfig(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return ComponentWithConfig;
}