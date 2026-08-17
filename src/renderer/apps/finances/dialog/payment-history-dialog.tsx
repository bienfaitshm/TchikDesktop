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
import { Link } from "react-router";
import { APP_ROUTES } from "@/renderer/constants";

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
      <DialogContent className="sm:max-w-lg md:max-w-2xl lg:max-w-4xl flex flex-col max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Historique des paiements</DialogTitle>
          <DialogDescription>
            Consultez le détail des transactions et des versements effectués
            pour l'année scolaire en cours.
          </DialogDescription>
        </DialogHeader>

        <div className="-mx-4 my-2 overflow-y-auto border-t border-border/60 px-4 max-h-[40vh] scrollbar-thin scrollbar-thumb-muted-foreground/20">
          <Suspense fallback={<PaymentHistorySkeleton />}>
            <PaymentHistoryContent />
          </Suspense>
        </div>

        <DialogFooter className="sm:justify-between">
          <p className="self-center text-xs text-muted-foreground">
            Mise à jour en temps réel
          </p>
          <div className="flex items-center gap-4">
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
            <Link to={APP_ROUTES.FIN.PAYMENTS.HISTORIES}>
              <Button size="sm" className="text-xs">
                Voir plus
              </Button>
            </Link>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
