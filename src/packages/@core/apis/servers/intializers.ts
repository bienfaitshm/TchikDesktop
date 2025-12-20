import { getLogger } from "@/packages/logger";
import {
  instantiateClasses,
  ClassConstructor,
} from "@/packages/@core/utilities/handler-factory";
import { AbstractEndpoint } from "./abstract";

import * as schools from "./schools";
import * as options from "./options";
import * as classrooms from "./classrooms";
import * as enrollments from "./enrollments";

const initializerLogger = getLogger("IPC Server");
const HANDLER_CLASSES_REGISTRY: ClassConstructor<AbstractEndpoint<any>>[] = [
  // schools
  schools.GetSchools,
  schools.PostSchool,
  schools.GetSchool,
  schools.UpdateSchool,
  schools.DeleteSchool,

  // study-year
  schools.GetStudyYears,
  schools.PostStudyYear,
  schools.GetStudyYear,
  schools.UpdateStudyYear,
  schools.DeleteStudyYear,

  // options
  options.GetOptions,
  options.PostOption,
  options.GetOption,
  options.UpdateOption,
  options.DeleteOption,

  // classrooms
  classrooms.GetClassrooms,
  classrooms.GetClassroomsWithEnrollments,
  classrooms.PostClassroom,
  classrooms.GetClassroom,
  classrooms.UpdateClassroom,
  classrooms.DeleteClassroom,

  // enrollments

  enrollments.GetEnrollements,
  enrollments.GetEnrollementHistories,
  enrollments.PostEnrollement,
  enrollments.PostQuickEnrollement,
  enrollments.GetEnrollement,
  enrollments.UpdateEnrollement,
  enrollments.DeleteEnrollement,
];

export const instantiatedHandlers = instantiateClasses(
  HANDLER_CLASSES_REGISTRY,
  initializerLogger
);
