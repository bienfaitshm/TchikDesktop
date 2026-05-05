import type { FormFieldDef } from "@/packages/dynamic-form";

export class FileTypeFormFactory {
  static buildFileTypeField(config?: Partial<FormFieldDef>): FormFieldDef {
    return {
      id: "fileType",
      type: "select",
      required: true,
      label: "Format du fichier",
      placeholder: "ex pdf, docx",
      colSpan: 4,
      ...config,
    };
  }
}
