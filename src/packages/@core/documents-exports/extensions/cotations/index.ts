import {
  ClassConstructor,
  instantiateClasses,
} from "@/packages/handler-factory";
import { IExportExtension } from "@/packages/electron-data-exporter";
import {
  CsvExportExtension,
  JsonExportExtension,
} from "@/packages/@core/documents-exports/extensions/data";
import { FicheCotationExportExtension } from "./cotation-docx";

const EXTENSION_CLASSES: ClassConstructor<IExportExtension<unknown>>[] = [
  FicheCotationExportExtension,
  CsvExportExtension,
  JsonExportExtension,
];

export const extentions: IExportExtension<unknown>[] =
  instantiateClasses(EXTENSION_CLASSES);
