import React, { forwardRef } from "react";
import { Download } from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import { cn } from "@/renderer/utils";

export const ButtonExport = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, children, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      size="sm"
      variant="default"
      className={cn("gap-2 font-medium w-full", className)}
      {...props}
    >
      <Download className="size-3.5 shrink-0" aria-hidden="true" />
      <span>{children || "Exporter"}</span>
    </Button>
  );
});

ButtonExport.displayName = "ButtonExport";
