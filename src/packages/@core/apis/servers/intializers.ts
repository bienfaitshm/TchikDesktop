import { getLogger } from "@/packages/logger";
import {
  instantiateClasses,
  ClassConstructor,
} from "@/packages/handler-factory";
import { AbstractEndpoint } from "@/packages/electron-ipc-rest";

import * as appInfos from "./apps-infos";
import * as user from "./handlers/user";
import * as schools from "./handlers/schools";
import * as options from "./handlers/options";
import * as classrooms from "./handlers/classrooms";
import * as enrollments from "./handlers/enrollments";
import * as stats from "./handlers/statistics";
import * as exportDocument from "./handlers/document-exports";
import * as seatings from "./handlers/seating";
import * as feeAssignments from "./handlers/fee-assignments";
import * as feeTypes from "./handlers/fee-types";
import * as feeSchedules from "./handlers/fee-schedules"; // <-- AJOUT DU MODULE
import * as feeConfigurations from "./handlers/fee-configurations";
import * as dailyExchangeRates from "./handlers/daily-exchange-rates";
import * as wallets from "./handlers/wallets";
import * as studentPayments from "./handlers/student-payments";

const initializerLogger = getLogger("IPC Server");

const HANDLER_CLASSES_REGISTRY: ClassConstructor<AbstractEndpoint<any>>[] = [
  // users
  user.GetUsers,
  user.GetSearchUsers,
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
  options.GetSearchOptions,
  options.PostOption,
  options.GetOption,
  options.UpdateOption,
  options.DeleteOption,

  // classrooms
  classrooms.GetClassrooms,
  classrooms.GetSearchClassrooms,
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
  stats.GetEnrollmentsByYear,
  stats.GetTotalStudents,

  // export data
  exportDocument.ExportDocuments,
  exportDocument.GetInfosDocumentExports,

  // app and system information
  appInfos.GetSystemInfos,

  // --- SEATING : Local Rooms ---
  seatings.GetLocalRooms,
  seatings.GetSearchLocalRooms,
  seatings.GetLocalRoom,
  seatings.CreateLocalRoom,
  seatings.UpdateLocalRoom,
  seatings.DeleteLocalRoom,

  // --- SEATING : Sessions ---
  seatings.GetSeatingSessions,
  seatings.PostSeatingSession,
  seatings.GetSeatingSession,
  seatings.UpdateSeatingSession,
  seatings.DeleteSeatingSession,
  seatings.GetSessionRoomsStatus,
  seatings.GetSessionWithAssignments,

  // --- SEATING : Assignments ---
  seatings.GetRoomLayout,
  seatings.BulkAssignStudents,
  seatings.RebuildAssignments,
  seatings.GetUnassignedStudents,
  seatings.ClearRoomAssignments,
  seatings.FindStudentSeat,
  seatings.GenerateSeating,

  // --- FINANCE : Wallets ---
  wallets.GetWallets,
  wallets.PostWallet,
  wallets.GetWallet,
  wallets.UpdateWallet,
  wallets.DeleteWallet,

  // --- FINANCE : Fee Types ---
  feeTypes.GetFeeTypes,
  feeTypes.PostFeeType,
  feeTypes.GetFeeType,
  feeTypes.UpdateFeeType,
  feeTypes.DeleteFeeType,

  // --- FINANCE : Fee Schedules ---
  feeSchedules.GetFeeSchedules,
  feeSchedules.PostFeeSchedule,
  feeSchedules.GetFeeSchedule,
  feeSchedules.UpdateFeeSchedule,
  feeSchedules.DeleteFeeSchedule,
  feeSchedules.GetFeeSchedulesByFeeType,

  // --- FINANCE : Fee Configurations ---
  feeConfigurations.GetFeeConfigurations,
  feeConfigurations.PostFeeConfiguration,
  feeConfigurations.GetFeeConfiguration,
  feeConfigurations.UpdateFeeConfiguration,
  feeConfigurations.DeleteFeeConfiguration,

  // --- FINANCE : Fee Assignments ---
  feeAssignments.GetFeeAssignments,
  feeAssignments.PostFeeAssignment,
  feeAssignments.GetFeeAssignment,
  feeAssignments.UpdateFeeAssignment,
  feeAssignments.DeleteFeeAssignment,

  // --- FINANCE : Student Payments ---
  studentPayments.GetStudentPayments,
  studentPayments.PostStudentPayment,
  studentPayments.GetStudentPayment,
  studentPayments.UpdateStudentPayment,
  studentPayments.DeleteStudentPayment,

  // --- FINANCE : Daily Exchange Rates ---
  dailyExchangeRates.GetDailyExchangeRates,
  dailyExchangeRates.PostDailyExchangeRate,
  dailyExchangeRates.GetDailyExchangeRate,
  dailyExchangeRates.UpdateDailyExchangeRate,
  dailyExchangeRates.DeleteDailyExchangeRate,
];

export const instantiatedHandlers = instantiateClasses(
  HANDLER_CLASSES_REGISTRY,
  initializerLogger,
);
