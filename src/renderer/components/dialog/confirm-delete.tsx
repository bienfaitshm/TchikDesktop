"use client";

import * as React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/renderer/components/ui/alert-dialog";
import { Button } from "@/renderer/components/ui/button";
import { cn } from "@/renderer/utils";

export type ConfirmVariant = "default" | "destructive" | "warning";

export interface ConfirmDialogProps extends React.ComponentPropsWithoutRef<
  typeof AlertDialogContent
> {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  isPending?: boolean;
}

export const ConfirmDialog = React.forwardRef<
  React.ComponentRef<typeof AlertDialogContent>,
  ConfirmDialogProps
>(
  (
    {
      isOpen,
      isPending,
      onClose,
      onConfirm,
      title = "Êtes-vous sûr ?",
      description = "Cette action est irréversible.",
      confirmText = "Confirmer",
      cancelText = "Annuler",
      variant = "default",
      className,
      ...props
    },
    ref,
  ) => {
    const handleConfirm = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      try {
        onConfirm();
      } catch (error) {
        console.error("[CONFIRM_DIALOG_ERROR]:", error);
      }
    };

    const variantStyles = {
      default: {
        iconBg: "bg-primary/10 ring-primary/5",
        iconColor: "text-primary",
        btnVariant: "default" as const,
      },
      destructive: {
        iconBg: "bg-destructive/10 ring-destructive/5",
        iconColor: "text-destructive",
        btnVariant: "destructive" as const,
      },
      warning: {
        iconBg: "bg-amber-500/10 ring-amber-500/5",
        iconColor: "text-amber-600",
        btnVariant: "default" as const,
      },
    }[variant];

    return (
      <AlertDialog
        open={isOpen}
        onOpenChange={(open) => !open && !isPending && onClose()}
      >
        <AlertDialogContent
          ref={ref}
          className={cn("max-w-[400px] gap-6 p-6", className)}
          {...props}
        >
          <AlertDialogHeader className="flex flex-col items-center gap-4 text-center sm:text-center">
            {/* Conteneur de l'icône */}
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full ring-8 transition-colors",
                variantStyles.iconBg,
              )}
            >
              <AlertTriangle
                className={cn("h-5 w-5", variantStyles.iconColor)}
                aria-hidden="true"
              />
            </div>

            <div className="space-y-1.5">
              <AlertDialogTitle className="text-lg font-semibold tracking-tight">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className="sm:justify-end gap-2">
            <AlertDialogCancel asChild disabled={isPending}>
              <Button
                variant="outline"
                className="w-full sm:w-auto min-w-[80px]"
              >
                {cancelText}
              </Button>
            </AlertDialogCancel>

            <AlertDialogAction
              asChild
              onClick={handleConfirm}
              disabled={isPending}
            >
              <Button
                variant={variantStyles.btnVariant}
                className="w-full sm:w-auto min-w-[100px]"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "Chargement..." : confirmText}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  },
);

ConfirmDialog.displayName = "ConfirmDialog";

interface ConfirmDeleteDialogProps extends Omit<ConfirmDialogProps, "variant"> {
  itemName?: string;
}

export const ConfirmDeleteDialog = ({
  itemName,
  title = "Confirmation de suppression",
  description,
  confirmText = "Supprimer",
  ...props
}: ConfirmDeleteDialogProps) => {
  const computedDescription = description ?? (
    <span>
      Voulez-vous vraiment supprimer{" "}
      <strong>{itemName || "cet élément"}</strong> ? <br />
      Cette action est irréversible.
    </span>
  );

  return (
    <ConfirmDialog
      {...props}
      variant="destructive"
      title={title}
      description={computedDescription}
      confirmText={confirmText}
    />
  );
};

ConfirmDeleteDialog.displayName = "ConfirmDeleteDialog";

export * from "./delete.hook";
