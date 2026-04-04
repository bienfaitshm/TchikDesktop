import { getLogger } from "@/packages/logger";
import {
  instantiateClasses,
  ClassConstructor,
} from "@/packages/handler-factory";
import { AbstractEndpoint } from "./abstract";

import * as user from "./handlers/user";
import * as schools from "./handlers/schools";
import * as options from "./handlers/options";
import * as classrooms from "./handlers/classrooms";
import * as enrollments from "./handlers/enrollments";
import * as stats from "./handlers/statistics";
import * as exportDocument from "./handlers/document-exports";
import * as seatings from "./handlers/seating";
import * as appInfos from "./apps-infos";

const initializerLogger = getLogger("IPC Server");

const HANDLER_CLASSES_REGISTRY: ClassConstructor<AbstractEndpoint<any>>[] = [
  // users
  user.GetUsers,
  user.GetUser,
  user.PostUser,
  user.UpdateUser,
  user.DeleteUser,

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
  enrollments.PostEnrollement,
  enrollments.PostQuickEnrollement,
  enrollments.GetEnrollement,
  enrollments.UpdateEnrollement,
  enrollments.DeleteEnrollement,

  // stats
  stats.GetStatsByClass,
  stats.GetStatsByGender,
  stats.GetStatsByOption,
  stats.GetStatsByStatus,
  stats.GetStatsRetention,
  stats.GetStatsSummary,

  // export data
  exportDocument.ExportDocuments,
  exportDocument.GetInfosDocumentExports,

  // app and system information
  appInfos.GetSystemInfos,

  // --- SEATING : Local Rooms ---
  seatings.GetLocalRooms,
  seatings.CreateLocalRoom,
  seatings.UpdateLocalRoom,
  seatings.DeleteLocalRoom,

  // --- SEATING : Sessions ---
  seatings.GetSeatingSessionsByYear,
  seatings.CreateSeatingSession,
  seatings.DeleteSeatingSession,
  seatings.GetSessionRoomsStatus,
  seatings.GetFullSessionDetails,

  // --- SEATING : Assignments ---
  seatings.GetRoomLayout,
  seatings.BulkAssignStudents,
  seatings.GetUnassignedStudents,
  seatings.ClearRoomAssignments,
  seatings.FindStudentSeat,
];

export const instantiatedHandlers = instantiateClasses(
  HANDLER_CLASSES_REGISTRY,
  initializerLogger,
);
