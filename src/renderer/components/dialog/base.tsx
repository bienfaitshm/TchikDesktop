import * as React from "react";
import { DialogContent as DialogBaseContent } from "@/renderer/components/ui/dialog";
import { cn } from "@/renderer/utils";

type DialogContentProps = React.ComponentProps<typeof DialogBaseContent>;

/**
 * Custom dialog content container providing responsive width constraints and vertical layout.
 * @param props - Dialog content properties including CSS class overrides.
 * @returns Rendered dialog content component.
 */
export const DialogContent = ({
  className,
  ...props
}: DialogContentProps): React.JSX.Element => {
  return (
    <DialogBaseContent
      className={cn(
        "px-4 pt-6 sm:max-w-lg md:max-w-2xl lg:max-w-4xl flex flex-col max-h-[85vh]",
        className,
      )}
      {...props}
    />
  );
};
DialogContent.displayName = "DialogContent";

/**
 * Scrollable container intended for long dialog body content.
 * @param props - Standard HTML div element attributes.
 * @returns Rendered HTML div element configured with scrollbar styling.
 */
export const DialogContainer = ({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element => {
  return (
    <div
      className={cn(
        "-mx-4 my-2 overflow-y-auto border-t border-border/60 px-4 py-4 max-h-[60vh] scrollbar-thin scrollbar-thumb-muted-foreground/20",
        className,
      )}
      {...props}
    />
  );
};
DialogContainer.displayName = "DialogContainer";

export {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/renderer/components/ui/dialog";
