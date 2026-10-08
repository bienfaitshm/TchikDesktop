import type { SystemPrinter } from "@/packages/pos-printer";
import { useGetPrinters } from "@/renderer/libs/queries/printing";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { useMemo } from "react";

/** Option item for UI select controls. */
export type PrinterOption = {
  value: string;
  label: string;
};

/** Return payload of the usePrintConfig hook. */
export type UsePrintConfigReturn = {
  isConfigured: boolean;
  isConnected: boolean;
  printerOptions: PrinterOption[];
  posPrint: ReturnType<typeof useCurrentConfig>["posPrint"];
  printers: SystemPrinter[];
};

/**
 * Computes POS print configuration parameters and connection states.
 * @returns Structured object containing configuration flags and printer lists.
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
