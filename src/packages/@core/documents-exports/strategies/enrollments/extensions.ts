import {
  ClassConstructor,
  instantiateClasses,
} from "@/packages/handler-factory";
import { IExportExtension } from "@/packages/electron-data-exporter";
import {
  CsvExportExtension,
  JsonExportExtension,
} from "@/packages/@core/documents-exports/extensions/data";
import {
  EnrollmentReportExportDocxExtension,
  EnrollmentReportExportSheetExtension,
  EnrollmentReportPayload,
} from "./extensions.engine";

const EXTENSION_CLASSES: ClassConstructor<IExportExtension<unknown>>[] = [
  EnrollmentReportExportSheetExtension,
  EnrollmentReportExportDocxExtension,
  CsvExportExtension,
  JsonExportExtension,
];

export const extensions: IExportExtension<EnrollmentReportPayload>[] =
  instantiateClasses(EXTENSION_CLASSES);
