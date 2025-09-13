import { createReport } from "docx-templates";
import type { UserOptions } from "docx-templates/lib/types";
import fs from "fs";
import path from "path";

const TEMPLATE_DIR = "documents_templates";

const DOCX_REPORT_OPTIONS: Partial<UserOptions> = {};

/**
 * Generates a DOCX report based on a template and provided data.
 *
 * @param templatePath - The file system path to the DOCX template file.
 * @param data - An object containing the data to populate the template.
 * @returns A promise that resolves to a Uint8Array containing the generated DOCX file.
 *
 * @throws Will throw an error if the template file cannot be read or the report generation fails.
 */
export async function generateDocxReport(
  templatePath: string,
  data: Record<string, unknown>
): Promise<Uint8Array> {
  const templateBuffer = fs.readFileSync(templatePath);
  return createReport({
    template: templateBuffer,
    data,
    ...DOCX_REPORT_OPTIONS,
  });
}

export function resolveTemplatePath(filename: string): string {
  return path.join(TEMPLATE_DIR, filename);
}
