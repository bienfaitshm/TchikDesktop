import { useGetCurrentYearSchool } from "@/renderer/libs/stores/app-store";
import { cn } from "@/renderer/utils";
import { ComponentType } from "react";

/**
 * Propriétés pour l'écran affiché.
 * schoolId est l'identifiant de l'école et est obligatoire.
 * yearId est l'identifiant de l'année et est maintenant obligatoire.
 */
interface ScreenProps {
    schoolId: string;
    yearId?: string;
}

/**
 * Propriétés pour le composant LoaderCurrentConfig.
 * screen est le composant à rendre une fois les données chargées.
 * className permet de passer des classes CSS supplémentaires.
 */
interface LoaderCurrentConfigProps {
    screen: ComponentType<ScreenProps>;
    className?: string;
}

/**
 * Composant qui charge les identifiants d'école et d'année,
 * puis rend un composant d'écran avec ces données.
 * Affiche un message de configuration si les données ne sont pas encore disponibles.
 */
export const LoaderCurrentConfig = ({ screen: Screen, className }: LoaderCurrentConfigProps) => {
    const { schoolId, yearId } = useGetCurrentYearSchool();

    if (!schoolId || !yearId) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full text-muted-foreground text-center p-4">
                <p className="text-lg font-semibold">Veuillez configurer l'école et l'année scolaire en cours.</p>
                <p className="mt-2 text-sm">Rendez-vous dans les paramètres de l'application pour choisir les valeurs par défaut.</p>
            </div>
        );
    }

    return (
        <div className={cn("h-full w-full", className)}>
            <Screen schoolId={schoolId} yearId={yearId} />
        </div>
    );
};