import { RefreshCcw, Wand2 } from "lucide-react";
import {
  ButtonLoader,
  ButtonLoaderProps,
} from "@/renderer/components/form/button-loader";
import React from "react";

type ButtonGeneratorProps = ButtonLoaderProps & {
  hasGenerated?: boolean;
};

/**
 * ButtonGenerator
 * Spécialisation du ButtonLoader pour la génération de plan.
 * Alterne l'icône et le texte selon l'état 'hasGenerated'.
 */
const ButtonGenerator = React.forwardRef<
  HTMLButtonElement,
  ButtonGeneratorProps
>(({ hasGenerated = false, ...props }, ref) => {
  const renderContent = () => {
    if (hasGenerated) {
      return (
        <>
          <RefreshCcw className="mr-2 size-4" />
          Régénérer le plan
        </>
      );
    }

    return (
      <>
        <Wand2 className="mr-2 size-4" />
        Générer le placement
      </>
    );
  };

  return (
    <ButtonLoader
      ref={ref}
      variant={hasGenerated ? "outline" : "default"}
      className="rounded-md px-6"
      isLoadingText="Calcul du placement..."
      {...props}
    >
      {renderContent()}
    </ButtonLoader>
  );
});

ButtonGenerator.displayName = "ButtonGenerator";

export default ButtonGenerator;
