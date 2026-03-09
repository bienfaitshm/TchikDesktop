import React from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

import { TypographyH4 } from "@/renderer/components/ui/typography";
import { Button } from "@/renderer/components/ui/button";
import { cn } from "@/renderer/utils";

/**
 * Interface des propriétés du composant ConfigHeader.
 * @property {string} title - Le titre à afficher dans le header.
 * @property {boolean} [showBackButton] - Affiche ou non le bouton de retour (par défaut: false).
 * @property {string} [className] - Classes CSS additionnelles pour le conteneur.
 */
interface ConfigHeaderProps {
    title: string;
    showBackButton?: boolean;
    className?: string;
}

/**
 * Composant de navigation d'en-tête standardisé pour les vues de configuration.
 * Gère l'affichage du titre et le retour en arrière historique.
 */
export const ConfigHeader: React.FC<ConfigHeaderProps> = ({
    title,
    showBackButton = false,
    className,
}) => {
    const navigate = useNavigate();

    return (
        <div className={cn("flex items-center gap-5", className)}>
            {showBackButton && (
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(-1)}
                    aria-label="Retour"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            )}

            <TypographyH4 className="mb-0 text-center md:text-left">
                {title}
            </TypographyH4>
        </div>
    );
};

ConfigHeader.displayName = "ConfigHeader";