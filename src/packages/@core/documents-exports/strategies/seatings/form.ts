import type { FormFieldDef } from "@/packages/dynamic-form";
import {
  composeFields,
  createFileTypeField,
  createSessionField,
} from "@/packages/@core/documents-exports/form-factory/form-generators";
import { validateAndMergeContext, type BaseExportFormConfig } from "../base";

/**
 * Creates dynamic form field definitions for document export configurations.
 * @param config - Generic configuration holding domain context and layout rules.
 * @returns Array of generated dynamic form field definitions.
 */
export const createSessionExportForm = async <
  TContext extends { schoolId: string; yearId: string },
>(
  config: Readonly<BaseExportFormConfig<TContext, "fileType" | "session">>,
): Promise<readonly FormFieldDef[]> => {
  const { validContext, fileTypeFilters, mergedLayout } =
    validateAndMergeContext(config, ["schoolId", "yearId"]);

  return composeFields(
    createFileTypeField(fileTypeFilters, { colSpan: mergedLayout.fileType }),
    createSessionField({
      colSpan: mergedLayout.session,
      schoolId: validContext.schoolId,
      yearId: validContext.yearId,
    }),
  );
};
