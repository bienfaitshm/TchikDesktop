import { z } from "zod";

/**
 * Schema validating the printer identifier payload for print execution.
 */
export const PrinterValueSchema = z.object({
  value: z.string().min(1, "Printer name is required"),
});

/**
 * Type payload representing a validated printer identifier.
 */
export type PrinterValuePayload = z.infer<typeof PrinterValueSchema>;

/**
 * Schema validating common invoice reference numbers.
 */
export const InvoiceRefSchema = z.object({
  invoiceRef: z.string().min(1, "Invoice reference is required"),
});

/**
 * Type payload representing a validated invoice reference.
 */
export type InvoiceRefPayload = z.infer<typeof InvoiceRefSchema>;

/**
 * Schema validating payload required to print a payment invoice.
 */
export const PrintInvoiceSchema = z
  .object({
    id: z.string().min(1, "Payment ID is required"),
    invoiceCode: z.string().min(1, "Code invoice is required"),
  })
  .extend(InvoiceRefSchema.shape);

/**
 * Type payload representing parameters to print a payment invoice.
 */
export type PrintInvoicePayload = z.infer<typeof PrintInvoiceSchema>;
