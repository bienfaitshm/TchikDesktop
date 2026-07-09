import { Button } from "@/renderer/components/ui/button";
import { MoreHorizontalIcon } from "lucide-react";

type ButtonProps = React.ComponentProps<typeof Button>;

export const ButtonMenu: React.FC<ButtonProps> = (props) => {
  return (
    <Button type="button" size="icon-xs" variant="ghost" {...props}>
      <MoreHorizontalIcon />
      <span className="sr-only">Open menu</span>
    </Button>
  );
};
