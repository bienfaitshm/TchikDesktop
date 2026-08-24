import type { FormFieldDef } from "@/packages/dynamic-form";
import {
  composeFields,
  createFileTypeField,
  createClassroomField,
  DateInputFieldFactory,
} from "@/packages/@core/documents-exports/form-factory";
import {
  validateAndMergeContext,
  type BaseExportFormConfig,
  DEFAULT_LAYOUT,
} from "../base";

/**
 * Creates dynamic form field definitions for document export configurations.
 * @param config - Base configuration containing domain context, layout, and filter options.
 * @returns Array of generated dynamic form field definitions.
 */
export const createPaymentReportExportForm = <
  TContext extends Record<string, unknown> & {
    schoolId: string;
    yearId: string;
  },
>(
  config: Readonly<BaseExportFormConfig<TContext>>,
): Promise<readonly FormFieldDef[]> => {
  const { validContext, fileTypeFilters } = validateAndMergeContext(config, [
    "schoolId",
    "yearId",
  ]);

  return composeFields(
    createFileTypeField(fileTypeFilters, { colSpan: 12 }),
    createClassroomField({
      colSpan: 4,
      schoolId: validContext.schoolId,
      yearId: validContext.yearId,
    }),
    DateInputFieldFactory.create("dateStart", "Date de Debut", {
      colSpan: 4,
      defaultValue: new Date(),
    }),
    DateInputFieldFactory.create("dateEnd", "Date de fin", {
      colSpan: 4,
      defaultValue: new Date(),
    }),
  );
};
