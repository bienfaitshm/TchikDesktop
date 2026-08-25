import { Lock } from "lucide-react";
import { Button } from "../ui/button";
import { useScreenSave } from "./provider";

export interface LockScreenButtonProps extends React.ComponentProps<
  typeof Button
> {
  "aria-label"?: string;
}

/**
 * Action button triggering immediate screen locking via context.
 * @param props - UI Button props.
 */
export function LockScreenButton({
  "aria-label": ariaLabel = "Verrouiller l'écran",
  variant = "ghost",
  size = "icon",
  onClick,
  ...props
}: LockScreenButtonProps): React.JSX.Element {
  const { triggerIdle } = useScreenSave();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    triggerIdle();
    onClick?.(event);
  };

  return (
    <Button
      variant={variant}
      size={size}
      aria-label={ariaLabel}
      onClick={handleClick}
      {...props}
    >
      <Lock className="h-4 w-4" />
    </Button>
  );
}
