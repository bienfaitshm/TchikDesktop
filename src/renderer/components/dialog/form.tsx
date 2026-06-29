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

type DialogChildrenRenderProps = {
  onClose: () => void;
};

export interface DialogFormProps {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  children?:
    | React.ReactNode
    | ((props: DialogChildrenRenderProps) => React.ReactNode);
  formId?: string;
  isLoading?: boolean;
  submitText?: string;
}

export const DialogForm: React.FC<DialogFormProps> = ({
  trigger,
  title,
  description,
  formId,
  isLoading = false,
  submitText = "Enregistrer",
  children,
}) => {
  const [open, setOpen] = React.useState(false);

  const handleClose = React.useCallback(() => {
    if (!isLoading) setOpen(false);
  }, [isLoading]);

  const handleContentInteract = React.useCallback(
    (e: Event) => {
      if (isLoading) e.preventDefault();
    },
    [isLoading],
  );

  return (
    <Dialog
      modal={true}
      open={open}
      onOpenChange={isLoading ? undefined : setOpen}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent
        className="sm:max-w-lg md:max-w-2xl lg:max-w-4xl flex flex-col max-h-[85vh]"
        onPointerDownOutside={handleContentInteract}
        onEscapeKeyDown={handleContentInteract}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="-mx-4 my-2 overflow-y-auto border-t border-border/60 px-4 py-4 max-h-[60vh] scrollbar-thin scrollbar-thumb-muted-foreground/20">
          {typeof children === "function"
            ? children({ onClose: handleClose })
            : children}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={handleClose}
            >
              Annuler
            </Button>
          </DialogClose>
          <LoadingButton form={formId} type="submit" loading={isLoading}>
            {submitText}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

DialogForm.displayName = "DialogForm";
