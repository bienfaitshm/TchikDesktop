import { useCallback } from "react";
import {
  ActionPrintContainer,
  PrinterConfigView,
  PrintInvoiceButton,
} from "@/renderer/components/invoices/invoice-print";
import { usePrintInvoiceForm } from "@/renderer/libs/queries/printing";
import { LoadingButton } from "@/renderer/components/buttons/button-loading";
import { XCircleIcon } from "lucide-react";
import { useCancelStudentPaymentForm } from "@/renderer/libs/queries/finances";
import type { CancelPaymentResult } from "@/packages/@core/data-access/db";

export type InvoiceViewerPrintingProps = {
  invoiceViewer?: React.ReactNode;
  canCancelPayment?: boolean;
  isReady: boolean;
  invoiceRef?: string;
  paymentId?: string;
  isPrinted?: boolean;
  invoiceCode?: string;
  isCanceled?: boolean;
  onSuccessPrint?: (data: {
    id: string;
    invoiceCode: string;
    invoiceRef: string;
  }) => void;
  onSuccessCancelPayment?: (data: CancelPaymentResult) => void;
};

/**
 * Manages invoice preview state, ticket print mutations, and payment cancellation actions.
 * @param props - Component configuration props including readiness, identifiers, and callbacks.
 * @returns The structured invoice printing and action container element.
 */
export const InvoiceViewerPrinting: React.FC<InvoiceViewerPrintingProps> = ({
  isReady,
  isPrinted,
  isCanceled,
  canCancelPayment,
  paymentId,
  invoiceRef,
  invoiceViewer,
  invoiceCode = "payment",
  onSuccessPrint,
  onSuccessCancelPayment,
}) => {
  const cancelPayment = useCancelStudentPaymentForm({
    onSuccess(data) {
      onSuccessCancelPayment?.(data);
    },
  });
  const { isSubmitting, onSubmit } = usePrintInvoiceForm({
    onSuccess: onSuccessPrint,
  });

  const handlePrint = useCallback((): void => {
    if (paymentId && invoiceRef) {
      onSubmit({
        invoiceCode,
        id: paymentId,
        invoiceRef,
      });
    }
  }, [paymentId, invoiceRef, invoiceCode, onSubmit]);

  return (
    <ActionPrintContainer isPending={isSubmitting} isPrinted={isPrinted}>
      {invoiceViewer}
      <PrinterConfigView>
        {(isConfig, isConnected) => (
          <div className="flex items-center justify-end gap-3 w-full max-w-md">
            <LoadingButton
              variant="destructive"
              size="sm"
              className="text-xs rounded-full"
              loading={cancelPayment.isSubmitting}
              disabled={
                isSubmitting ||
                canCancelPayment ||
                cancelPayment.isSubmitting ||
                !paymentId
              }
              onClick={() => paymentId && cancelPayment.onSubmit({ paymentId })}
            >
              <XCircleIcon />
              <span>
                {isCanceled ? "Paiement annule" : "Annuler le paiement"}
              </span>
            </LoadingButton>
            <PrintInvoiceButton
              disabled={!isConnected || !isConfig}
              isPrinted={isPrinted}
              isPrinting={isSubmitting}
              isReady={isReady}
              onClick={handlePrint}
            />
          </div>
        )}
      </PrinterConfigView>
    </ActionPrintContainer>
  );
};
