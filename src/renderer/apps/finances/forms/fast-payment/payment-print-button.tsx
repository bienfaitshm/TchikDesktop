import React, { useMemo } from "react";
import { Link } from "react-router";
import { Printer, AlertTriangle, WifiOff, ExternalLink } from "lucide-react";
import { LoadingButton } from "@/renderer/components/buttons/button-loading";
import { usePrinterSettings } from "@/renderer/screens/settings/settings.printer";
import { APP_ROUTES } from "@/renderer/constants";
import type { Ticket } from "./hooks";

/**
 * Props for the PaymentPrintButton component.
 */
export interface PaymentPrintButtonProps {
  /** Indicates whether a valid payment transaction has been processed. */
  isRealTicket?: boolean;
  /** The ticket data containing printing state and invoice details. */
  ticketPreview?: Ticket;
  /** Callback function triggered upon clicking the print button. */
  handlePrint?: () => void;
  /** Flag indicating whether a print job is actively processing. */
  isPrinting?: boolean;
}

/**
 * Renders status alerts and configuration shortcuts based on printer connectivity state.
 * @param props - Sub-component properties.
 * @returns Formatted status notification element or null.
 */
const PrinterStatusNotice: React.FC<{
  isConfigured: boolean;
  isConnected: boolean;
}> = ({ isConfigured, isConnected }) => {
  if (!isConfigured) {
    return (
      <div className="mt-2 w-full rounded-md border border-amber-500/20 bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-400">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>Aucune imprimante configurée.</span>
        </div>
        <div className="w-full flex items-center justify-end">
          <Link
            to={APP_ROUTES.SETTINGS.ROOT}
            className="inline-flex items-center gap-1 font-medium underline hover:text-amber-900 dark:hover:text-amber-200"
          >
            <span>Configurer</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="mt-2 rounded-md border border-destructive/20 bg-destructive/10 p-2 text-[11px] text-destructive">
        <div className="flex items-center gap-1.5">
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
          <span>Imprimante hors ligne ou non joignable.</span>
        </div>
        <div className="w-full flex items-center justify-end">
          <Link
            to={APP_ROUTES.SETTINGS.ROOT}
            className="inline-flex items-center gap-1 font-medium underline hover:opacity-80"
          >
            <span>Vérifier</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    );
  }

  return null;
};

/**
 * Main print button component for payment tickets with status feedback.
 * @param props - PaymentPrintButtonProps configuration object.
 * @returns Rendered print trigger button and status indicators.
 */
export const PaymentPrintButton: React.FC<PaymentPrintButtonProps> = ({
  ticketPreview,
  isRealTicket = false,
  handlePrint,
  isPrinting = false,
}) => {
  const { posPrint, isConnected } = usePrinterSettings();

  const isPrinterConfigured = Boolean(posPrint);
  const isButtonDisabled = !isRealTicket || !isConnected || isPrinting;

  const buttonLabel = useMemo(() => {
    if (!isRealTicket) {
      return "Validez l'encaissement pour imprimer";
    }
    return ticketPreview?.isPrinted
      ? "Réimprimer la facture"
      : "Imprimer la facture";
  }, [isRealTicket, ticketPreview?.isPrinted]);

  return (
    <div className="w-full">
      <LoadingButton
        type="button"
        onClick={handlePrint}
        disabled={isButtonDisabled}
        loading={isPrinting}
        className="w-full font-sans text-xs font-semibold"
        size="sm"
        variant="outline"
      >
        <Printer className="mr-2 h-3.5 w-3.5 shrink-0" />
        <span>{buttonLabel}</span>
      </LoadingButton>

      <PrinterStatusNotice
        isConfigured={isPrinterConfigured}
        isConnected={isConnected}
      />
    </div>
  );
};
