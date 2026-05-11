import * as React from "react";
import { Button, ButtonProps } from "@/renderer/components/ui/button";
import { Loader } from "lucide-react";

export type ButtonLoaderProps = ButtonProps & {
  isLoading?: boolean;
  isLoadingText?: string;
};

/**
 * ButtonLoader
 * Un bouton qui gère l'état de chargement avec un spinner et un texte optionnel.
 */
export const ButtonLoader = React.forwardRef<
  HTMLButtonElement,
  ButtonLoaderProps
>(({ isLoading, isLoadingText, children, disabled, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      type={props.type || "submit"}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex justify-center items-center gap-2">
          <Loader className="h-4 w-4 animate-spin" />
          {isLoadingText && <span>{isLoadingText}</span>}
        </span>
      ) : (
        children
      )}
    </Button>
  );
});

ButtonLoader.displayName = "ButtonLoader";
