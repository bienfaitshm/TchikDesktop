import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Printer,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Settings,
  XCircle,
} from "lucide-react";
import { cn } from "@/renderer/utils";

/**
 * Represented state statuses for the attached receipt or document printer.
 */
export type PrinterStateStatus =
  "checking" | "disconnected" | "connected" | "configured" | "error";

/**
 * Payload interface representing technical printer configuration details.
 */
export interface PrinterInfoPayload {
  name?: string;
  isDefault?: boolean;
  isConfigured?: boolean;
}

/**
 * Global interface extending the window object for printer IPC bridge typing.
 */
declare global {
  interface Window {
    printer?: {
      getPrinterInfo: () => Promise<PrinterInfoPayload>;
      onStatusChange: (
        callback: (
          status: PrinterStateStatus,
          info?: PrinterInfoPayload,
        ) => void,
      ) => () => void;
    };
  }
}

/**
 * Custom hook managing printer connection listening and IPC subscription state.
 * @returns Object containing current printer status, info, error message, and refresh handler.
 */
export function usePrinterStatus() {
  const [status, setStatus] = useState<PrinterStateStatus>("checking");
  const [printerInfo, setPrinterInfo] = useState<PrinterInfoPayload | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  const checkStatus = useCallback(async (): Promise<void> => {
    setStatus("checking");
    setErrorMessage("");
    try {
      if (window.printer?.getPrinterInfo) {
        const info = await window.printer.getPrinterInfo();
        setPrinterInfo(info);
        if (!info.name) {
          setStatus("disconnected");
        } else if (info.isConfigured) {
          setStatus("configured");
        } else {
          setStatus("connected");
        }
      } else {
        setStatus("disconnected");
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setStatus("error");
      setErrorMessage(msg || "Échec de détection de l'imprimante");
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    checkStatus();

    const unsubscribe = window.printer?.onStatusChange(
      (newStatus: PrinterStateStatus, info?: PrinterInfoPayload) => {
        if (!isMounted) return;
        setStatus(newStatus);
        if (info) setPrinterInfo(info);
      },
    );

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [checkStatus]);

  return {
    status,
    printerInfo,
    errorMessage,
    refreshPrinterStatus: checkStatus,
  };
}

/**
 * Component rendering the printer connection state with an animated status dot and detail popover.
 * @returns Interactive printer status bar React element.
 */
export const PrinterStatusBar: React.FC = () => {
  const { status, printerInfo, errorMessage, refreshPrinterStatus } =
    usePrinterStatus();

  const isConfigured = status === "configured";
  const isConnected = status === "connected" || isConfigured;
  const isError = status === "error";

  const badgeColor = isConfigured
    ? "text-emerald-600 border-emerald-500/50 bg-emerald-500/10"
    : status === "connected"
      ? "text-amber-600 border-amber-500/50 bg-amber-500/10"
      : isError
        ? "text-destructive border-destructive/50"
        : "text-muted-foreground";

  const dotColor = isConfigured
    ? "bg-emerald-500"
    : status === "connected"
      ? "bg-amber-500"
      : "bg-destructive";

  return (
    <div className="flex items-center justify-end gap-3 text-xs">
      <Popover>
        <PopoverTrigger asChild>
          <div
            className={cn(
              "relative inline-flex items-center gap-1.5 font-mono text-[10px] cursor-pointer transition-colors hover:bg-accent px-2 py-0.5 select-none",
              badgeColor,
            )}
          >
            {status === "checking" ? (
              <RefreshCw className="size-2.5 animate-spin" />
            ) : (
              <span className="relative flex size-2">
                {isConnected && (
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
                  ? printerInfo?.name || "Imprimante prête"
                  : status === "connected"
                    ? "Non configurée"
                    : "Non détectée"}
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
                    Imprimante connectée et prête
                  </span>
                  <div className="text-xs text-muted-foreground bg-background p-2 rounded border space-y-1">
                    <p className="font-medium text-foreground truncate">
                      {printerInfo?.name}
                    </p>
                    {printerInfo?.isDefault && (
                      <p className="text-[10px] text-emerald-600 font-semibold">
                        Imprimante par défaut du système
                      </p>
                    )}
                  </div>
                </div>
              )}

              {status === "connected" && (
                <div className="flex flex-col gap-3 w-full">
                  <span className="flex items-center gap-2 text-xs font-medium text-amber-600">
                    <Settings className="size-4 shrink-0" />
                    Imprimante détectée mais non configurée
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Modèle détecté :{" "}
                    <span className="font-semibold text-foreground">
                      {printerInfo?.name || "Inconnu"}
                    </span>
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
                    Vérifiez que le câble USB est branché ou que l'imprimante
                    est sous tension.
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
