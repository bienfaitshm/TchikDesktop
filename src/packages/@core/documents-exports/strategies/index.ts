import {
  instantiateClasses,
  ClassConstructor,
} from "@/packages/handler-factory";
import { IExportStrategy } from "@/packages/electron-data-exporter";
import { EnrollmentExportStrategy } from "./enrollments";
import { SeatingExportStrategy } from "./seatings";
import { FicheCotationExportStrategy } from "./cotations";
import { SeatingPresenceExportStrategy } from "./seatings-presence";

const STRATEGY_CLASSES: ClassConstructor<IExportStrategy<unknown>>[] = [
  EnrollmentExportStrategy,
  FicheCotationExportStrategy,
  SeatingExportStrategy,
  SeatingPresenceExportStrategy,
];

export const registeredStrategies: IExportStrategy<unknown>[] =
  instantiateClasses(STRATEGY_CLASSES);
