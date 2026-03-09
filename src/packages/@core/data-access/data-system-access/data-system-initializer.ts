/**
 * @file data-system-initializer.ts
 * @description Module central d'initialisation du Bus de Requêtes (DataQueryBus).
 * Déclare, instancie et injecte tous les Query Handlers disponibles dans le Bus.
 */

import { AbstractQueryHandler } from "@/packages/data-system";

import { getLogger } from "@/packages/logger";
import {
  instantiateClasses,
  ClassConstructor,
} from "@/packages/handler-factory";

import * as schools from "./handlers/school.query-handlers";
import * as classrooms from "./handlers/classroom.query-handler.ts";
// import * as enrollments from "./handlers/enrollment.handlers"

const initializerLogger = getLogger("DataSystemInitializer");

const HANDLER_CLASSES_REGISTRY: ClassConstructor<AbstractQueryHandler<any>>[] =
  [
    schools.FindSchoolsQueryHandler,
    schools.FindSchoolByIdQueryHandler,
    schools.FindStudyYearsQueryHandler,
    schools.FindStudyYearByIdQueryHandler,

    //
    classrooms.FindSchoolsQueryHandler,
    classrooms.FindClassroomByIdQueryHandler,
    classrooms.ClassroomEnrollmentQueryHandler,

    //
    // enrollments
  ];

export const instantiatedHandlers = instantiateClasses(
  HANDLER_CLASSES_REGISTRY,
  initializerLogger
);
