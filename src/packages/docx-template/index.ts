import { promises as fs } from "node:fs";
import path from "node:path";
import createReport from "docx-templates";
import { getResourcePath } from "@/packages/electron-utility";
import { additionalJsContext } from "./additional-context";

const DEFAULT_TEMPLATES_DIR = "documents_templates";
const TEMPLATE_BASE_PATH = getResourcePath(
  process.env.DOCUMENT_TEMPLATES_DIR ?? DEFAULT_TEMPLATES_DIR,
);

export interface GenerateDocxReportOptions {
  templateName: string;
  templateData: Record<string, unknown>;
}

export async function generateDocxReport(
  options: GenerateDocxReportOptions,
): Promise<Uint8Array<ArrayBufferLike>> {
  const { templateName, templateData } = options;

  const resolvedPath = path.resolve(TEMPLATE_BASE_PATH, templateName);
  if (!resolvedPath.startsWith(TEMPLATE_BASE_PATH)) {
    throw new Error(
      `Security Violation: Unauthorized template path access attempt: ${templateName}`,
    );
  }

  try {
    const templateBuffer = await fs.readFile(resolvedPath);
    return await createReport({
      template: templateBuffer,
      data: templateData,
      additionalJsContext,
    });
  } catch (error) {
    throw new Error(
      `Failed to generate DOCX report for template '${templateName}': ${(error as Error).message}`,
      { cause: error },
    );
  }
}
