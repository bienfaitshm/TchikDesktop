import React from "react";
import { LoadingButton } from "@/components/buttons/button-loading";
import { Link } from "react-router";
import {
  Printer,
  AlertTriangle,
  WifiOff,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { APP_ROUTES } from "@/renderer/constants";
import { Badge } from "@/components/ui/badge";
import { usePrintConfig } from "@/renderer/hooks/printer";
import { cn } from "@/renderer/utils";

/**
 * Props for the PrintInvoiceButton component.
 */
export type PrintInvoiceButtonProps = {
  /** Indicates whether the print process is currently in progress. */
  isPrinting?: boolean;
  /** Indicates whether the invoice has already been printed. */
  isPrinted?: boolean;
  /** Indicates whether the user action is validated and ready to trigger printing. */
  isReady?: boolean;
  /** Optional click handler to initiate invoice printing. */
  onClick?: () => void;
};

/**
 * Renders a button to print or reprint an invoice based on user validation and print state.
 * @param props - Component properties controlling printing states and click handler.
 * @returns Styled interactive print button with loading state support.
 */
export const PrintInvoiceButton: React.FC<PrintInvoiceButtonProps> = ({
  isPrinted = false,
  isReady = false,
  isPrinting = false,
  onClick,
}) => {
  const getButtonLabel = (): string => {
    if (!isReady) {
      return "Validez l'action pour imprimer";
    }
    return isPrinted ? "Réimprimer la facture" : "Imprimer la facture";
  };

  return (
    <LoadingButton
      type="button"
      onClick={onClick}
      disabled={!isReady || isPrinting}
      loading={isPrinting}
      className="w-full font-sans text-xs font-semibold rounded-full"
      size="sm"
      variant="outline"
    >
      <Printer className="mr-2 h-3.5 w-3.5 shrink-0" />
      <span>{getButtonLabel()}</span>
    </LoadingButton>
  );
};

/**
 * Props for the PrinterStatusNotice component.
 */
export type PrinterStatusNoticeProps = {
  /** Indicates if a printer is configured in application settings. */
  isConfigured: boolean;
  /** Indicates if the configured printer is currently online and reachable. */
  isConnected: boolean;
};

/**
 * Renders status alerts and configuration shortcuts based on printer connectivity state.
 * @param props - Component properties controlling configuration and connectivity status.
 * @returns Formatted status notification element or null when fully functional.
 */
export const PrinterStatusNotice: React.FC<PrinterStatusNoticeProps> = ({
  isConfigured,
  isConnected,
}) => {
  if (isConfigured && isConnected) {
    return null;
  }

  const isUnconfigured = !isConfigured;

  const variantStyles = isUnconfigured
    ? {
        container:
          "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs",
        link: "hover:text-amber-900 dark:hover:text-amber-200",
        message: "Aucune imprimante configurée.",
        actionLabel: "Configurer",
        Icon: AlertTriangle,
      }
    : {
        container:
          "border-destructive/20 bg-destructive/10 text-destructive text-[11px]",
        link: "hover:opacity-80",
        message: "Imprimante hors ligne ou non joignable.",
        actionLabel: "Vérifier",
        Icon: WifiOff,
      };

  const { container, link, message, actionLabel, Icon } = variantStyles;

  return (
    <div
      className={cn(
        "mt-2 w-full rounded-md border p-2 flex items-center justify-between gap-2",
        container,
      )}
    >
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span>{message}</span>
      </div>
      <Link
        to={APP_ROUTES.SETTINGS.ROOT}
        className={cn(
          "inline-flex items-center gap-1 font-medium underline shrink-0",
          link,
        )}
      >
        <span>{actionLabel}</span>
        <ExternalLink className="h-3 w-3" />
      </Link>
    </div>
  );
};

/**
 * Props for the ActionPrintContainer component.
 */
export type ActionPrintContainerProps = {
  /** Indicates whether the invoice ticket has been printed. */
  isPrinted?: boolean;
  /** Indicates whether the print job is pending execution. */
  isPending?: boolean;
};

/**
 * Wraps action items and displays status badges reflecting the invoice printing lifecycle.
 * @param props - Component properties including print status flags and child elements.
 * @returns Rendered container element with status badges.
 */
export const ActionPrintContainer: React.FC<
  React.PropsWithChildren<ActionPrintContainerProps>
> = ({ children, isPrinted = false, isPending = false }) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-between items-center w-full">
        <Badge
          variant="outline"
          className="border-primary/30 text-primary bg-primary/10 font-mono tracking-tight text-[10px]"
        >
          <span>{!isPrinted ? "APERÇU TICKET" : "DERNIER TICKET ÉMIS"}</span>
        </Badge>

        {isPrinted ? (
          <Badge
            variant="secondary"
            className="text-[10px] gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
          >
            <CheckCircle2 className="size-3 text-emerald-600" /> Imprimé
          </Badge>
        ) : isPending ? (
          <Badge
            variant="outline"
            className="text-[10px] gap-1 border-amber-500/30 text-amber-600 bg-amber-500/10 animate-pulse"
          >
            En attente d'impression
          </Badge>
        ) : null}
      </div>
      {children}
    </div>
  );
};

/**
 * Props for the PrinterConfigView component.
 */
export type PrinterConfigViewProps = {
  /** Optional render prop function receiving printer connection state. */
  children?: (isConnected: boolean) => React.ReactNode;
};

/**
 * Evaluates POS printer status and conditionally renders children via render prop pattern.
 * @param props - Component properties containing the render prop function.
 * @returns Status notice element and conditionally executed child elements.
 */
export const PrinterConfigView: React.FC<PrinterConfigViewProps> = ({
  children,
}) => {
  const { isConfigured, isConnected } = usePrintConfig();

  return (
    <>
      <PrinterStatusNotice
        isConfigured={isConfigured}
        isConnected={isConnected}
      />
      {isConfigured && children?.(isConnected)}
    </>
  );
};
