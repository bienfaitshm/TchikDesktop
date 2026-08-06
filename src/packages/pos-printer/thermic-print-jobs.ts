import { CustomLogger as Logger } from "@/packages/logger";
import type { ActionResult, PrinterThermal } from "./thermic-printer";

/**
 * Parameters required to execute a thermal printer diagnostic test job.
 */
export interface TestThermalPrinterParams {
  /** The target thermal printer instance. */
  printer: PrinterThermal;
  /** The OS display name of the printer. */
  printerName: string;
  /** Name of the educational institution. */
  schoolName: string;
  /** Optional street address of the institution. */
  schoolAddress?: string;
  /** Optional city/town of the institution. */
  schoolTown?: string;
  /** Academic year identifier (e.g., "2025-2026"). */
  yearName: string;
  /** Optional logger instance for tracking job progress. */
  logger?: Logger;
}

const PRINTER_DIVIDER = "--------------------------------";

/**
 * Formats and prints a diagnostic test receipt including school headers and hardware checks.
 * @param params - Configuration object containing printer instance, names, and school metadata.
 * @returns A promise resolving to an ActionResult indicating job outcome.
 */
export async function testThermalPrinterJob({
  printer,
  printerName,
  schoolName,
  schoolAddress,
  schoolTown,
  yearName,
  logger,
}: TestThermalPrinterParams): Promise<ActionResult> {
  logger?.info(`Building diagnostic print job for printer "${printerName}"`);

  try {
    // Institution Header
    printer.alignCenter();
    printer.bold(true);
    printer.println(schoolName.toUpperCase());
    printer.bold(false);

    if (schoolAddress) {
      printer.println(schoolAddress);
    }
    if (schoolTown) {
      printer.println(schoolTown);
    }

    printer.println(`Academic Year: ${yearName}`);
    printer.println(PRINTER_DIVIDER);

    // Test Information Section
    printer.bold(true);
    printer.println("PRINT DIAGNOSTIC TEST");
    printer.bold(false);
    printer.println(PRINTER_DIVIDER);

    printer.alignLeft();
    printer.println(`Printer Name : ${printerName}`);
    printer.println("Hardware Status: ONLINE");
    printer.println(`Date & Time    : ${new Date().toLocaleString()}`);
    printer.println(PRINTER_DIVIDER);

    // Footer & Hardware Execution
    printer.alignCenter();
    printer.println("Diagnostic test completed successfully!");
    printer.newLine();
    printer.cut();

    await printer.execute();
    logger?.info(
      `Diagnostic print test successfully dispatched to "${printerName}".`,
    );

    return {
      success: true,
      message: "Test page printed successfully.",
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    logger?.error(
      `Diagnostic test failed on printer "${printerName}": ${detail}`,
    );

    return {
      success: false,
      message: `Diagnostic print failed: ${detail}`,
    };
  }
}

/**
 * Standardized data transfer object containing pre-formatted invoice details.
 * Prevents logic duplication between the React UI and the hardware printer job.
 */
export interface InvoiceReceiptData {
  schoolName: string;
  schoolAddress: string;
  date: string;
  time: string;
  ticketRef: string;
  studentName: string;
  studentCode: string;
  classroom: string;
  feeTypeName: string;
  scheduleName: string;
  amountPaidFormatted: string;
  cashRegisterId: string;
}

/**
 * Parameters required to execute the thermal invoice print job.
 */
export interface PrintInvoiceJobParams {
  /** The target thermal printer instance. */
  printer: PrinterThermal;
  /** The normalized invoice data to be printed. */
  invoiceData: InvoiceReceiptData;
}

/**
 * Dispatches sequential hardware commands to reproduce the digital invoice design on a thermal receipt.
 * @param params - Contains the printer instance and the normalized invoice payload.
 * @returns A promise resolving to an ActionResult indicating the job's success or failure.
 */
export async function printInvoiceJob({
  printer,
  invoiceData,
}: PrintInvoiceJobParams): Promise<ActionResult> {
  try {
    // 1. Header Section
    printer.alignCenter();
    printer.bold(true);
    printer.println(invoiceData.schoolName.toUpperCase());
    printer.bold(false);

    printer.println(invoiceData.schoolAddress);
    printer.drawLine(); // Replaces dashed border

    printer.alignLeft();
    printer.leftRight(
      `Date: ${invoiceData.date}`,
      `Heure: ${invoiceData.time}`,
    );
    printer.println(`Ref: ${invoiceData.ticketRef.toUpperCase()}`);
    printer.drawLine();

    // 2. Student Information Section
    printer.leftRight("NOM :", invoiceData.studentName);
    printer.leftRight("CODE :", invoiceData.studentCode);
    printer.leftRight("CLASSE :", invoiceData.classroom);
    printer.drawLine();

    // 3. Fee and Payment Details Section
    printer.bold(true);
    printer.println("DESIGNATION");
    printer.bold(false);
    printer.leftRight(
      `${invoiceData.feeTypeName} [${invoiceData.scheduleName}]`,
      invoiceData.amountPaidFormatted,
    );
    printer.drawLine();

    // 4. Total Paid Section
    printer.bold(true);
    printer.leftRight("TOTAL PAYE", invoiceData.amountPaidFormatted);
    printer.bold(false);
    printer.drawLine();

    // 5. Footer Notice
    printer.alignCenter();
    printer.println(`CAISSE: ${invoiceData.cashRegisterId}`);
    printer.println("*** MERCI DE VOTRE VISITE ***");

    printer.newLine();
    printer.cut();

    await printer.execute();

    return {
      success: true,
      message: "Invoice successfully printed.",
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Failed to print invoice: ${detail}`,
    };
  }
}
