import { Button } from "@/renderer/components/ui/button";
import { LucideBrainCircuit } from "lucide-react";

type ButtonProps = React.ComponentProps<typeof Button>;

export const ButtonAi: React.FC<ButtonProps> = (props) => {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className="size-8 relative"
      {...props}
    >
      {/* L'effet de Ping en arrière-plan */}
      <LucideBrainCircuit className="size-5 animate-ping absolute opacity-75 text-primary" />

      {/* L'icône principale au premier plan */}
      <LucideBrainCircuit className="size-5 relative z-10" />
    </Button>
  );
};
