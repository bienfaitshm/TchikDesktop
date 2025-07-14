import { createReport } from "docx-templates";
import type { UserOptions } from "docx-templates/lib/types";
import fs from "fs";

const reportConfig: Partial<UserOptions> = {
  cmdDelimiter: ["{{", "}}"],
};

export async function createDocx(
  template_name: string,
  data: Record<string, unknown>
) {
  const template = fs.readFileSync(template_name);
  return await createReport({
    template,
    data,
    ...reportConfig,
  });
}
