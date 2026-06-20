import { Button } from "@/renderer/components/ui/button";
import { LucideBrainCircuit } from "lucide-react";

type ButtonProps = React.ComponentProps<typeof Button>;

export const ButtonAi: React.FC<ButtonProps> = (props) => {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className="size-8 animate-pulse"
      {...props}
    >
      <LucideBrainCircuit className="size-5" />
    </Button>
  );
};
