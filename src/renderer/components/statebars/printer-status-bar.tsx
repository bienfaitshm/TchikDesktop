import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertCircle,
  CheckCircle2,
  Printer,
  RefreshCw,
  Settings,
  XCircle,
} from "lucide-react";
import { cn } from "@/renderer/utils";
import { usePrintConfig } from "@/renderer/hooks/use-print-config";

/** High level state representing connection & configuration status. */
export type PrinterStateStatus =
  "checking" | "disconnected" | "unconfigured" | "configured" | "error";

/**
 * Hook subscribing to IPC hardware changes and resolving configuration state.
 * @returns State object describing status flags, active target printer, and refresh handler.
 */
export function usePrinterStatus() {
  const [status, setStatus] = useState<PrinterStateStatus>("checking");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { posPrint, isConfigured, isConnected } = usePrintConfig();

  const checkStatus = useCallback(async (): Promise<void> => {
    setStatus("checking");
    setErrorMessage("");
    try {
      if (!window.printer?.getPrinterInfo) {
        setStatus("disconnected");
        return;
      }
      const data = await window.printer.getPrinterInfo();
      setStatus("configured");
      // if (!data.hasDevices || data.printers.length === 0) {
      //   setStatus("disconnected");
      // } else if (isConnected && isConfigured) {
      //   setStatus("configured");
      // } else {
      //   setStatus("unconfigured");
      // }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setStatus("error");
      setErrorMessage(msg || "Printer detection failure");
    }
  }, [isConfigured, isConnected]);

  useEffect(() => {
    let isMounted = true;

    checkStatus();

    const unsubscribe = window.printer?.onStatusChange(() => {
      console.log("Status..... onStatusChange");
      if (isMounted) {
        checkStatus();
      }
    });

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [checkStatus]);

  return {
    status,
    activePrinterName:
      posPrint?.posPrinter?.name ||
      posPrint?.posPrinter?.name ||
      "activePrinterName",
    errorMessage,
    refreshPrinterStatus: checkStatus,
  };
}

/**
 * Renders real-time printer connectivity and configuration status bar element.
 * @returns JSX element.
 */
export const PrinterStatusBar: React.FC = () => {
  const { status, activePrinterName, errorMessage, refreshPrinterStatus } =
    usePrinterStatus();

  const isConfigured = status === "configured";
  const isUnconfigured = status === "unconfigured";
  const isError = status === "error";

  const badgeColor = isConfigured
    ? "text-emerald-600 border-emerald-500/50 bg-emerald-500/10"
    : isUnconfigured
      ? "text-amber-600 border-amber-500/50 bg-amber-500/10"
      : isError
        ? "text-destructive border-destructive/50"
        : "text-muted-foreground";

  const dotColor = isConfigured
    ? "bg-emerald-500"
    : isUnconfigured
      ? "bg-amber-500"
      : "bg-destructive";

  return (
    <div className="flex items-center justify-end gap-3 text-xs">
      <Popover>
        <PopoverTrigger asChild>
          <div
            className={cn(
              "relative inline-flex items-center gap-1.5 font-mono text-[10px] cursor-pointer transition-colors hover:bg-accent px-2 py-0.5 select-none rounded border",
              badgeColor,
            )}
          >
            {status === "checking" ? (
              <RefreshCw className="size-2.5 animate-spin" />
            ) : (
              <span className="relative flex size-2">
                {(isConfigured || isUnconfigured) && (
                  <span
                    className={cn(
                      "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                      dotColor,
                    )}
                  />
                )}
                <span
                  className={cn(
                    "relative inline-flex size-2 rounded-full",
                    dotColor,
                  )}
                />
              </span>
            )}
            <Printer className="size-3 ml-0.5" />
            <span>
              {status === "checking"
                ? "Détection..."
                : isConfigured
                  ? activePrinterName || "Imprimante prête"
                  : isUnconfigured
                    ? "À configurer"
                    : "Déconnectée"}
            </span>
          </div>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-80 p-4" sideOffset={8}>
          <div className="space-y-3">
            <div className="space-y-1">
              <h4 className="font-semibold leading-none flex items-center gap-2 text-sm">
                <Printer className="size-4 text-muted-foreground" />
                Statut de l'imprimante
              </h4>
              <p className="text-xs text-muted-foreground">
                Vérifiez la connexion et le paramétrage du matériel.
              </p>
            </div>

            <div className="flex items-center justify-center rounded-md border bg-muted/40 p-3">
              {status === "checking" && (
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <RefreshCw className="size-4 animate-spin" />
                  Recherche d'imprimantes...
                </span>
              )}

              {status === "configured" && (
                <div className="flex flex-col gap-2 w-full">
                  <span className="flex items-center gap-2 text-xs font-medium text-emerald-600">
                    <CheckCircle2 className="size-4 shrink-0" />
                    Imprimante connectée et configurée
                  </span>
                  <div className="text-xs text-muted-foreground bg-background p-2 rounded border space-y-1">
                    <p className="font-medium text-foreground truncate">
                      {activePrinterName}
                    </p>
                  </div>
                </div>
              )}

              {status === "unconfigured" && (
                <div className="flex flex-col gap-3 w-full">
                  <span className="flex items-center gap-2 text-xs font-medium text-amber-600">
                    <Settings className="size-4 shrink-0" />
                    Imprimante détectée mais non configurée
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Un périphérique est branché. Veuillez sélectionner cette
                    imprimante dans les paramètres POS.
                  </p>
                </div>
              )}

              {status === "disconnected" && (
                <div className="flex flex-col gap-3 w-full text-center">
                  <span className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
                    <XCircle className="size-4 shrink-0 text-destructive" />
                    Aucune imprimante détectée
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Vérifiez le branchement USB ou la mise sous tension de
                    l'imprimante.
                  </p>
                </div>
              )}

              {status === "error" && (
                <div className="flex items-start gap-2 text-xs font-medium text-destructive w-full">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>
                    {errorMessage || "Erreur de communication imprimante."}
                  </span>
                </div>
              )}
            </div>

            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs"
              onClick={refreshPrinterStatus}
              disabled={status === "checking"}
            >
              <RefreshCw
                className={cn(
                  "mr-2 size-3.5",
                  status === "checking" && "animate-spin",
                )}
              />
              Rechercher à nouveau
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
