"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Suspense } from "@/renderer/libs/queries/suspense";
import {
  PaymentHistoryContent,
  PaymentHistorySkeleton,
} from "@/renderer/apps/finances/contents/payments-history";

/**
 * Props for the PaymentHistoryDialog component.
 */
export interface PaymentHistoryDialogProps {
  /** The element that triggers the display of the dialog. */
  children: React.ReactNode;
}

/**
 * Renders a modal dialog displaying the student's payment history.
 * @param props - Component properties containing trigger elements.
 * @param props.children - The trigger UI element wrapped by DialogTrigger.
 * @returns The rendered React dialog component.
 */
export function PaymentHistoryDialog({ children }: PaymentHistoryDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Historique des paiements</DialogTitle>
          <DialogDescription>
            Consultez le détail des transactions et des versements effectués
            pour l'année scolaire en cours.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] min-h-75 overflow-y-auto pr-1">
          <Suspense fallback={<PaymentHistorySkeleton />}>
            <PaymentHistoryContent />
          </Suspense>
        </div>

        <DialogFooter className="sm:justify-between">
          <p className="self-center text-xs text-muted-foreground">
            Mise à jour en temps réel
          </p>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Fermer
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
