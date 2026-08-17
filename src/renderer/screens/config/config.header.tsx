import React, { ReactNode } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import { cn } from "@/renderer/utils";

/**
 * Interface des propriétés du composant ConfigHeader.
 * @property {string} title - Le titre à afficher dans le header.
 * @property {boolean} [showBackButton] - Affiche ou non le bouton de retour (par défaut: false).
 * @property {string} [className] - Classes CSS additionnelles pour le conteneur.
 */
interface ConfigHeaderProps {
  title: string | ReactNode;
  subTitle?: string | ReactNode;
  showBackButton?: boolean;
  className?: string;
}

/**
 * Composant de navigation d'en-tête standardisé pour les vues de configuration.
 * Gère l'affichage du titre et le retour en arrière historique.
 */
export const ConfigHeader: React.FC<ConfigHeaderProps> = ({
  title,
  subTitle,
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

      <div>
        {typeof title === "string" ? (
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        ) : (
          title
        )}
        {typeof subTitle === "string" ? (
          <p className="text-foreground text-xs">{subTitle}</p>
        ) : (
          subTitle
        )}
      </div>
    </div>
  );
};

ConfigHeader.displayName = "ConfigHeader";
