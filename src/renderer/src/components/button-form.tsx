import { Button, ButtonProps } from "@renderer/components/ui/button";
import { Loader } from "lucide-react";

/**
 *
 * @param ButtonProps
 * @param isPending boolean
 * * use when is action isloading
 * @param pendingText string
 * @returns ReactNode
 */
export function ButtonForm({
  isPending,
  isPendingText,
  ...props
}: React.PropsWithChildren<
  ButtonProps & { isPending?: boolean; isPendingText?: string }
>): React.ReactNode {
  return (
    <Button type="submit" disabled={isPending} {...props}>
      {isPending ? (
        <span className="flex justify-center items-center gap-2">
          <Loader className="h-4 w-4 animate-spin" />
          {isPendingText}
        </span>
      ) : (
        props.children
      )}
    </Button>
  );
}
