import { Image } from "@node-escpos/core";
import { CustomLogger as Logger } from "@/packages/logger";
import type { ActionResult, PrinterThermal } from "./thermic-printer";
import { getResourcePath } from "@/packages/electron-utility/path";
import { Ticket } from "@/packages/@core/data-access/schema-validations";
import { formatCurrency } from "@/packages/currency";
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

/** Standard divider line for 58mm thermal receipts. */
const PRINTER_DIVIDER = "--------------------------------";

/** Default line character width for 58mm thermal paper. */
const LINE_WIDTH = 32;

/**
 * Formats a single line with left-aligned and right-aligned text strings.
 * @param left - Text aligned to the left margin.
 * @param right - Text aligned to the right margin.
 * @param width - Total character capacity of the line.
 * @returns Formatted line string padded with whitespace.
 */
function formatLeftRight(
  left: string,
  right: string,
  width: number = LINE_WIDTH,
): string {
  const spaceWidth = width - left.length - right.length;
  if (spaceWidth <= 0) {
    return `${left} ${right}`;
  }
  return `${left}${" ".repeat(spaceWidth)}${right}`;
}

/**
 * Formats and prints a diagnostic test receipt including school headers, a scaled QR code, and logo.
 * @param params - Configuration parameters and hardware references for execution.
 * @returns Promise resolving to the result status of the operation.
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
    // 1. Institution Header
    printer.align("CT");
    printer.style("b");
    printer.text(schoolName.toUpperCase());
    printer.style("normal");

    if (schoolAddress) {
      printer.text(schoolAddress, "UTF-8");
    }
    if (schoolTown) {
      printer.text(schoolTown);
    }

    printer.text(yearName);
    printer.text(PRINTER_DIVIDER);

    // 2. Test Information Section
    printer.style("b");
    printer.text("TEST DE DIAGNOSTIC");
    printer.style("normal");
    printer.text(PRINTER_DIVIDER);

    printer.align("LT");
    printer.text(formatLeftRight("Imprimante :", printerName));
    printer.text(formatLeftRight("Statut :", "EN LIGNE"));
    printer.text(
      formatLeftRight("Date :", new Date().toLocaleDateString("fr-FR")),
    );
    printer.text(
      formatLeftRight("Heure :", new Date().toLocaleTimeString("fr-FR")),
    );
    printer.text(PRINTER_DIVIDER);

    printer.align("CT");
    printer.text("Test de diagnostic réussi !");
    printer.text(PRINTER_DIVIDER);

    // 3. Scaled QR Code Transfer (size: 3 reduces dimension to prevent USB buffer overflow)
    try {
      await printer.qrimage("https://github.com/node-escpos/driver", {
        size: 3,
        mode: "NORMAL",
      });
    } catch (qrError) {
      logger?.warn(`Failed to render QR code on "${printerName}": ${qrError}`);
    }

    // 4. Compact Raster Logo Transfer (s8 density mode for reduced height/data size)
    // try {
    //   const filePath = getResourcePath("/resources/icon.png");
    //   const image = await Image.load(filePath, "image/png");
    //   await printer.image(image, "s8");
    // } catch (imgError) {
    //   logger?.warn(
    //     `Failed to render logo image on "${printerName}": ${imgError}`,
    //   );
    // }

    // 5. Finalize Job
    printer.feed(1);
    printer.cut();

    logger?.info(
      `Diagnostic print test successfully dispatched to "${printerName}".`,
    );

    return {
      success: true,
      message: "Page de test imprimée avec succès.",
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    logger?.error(
      `Diagnostic test failed on printer "${printerName}": ${detail}`,
    );

    return {
      success: false,
      message: `Échec du test de diagnostic : ${detail}`,
    };
  }
}

/**
 * Standardized data transfer object containing pre-formatted invoice details.
 */
export interface InvoiceReceiptData extends Ticket {
  // schoolName: string;
  // schoolAddress: string;
  // date: string;
  // time: string;
  // ticketRef: string;
  // studentName: string;
  // studentCode: string;
  // classroom: string;
  // feeTypeName: string;
  // scheduleName: string;
  // amountPaidFormatted: string;
  // cashRegisterId: string;
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
 * Dispatches sequential hardware commands to print a student fee payment invoice.
 * @param params - Contains the printer instance and normalized invoice payload.
 * @returns Promise resolving to the outcome status of the print job.
 */
export async function printInvoiceJob({
  printer,
  invoiceData,
}: PrintInvoiceJobParams): Promise<ActionResult> {
  try {
    // 1. Header Section
    printer.align("CT");
    printer.style("b");
    printer.text(invoiceData.schoolName.toUpperCase());
    printer.style("normal");

    printer.text(invoiceData.address);
    printer.text(PRINTER_DIVIDER);

    printer.align("LT");
    printer.text(
      formatLeftRight(
        `Date: ${invoiceData.date}`,
        `Heure: ${invoiceData.date?.getMinutes()}`,
      ),
    );
    printer.text(`Réf: ${invoiceData.ticketRef.toUpperCase()}`);
    printer.text(PRINTER_DIVIDER);

    // 2. Student Information Section
    printer.text(formatLeftRight("NOM :", invoiceData.studentName));
    printer.text(formatLeftRight("CODE :", invoiceData.studentCode));
    printer.text(formatLeftRight("CLASSE :", invoiceData.classroomName));
    printer.text(PRINTER_DIVIDER);

    // 3. Fee and Payment Details Section
    printer.style("b");
    printer.text("DÉSIGNATION");
    printer.style("normal");
    printer.text(
      formatLeftRight(
        `${invoiceData.feeTypeName} [${invoiceData.scheduleName}]`,
        formatCurrency(invoiceData.amountPaid, invoiceData.currency),
      ),
    );
    printer.text(PRINTER_DIVIDER);

    // 4. Total Paid Section
    printer.style("b");
    printer.text(
      formatLeftRight(
        "TOTAL PAYÉ",
        formatCurrency(invoiceData.amountPaid, invoiceData.currency),
      ),
    );
    printer.style("normal");
    printer.text(PRINTER_DIVIDER);

    // 5. Footer Notice
    printer.align("CT");
    printer.text(`CAISSE/ ${invoiceData.yearName}`);
    printer.text("*** MERCI DE VOTRE VISITE ***");

    printer.feed(1);
    printer.cut();

    return {
      success: true,
      message: "Facture imprimée avec succès.",
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Échec de l'impression de la facture : ${detail}`,
    };
  }
}
