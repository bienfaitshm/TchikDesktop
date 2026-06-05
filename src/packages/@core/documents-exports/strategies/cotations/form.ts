import type { FormFieldDef, ColSpan } from "@/packages/dynamic-form";
import {
  composeFields,
  createClassroomField,
  createFileTypeField,
  createSectionField,
} from "@/packages/@core/documents-exports/form-factory/form-generators";

interface CotationDocumentExport {
  readonly schoolId: string;
  readonly yearId: string;
  readonly fileTypeFilters?: readonly Electron.FileFilter[];
  readonly layout?: Partial<DocumentExportLayout>;
}

interface DocumentExportLayout {
  readonly fileTypeColSpan: ColSpan;
  readonly sectionColSpan: ColSpan;
  readonly classroomColSpan: ColSpan;
}

const DEFAULT_LAYOUT: Readonly<DocumentExportLayout> = {
  fileTypeColSpan: 4,
  sectionColSpan: 4,
  classroomColSpan: 4,
} as const;

/**
 * Creates form fields for document export configuration.
 *
 * Composes three fields:
 * 1. File type selector - filters available export formats
 * 2. Section selector - targets specific student sections
 * 3. Classroom selector - filters by classroom assignment
 *
 * @param config - School context and optional layout customization
 * @returns Array of form field definitions for the export dialog
 * @throws {FieldCreationError} If any field creation fails
 *
 * @example
 * ```ts
 * const fields = await createCotationDocumentExportForm({
 *   schoolId: '123',
 *   yearId: '2024',
 *   fileTypeFilters: [{ name: 'PDF', extensions: ['pdf'] }],
 *   layout: { fileTypeColSpan: 6, sectionColSpan: 3, classroomColSpan: 3 }
 * });
 * ```
 */
export const createCotationDocumentExportForm = async (
  config: Readonly<CotationDocumentExport>,
): Promise<readonly FormFieldDef[]> => {
  const {
    schoolId,
    yearId,
    fileTypeFilters = [],
    layout = {},
  } = validateConfig(config);

  const { fileTypeColSpan, sectionColSpan, classroomColSpan } = {
    ...DEFAULT_LAYOUT,
    ...layout,
  };

  return composeFields(
    createFileTypeField(fileTypeFilters, { colSpan: fileTypeColSpan }),
    createSectionField({ colSpan: sectionColSpan }),
    createClassroomField({
      schoolId,
      yearId,
      required: true,
      colSpan: classroomColSpan,
    }),
  );
};

const validateConfig = (
  config: Readonly<CotationDocumentExport>,
): Required<CotationDocumentExport> => {
  const { schoolId, yearId, fileTypeFilters = [] } = config;

  if (!schoolId?.trim()) {
    throw new ValidationError("schoolId", "School ID is required");
  }

  if (!yearId?.trim()) {
    throw new ValidationError("yearId", "Year ID is required");
  }

  return {
    schoolId: schoolId.trim(),
    yearId: yearId.trim(),
    fileTypeFilters,
    layout: config.layout ?? {},
  };
};

class ValidationError extends Error {
  constructor(
    public readonly field: string,
    message: string,
  ) {
    super(`Validation error [${field}]: ${message}`);
    this.name = "ValidationError";
  }
}
