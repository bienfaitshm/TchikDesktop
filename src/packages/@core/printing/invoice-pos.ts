import { PrinterThermal, jobs, sanitizeText } from "@/packages/pos-printer";
import type { Alignment } from "@node-escpos/core";

/**
 * Prints a sanitized single line of text to the thermal printer.
 * @param printer - Thermal printer device instance.
 * @param text - Text content to sanitize and print.
 */
export function printText(printer: PrinterThermal, text: string): void {
  printer.text(sanitizeText(text));
}

/**
 * Draws a horizontal separator line across the receipt using a specified character.
 * @param printer - Thermal printer device instance.
 * @param char - Character used to construct the divider line (defaults to "-").
 */
export function printDivider(printer: PrinterThermal): void {
  printer.text(jobs.PRINTER_DIVIDER);
}

/**
 * Formats and prints a left-aligned key and right-aligned value on a single line.
 * @param printer - Thermal printer device instance.
 * @param key - Left-aligned label or description.
 * @param value - Right-aligned amount or detail value.
 */
export function printKeyValueRow(
  printer: PrinterThermal,
  key: string,
  value: string,
): void {
  printText(printer, jobs.formatLeftRight(key, value));
}

/**
 * Prints a bold, uppercase title with specified alignment, then resets alignment to left.
 * @param printer - Thermal printer device instance.
 * @param text - Heading text to capitalize and render.
 * @param align - Text alignment configuration (defaults to "CT" for center).
 */
export function printTitle(
  printer: PrinterThermal,
  text: string,
  align: Alignment = "CT",
): void {
  printer.align(align);
  printer.style("b");
  printer.text(sanitizeText(text.toUpperCase()));
  printer.style("normal");
  printer.align("LT");
}
