import type { SystemPrinter } from "@/packages/pos-printer";
import { useGetPrinters } from "@/renderer/libs/queries/printing";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { useMemo } from "react";

/**
 * Represents a select option for available system printers.
 */
export type PrinterOption = {
  value: string;
  label: string;
};

/**
 * Return interface for the usePrintConfig hook.
 */
export type UsePrintConfigReturn = {
  /** Indicates if a POS printer is set in the application configuration. */
  isConfigured: boolean;
  /** Indicates if the configured POS printer is connected and detected by the system. */
  isConnected: boolean;
  /** List of formatted printer options for select inputs. */
  printerOptions: PrinterOption[];
  /** Current POS print configuration object. */
  posPrint: ReturnType<typeof useCurrentConfig>["posPrint"];
  /** List of raw system printers retrieved from queries. */
  printers: SystemPrinter[];
};

/**
 * Custom hook providing POS printer configuration, connectivity status, and UI options.
 * @returns Object containing printer configuration state, options, and status flags.
 */
export function usePrintConfig(): UsePrintConfigReturn {
  const { posPrint } = useCurrentConfig();
  const { data: printers = [] } = useGetPrinters();

  const printerOptions: PrinterOption[] = useMemo(
    () =>
      printers.map((item) => ({
        label: item.name || "Unknown Printer",
        value: item.value,
      })),
    [printers],
  );

  const isConnected = useMemo(() => {
    const configuredPrinterValue = posPrint?.posPrinter?.value;
    if (!configuredPrinterValue) {
      return false;
    }
    return printers.some((printer) => printer.value === configuredPrinterValue);
  }, [posPrint, printers]);

  return {
    isConfigured: Boolean(posPrint?.posPrinter),
    isConnected,
    printerOptions,
    posPrint,
    printers,
  };
}
