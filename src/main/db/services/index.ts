import {
  AppDataSystem,
  DataSystemHandler,
  createDataSystemHandler,
} from "./data-system";

import * as classooms from "./handlers/classroom.handlers";

/**
 * 📦 Liste déclarative de tous les Data Handlers enregistrés dans l'application.
 * Cette liste sert de manifeste pour le AppDataSystem.
 */

const HANDLERS_MANIFEST: DataSystemHandler[] = [
  // classrooms
  createDataSystemHandler(
    "classrooms.studentsDetailed",
    classooms.fetchClassroomStudentsDetailed as any
  ),
  createDataSystemHandler(
    "classrooms.enrollments",
    classooms.fetchClassroomEnrollments as any
  ),
];

export const appDataSystem = new AppDataSystem(HANDLERS_MANIFEST);
