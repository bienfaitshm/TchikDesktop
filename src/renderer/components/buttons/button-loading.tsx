import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import { cn } from "@/renderer/utils";

type ButtonProps = React.ComponentProps<typeof Button>;

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    { className, loading = false, loadingText, children, disabled, ...props },
    ref,
  ) => {
    return (
      <Button
        ref={ref}
        disabled={loading || disabled}
        className={cn("relative gap-2 min-w-28", className)}
        {...props}
      >
        {loading && (
          <Loader2
            className="h-4 w-4 animate-spin shrink-0"
            aria-hidden="true"
          />
        )}

        {loading && loadingText ? (
          <span className="truncate">{loadingText}</span>
        ) : (
          <>{children}</>
        )}
      </Button>
    );
  },
);

LoadingButton.displayName = "LoadingButton";

export { LoadingButton };
