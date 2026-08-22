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
  type PaymentReportPayload,
  PaymentPresenceExportDocxExtension,
} from "./extensions.engine";

const EXTENSION_CLASSES: ClassConstructor<IExportExtension<unknown>>[] = [
  PaymentPresenceExportDocxExtension,
  CsvExportExtension,
  JsonExportExtension,
];

export const extensions: IExportExtension<PaymentReportPayload>[] =
  instantiateClasses(EXTENSION_CLASSES);
