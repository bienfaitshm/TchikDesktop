import type { FormFieldDef } from "@/packages/dynamic-form";
import {
  composeFields,
  createFileTypeField,
  DateInputFieldFactory,
} from "@/packages/@core/documents-exports/form-factory";
import { validateAndMergeContext, type BaseExportFormConfig } from "../base";

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
  const { fileTypeFilters } = validateAndMergeContext(config, [
    "schoolId",
    "yearId",
  ]);

  return composeFields(
    createFileTypeField(fileTypeFilters, { colSpan: 4 }),
    DateInputFieldFactory.create("dateStart", "Date de Debut", {
      colSpan: 4,
      required: false,
    }),
    DateInputFieldFactory.create("dateEnd", "Date de fin", {
      colSpan: 4,
      required: false,
    }),
  );
};
