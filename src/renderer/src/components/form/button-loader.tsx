import { Button, ButtonProps } from "@/renderer/components/ui/button";
import { Loader } from "lucide-react";

/**
 *
 * @param ButtonProps
 * @param isLoading boolean
 * * use when is action isloading
 * @param pendingText string
 * @returns ReactNode
 */
export function ButtonLoader({
  isLoading,
  isLoadingText,
  ...props
}: React.PropsWithChildren<
  ButtonProps & { isLoading?: boolean; isLoadingText?: string }
>): React.ReactNode {
  return (
    <Button type="submit" disabled={isLoading} {...props}>
      {isLoading ? (
        <span className="flex justify-center items-center gap-2">
          <Loader className="h-4 w-4 animate-spin" />
          {isLoadingText}
        </span>
      ) : (
        props.children
      )}
    </Button>
  );
}
