import {
  ClassConstructor,
  instantiateClasses,
} from "@/packages/handler-factory";
import { IExportExtension } from "@/packages/electron-data-exporter";
import {
  CsvExportExtension,
  JsonExportExtension,
} from "@/packages/@core/documents-exports/extensions/data";
import { SeatingPlanBySheetExcelExportExtension } from "./seating.sheet";
import { SeatingExportDocxExtension } from "./seating.docx";

const EXTENSION_CLASSES: ClassConstructor<IExportExtension<unknown>>[] = [
  SeatingExportDocxExtension,
  SeatingPlanBySheetExcelExportExtension,
  CsvExportExtension,
  JsonExportExtension,
];

export const extensions: IExportExtension<unknown>[] =
  instantiateClasses(EXTENSION_CLASSES);
