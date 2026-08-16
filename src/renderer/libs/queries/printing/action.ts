import {
  useCheckPrinter,
  useGetPrinters,
  usePrintInvoice,
  useTestPrinter,
} from "./printing";
import { useFormBaseNotify } from "../base";
import type {
  PrintInvoicePayload,
  PrinterValuePayload,
} from "@/packages/@core/data-access/schema-validations";
import type { BaseMutationConfig } from "../base";

/**
 * Configuration type for PrintInvoicePayload mutation forms.
 */
export type PrintInvoicePayloadFormConfig<T = PrintInvoicePayload> =
  BaseMutationConfig<T>;

/**
 * Form data payload alias for PrintInvoicePayloads.
 */
export type PrintInvoicePayloadFormData = PrintInvoicePayload;

/**
 * Shared helper hook to retrieve printer list and resolve the default printer.
 * @returns Object containing the array of printers and the default selected printer.
 */
function usePrinterSelection() {
  const { data: printers = [] } = useGetPrinters();
  const defaultPrinter = printers[0] ?? undefined;

  return { printers, defaultPrinter };
}

/**
 * Form hook for executing invoice print mutations with user notifications.
 * @param config - Optional mutation and form configuration.
 * @returns Form controller object merged with available printers and default selection.
 */
export function usePrintInvoiceForm(
  config?: BaseMutationConfig<PrintInvoicePayload>,
) {
  const mutation = usePrintInvoice();
  const { printers, defaultPrinter } = usePrinterSelection();

  const base = useFormBaseNotify<
    PrintInvoicePayload,
    PrintInvoicePayload,
    PrintInvoicePayload
  >({
    mutation,
    config,
    getNotifications: () => ({
      success: {
        title: "Facture imprimée",
        description: "La facture a été envoyée à l'imprimante avec succès.",
      },
      error: {
        title: "Erreur d'impression",
        description:
          "Impossible d'imprimer la facture. Veuillez vérifier l'imprimante.",
      },
    }),
    adaptData: (data) => data,
  });

  return { ...base, printers, defaultPrinter };
}

/**
 * Form hook for triggering diagnostic test prints on thermal printers.
 * @param config - Optional mutation and form configuration.
 * @returns Form controller object merged with available printers and default selection.
 */
export function useTestPrinterForm(
  config?: BaseMutationConfig<PrinterValuePayload>,
) {
  const mutation = useTestPrinter();
  // const { printers, defaultPrinter } = usePrinterSelection();

  const base = useFormBaseNotify<
    PrinterValuePayload,
    PrinterValuePayload,
    PrinterValuePayload
  >({
    mutation,
    config,
    getNotifications: () => ({
      success: {
        title: "Page de test imprimée",
        description: "Le test de diagnostic a été exécuté avec succès.",
      },
      error: {
        title: "Échec du test",
        description:
          "Erreur lors de l'envoi de la page de test à l'imprimante.",
      },
    }),
    adaptData: (data) => data,
  });

  return { ...base };
}

/**
 * Form hook for verifying printer connection and hardware status.
 * @param config - Optional mutation and form configuration.
 * @returns Form controller object merged with available printers and default selection.
 */
export function useCheckPrinterForm(
  config?: BaseMutationConfig<PrinterValuePayload>,
) {
  const mutation = useCheckPrinter();
  // const { printers, defaultPrinter } = usePrinterSelection();

  const base = useFormBaseNotify<
    PrinterValuePayload,
    PrinterValuePayload,
    PrinterValuePayload
  >({
    mutation,
    config,
    getNotifications: () => ({
      success: {
        title: "Imprimante disponible",
        description: "L'imprimante est connectée et prête à imprimer.",
      },
      error: {
        title: "Imprimante non détectée",
        description: "Impossible de communiquer avec l'imprimante thermique.",
      },
    }),
    adaptData: (data) => data,
  });

  return { ...base };
}
