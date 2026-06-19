import * as React from "react";
import { Button } from "@/renderer/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/renderer/components/ui/dialog";
import { LoadingButton } from "@/renderer/components/buttons/button-loading";

export interface DialogFormProps extends React.PropsWithChildren {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  formId?: string;
  isLoading?: boolean;
}

export const DialogForm: React.FC<DialogFormProps> = ({
  trigger,
  title,
  description,
  formId,
  isLoading = false,
  children,
}) => {
  const [open, setOpen] = React.useState(false);

  const handleContentInteract = React.useCallback(
    (e: Event) => {
      if (isLoading) {
        e.preventDefault();
      }
    },
    [isLoading],
  );

  return (
    <Dialog open={open} onOpenChange={isLoading ? undefined : setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent
        className="sm:max-w-[500px] md:max-w-[700px] lg:max-w-[900px]"
        onPointerDownOutside={handleContentInteract}
        onEscapeKeyDown={handleContentInteract}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="py-4">{children}</div>

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="ghost" disabled={isLoading}>
              Annuler
            </Button>
          </DialogClose>
          <LoadingButton form={formId} type="submit" loading={isLoading}>
            Enregistrer
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

DialogForm.displayName = "DialogForm";
