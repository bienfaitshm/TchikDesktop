import { forwardRef } from "react";
import { Upload } from "lucide-react";
import { Button, ButtonProps } from "@/renderer/components/ui/button";
import { cn } from "@/renderer/utils";

export const ButtonExport = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size="sm"
        variant="default"
        className={cn("gap-2 font-medium active:scale-[0.98]", className)}
        {...props}
      >
        <Upload className="size-3.5 shrink-0" aria-hidden="true" />
        <span>{children || "Exporter"}</span>
      </Button>
    );
  },
);

ButtonExport.displayName = "ButtonExport";
