import {
  ClassConstructor,
  instantiateClasses,
} from "@/packages/handler-factory";
import { IExportExtension } from "@/packages/electron-data-exporter";
import { SeatingPresenceExportDocxExtension } from "./seating-presence.docx";

const EXTENSION_CLASSES: ClassConstructor<IExportExtension<unknown>>[] = [
  SeatingPresenceExportDocxExtension,
];

export const extensions: IExportExtension<unknown>[] =
  instantiateClasses(EXTENSION_CLASSES);
