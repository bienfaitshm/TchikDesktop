import {
  ClassConstructor,
  instantiateClasses,
} from "@/packages/handler-factory";
import { IExportExtension } from "@/packages/electron-data-exporter";
import {
  CsvExportExtension,
  JsonExportExtension,
} from "@/packages/@core/documents-exports/extensions/data";
import { EnrollmentReportExportDocxExtension } from "./enrollment-docx";

const EXTENSION_CLASSES: ClassConstructor<IExportExtension<unknown>>[] = [
  EnrollmentReportExportDocxExtension,
  CsvExportExtension,
  JsonExportExtension,
];

export const extensions: IExportExtension<unknown>[] =
  instantiateClasses(EXTENSION_CLASSES);
