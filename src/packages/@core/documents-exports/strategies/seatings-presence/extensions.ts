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
  SeatingPresenceExportDocxExtension,
  SeatingReportPayload,
} from "./extensions.engine";

const EXTENSION_CLASSES: ClassConstructor<IExportExtension<unknown>>[] = [
  SeatingPresenceExportDocxExtension,
  CsvExportExtension,
  JsonExportExtension,
];

export const extensions: IExportExtension<SeatingReportPayload>[] =
  instantiateClasses(EXTENSION_CLASSES);
