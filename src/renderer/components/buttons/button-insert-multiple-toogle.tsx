import React, { forwardRef, useCallback, useState } from "react";
import { ListOrderedIcon } from "lucide-react";
import { Toggle } from "@/renderer/components/ui/toggle";
import { cn } from "@/renderer/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/renderer/components/ui/tooltip";

/**
 * Hook mis à jour pour matcher l'API native de Shadcn / Radix Toggle.
 * Permet un couplage parfait et ultra-rapide avec le composant.
 */
export const useButtonInsertToggle = (initialState = false) => {
  const [isMultiple, setIsMultiple] = useState<boolean>(initialState);

  const toggle = useCallback(() => {
    setIsMultiple((prev) => !prev);
  }, []);

  return {
    pressed: isMultiple,
    onPressedChange: setIsMultiple,
    toggle,
  };
};

export interface ButtonInsertMultipleToggleProps extends React.ComponentPropsWithoutRef<
  typeof Toggle
> {
  tooltipLabel?: string;
}

export const ButtonInsertMultipleToggle = forwardRef<
  HTMLButtonElement,
  ButtonInsertMultipleToggleProps
>(
  (
    {
      className,
      tooltipLabel = "Insertion Multiple",
      variant = "default",
      size = "sm",
      ...props
    },
    ref,
  ) => {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={400}>
          <TooltipTrigger asChild>
            <Toggle
              ref={ref}
              size={size}
              variant={variant}
              className={cn(
                "absolute top-2 right-12 transition-all duration-200",
                className,
              )}
              {...props}
            >
              <ListOrderedIcon
                className="size-3.5 shrink-0"
                aria-hidden="true"
              />
              <span className="sr-only">{tooltipLabel}</span>
            </Toggle>
          </TooltipTrigger>
          <TooltipContent side="top" align="center" className="text-xs">
            {tooltipLabel}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);

ButtonInsertMultipleToggle.displayName = "ButtonInsertMultipleToggle";
