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
  DialogContainer,
} from "./base";
import { LoadingButton } from "@/renderer/components/buttons/button-loading";

type DialogChildrenRenderProps = {
  onClose: () => void;
};

export interface DialogFormProps {
  trigger?: React.ReactNode;
  title: string;
  description?: string;
  children?:
    React.ReactNode | ((props: DialogChildrenRenderProps) => React.ReactNode);
  formId?: string;
  isLoading?: boolean;
  submitText?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
}

export const DialogForm: React.FC<DialogFormProps> = ({
  trigger,
  title,
  description,
  formId,
  isLoading = false,
  submitText = "Enregistrer",
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  modal,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;

  const open = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (isLoading) return;
      if (isControlled) {
        controlledOnOpenChange?.(newOpen);
      } else {
        setInternalOpen(newOpen);
      }
    },
    [isLoading, isControlled, controlledOnOpenChange],
  );

  const handleClose = React.useCallback(() => {
    if (isLoading) return;
    if (isControlled) {
      controlledOnOpenChange?.(false);
    } else {
      setInternalOpen(false);
    }
  }, [isLoading, isControlled, controlledOnOpenChange]);

  const handleContentInteract = React.useCallback(
    (e: Event) => {
      if (isLoading) e.preventDefault();
    },
    [isLoading],
  );

  return (
    <Dialog modal={modal} open={open} onOpenChange={handleOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent
        onPointerDownOutside={handleContentInteract}
        onEscapeKeyDown={handleContentInteract}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <DialogContainer>
          {typeof children === "function"
            ? children({ onClose: handleClose })
            : children}
        </DialogContainer>

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
