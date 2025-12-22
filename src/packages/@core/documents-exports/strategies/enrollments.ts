/**
 * @file enrollments.ts
 * @description Stratégie unique pour l'export des inscriptions supportant plusieurs formats.
 */

import { AbstractExportStrategy } from "@/packages/electron-data-exporter";
import {
  ClassroomIds,
  ShoolRouteIds,
} from "@/packages/@core/data-access/data-system-access";
import { EnrolementFilterSchema } from "@/packages/@core/data-access/schema-validations";
import { CsvExportExtension, JsonExportExtension } from "./enrollments.engins";

export class EnrollmentExportStrategy extends AbstractExportStrategy {
  public readonly id = "ENROLLMENT_EXPORT";
  public readonly displayName = "Liste des Inscriptions";
  public readonly description =
    "Export complet des données d'inscription (élèves, classes, dates).";
  public readonly validationSchema = EnrolementFilterSchema;

  public readonly dataSourceDefinition = {
    classrooms: ClassroomIds.findAllClassroomsWithEnrollment,
    school: ShoolRouteIds.findSchoolById,
  };

  constructor() {
    // On injecte les formats supportés pour cette donnée spécifique
    super([new CsvExportExtension(), new JsonExportExtension()]);
  }
}
