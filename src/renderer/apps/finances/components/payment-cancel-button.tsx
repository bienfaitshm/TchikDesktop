import { useCallback, useState } from "react";
import { XCircleIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Invoice } from "@/renderer/libs/invoice-preview-printing";
import { useCancelStudentPaymentForm } from "@/renderer/libs/queries/finances";
import { LoadingButton } from "@/renderer/components/buttons/button-loading";

/**
 * Properties for the CancelPaymentButton component.
 */
export type CancelPaymentButtonProps = {
  /** The invoice record linked to the payment to cancel. */
  invoice: Invoice;
  /** Whether the payment is currently canceled. */
  isCanceled?: boolean;
};

/**
 * Renders a confirmation dialog button to cancel a payment,
 * or a status badge if the payment is already canceled.
 *
 * @param props - Component props containing invoice data and cancellation state.
 * @returns The rendered JSX element.
 */
export function CancelPaymentButton({
  invoice,
  isCanceled = false,
}: CancelPaymentButtonProps): React.JSX.Element {
  const cancelPayment = useCancelStudentPaymentForm();
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  /**
   * Triggers the payment cancellation query and closes the confirmation modal.
   */
  const handleConfirm = useCallback(() => {
    cancelPayment.onSubmit({ paymentId: invoice.id });
    setIsConfirmOpen(false);
  }, [invoice.id, cancelPayment]);

  /**
   * Handles the confirm button click event within the modal.
   *
   * @param event - Mouse event from the confirmation button.
   */
  const handleActionClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      handleConfirm();
    },
    [handleConfirm],
  );

  if (isCanceled) {
    return (
      <Badge
        variant="outline"
        className="gap-1.5 rounded-full border-muted-foreground/30 px-2.5 py-1 text-xs font-medium text-muted-foreground"
      >
        <XCircleIcon className="size-3.5" aria-hidden="true" />
        Paiement annulé
      </Badge>
    );
  }

  return (
    <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
      <AlertDialogTrigger asChild>
        <LoadingButton
          type="button"
          variant="destructive"
          size="sm"
          className="gap-1.5"
          loading={cancelPayment.isSubmitting}
          disabled={cancelPayment.isSubmitting}
        >
          <XCircleIcon className="size-4" aria-hidden="true" />
          Annuler le paiement
        </LoadingButton>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Annuler ce paiement ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est <strong>irréversible</strong>. Le paiement n°
            {invoice.invoiceRef} sera définitivement annulé et ne pourra plus
            être utilisé.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Retour</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleActionClick}
            className="gap-1.5 bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Confirmer l'annulation
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
