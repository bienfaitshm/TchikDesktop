import path from "path";

const TEMPLATE_DIR = "documents_templates";

export function resolveTemplatePath(filename: string): string {
  return path.join(TEMPLATE_DIR, filename);
}
