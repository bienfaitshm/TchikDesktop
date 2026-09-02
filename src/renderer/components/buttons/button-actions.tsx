import { Button } from "@/components/ui/button";
import { cn } from "@/renderer/utils";
import { Plus } from "lucide-react";

export const ButtonCreate: React.FC<React.ComponentProps<typeof Button>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <Button
      size="sm"
      className={cn("rounded-full shadow-xs px-4", className)}
      {...props}
    >
      <Plus className="size-4" />
      <span>{children}</span>
    </Button>
  );
};
