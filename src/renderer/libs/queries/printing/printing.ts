import { useMutation, useSuspenseQuery } from "../base";
import { print } from "@/renderer/libs/apis";
import type {
  PrintInvoicePayload,
  PrinterValuePayload,
} from "@/packages/@core/data-access/schema-validations";

/**
 * Payload interface for printer identification operations.
 */
export interface PrinterTargetPayload extends PrinterValuePayload {}

/**
 * Query and mutation key factory for the printing domain.
 */
export const printingKeys = {
  all: ["printing"] as const,
  printers: () => [...printingKeys.all, "printers"] as const,
  mutations: {
    all: () => [...printingKeys.all, "mutations"] as const,
    checkPrinter: () => [...printingKeys.mutations.all(), "check"] as const,
    printInvoice: () => [...printingKeys.mutations.all(), "invoice"] as const,
    testPrinter: () => [...printingKeys.mutations.all(), "test"] as const,
  },
} as const;

/**
 * Custom suspense query hook to retrieve installed system printers.
 * @returns Suspense query result object containing the list of available printers.
 */
export function useGetPrinters() {
  return useSuspenseQuery({
    queryKey: printingKeys.printers(),
    queryFn: () => print.getPrinters(),
    refetchInterval: 1000,
  });
}

/**
 * Custom mutation hook to check the connectivity of a target printer.
 * @returns React Query mutation object for printer connection checks.
 */
export function useCheckPrinter() {
  return useMutation({
    mutationKey: printingKeys.mutations.checkPrinter(),
    mutationFn: (payload: PrinterTargetPayload) => print.checkPrinter(payload),
  });
}

/**
 * Custom mutation hook to dispatch an invoice receipt printing job.
 * @returns React Query mutation object for invoice print execution.
 */
export function usePrintInvoice() {
  return useMutation({
    mutationKey: printingKeys.mutations.printInvoice(),
    mutationFn: (payload: PrintInvoicePayload) => print.printInvoice(payload),
  });
}

/**
 * Custom mutation hook to execute a test print job on a specific printer.
 * @returns React Query mutation object for test printing operations.
 */
export function useTestPrinter() {
  return useMutation({
    mutationKey: printingKeys.mutations.testPrinter(),
    mutationFn: (payload: PrinterTargetPayload) => print.testPrinter(payload),
  });
}
