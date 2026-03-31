import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  schools,
  users,
  options,
  studyYears,
  classRooms,
  classroomEnrolements,
  classroomEnrolementActions,
  localRooms,
  seatingSessions,
  seatingAssignments,
} from "./schema";

export type TSchool = InferSelectModel<typeof schools>;
export type TSchoolInsert = InferInsertModel<typeof schools>;
export type TSchoolUpdate = Partial<Omit<TSchoolInsert, "schoolId">>;

export type TUser = InferSelectModel<typeof users>;
export type TUserInsert = InferInsertModel<typeof users>;
export type TUserUpdate = Partial<Omit<TUserInsert, "userId" | "schoolId">>;

export type TOption = InferSelectModel<typeof options>;
export type TOptionInsert = InferInsertModel<typeof options>;
export type TOptionUpdate = Partial<Omit<TOptionInsert, "optionId">>;

export type TStudyYear = InferSelectModel<typeof studyYears>;
export type TStudyYearInsert = InferInsertModel<typeof studyYears>;
export type TStudyYearUpdate = Partial<Omit<TStudyYearInsert, "yearId">>;

export type TClassroom = InferSelectModel<typeof classRooms>;
export type TClassroomInsert = InferInsertModel<typeof classRooms>;
export type TClassroomUpdate = Partial<Omit<TClassroomInsert, "classId">>;

export type TEnrolement = InferSelectModel<typeof classroomEnrolements>;
export type TEnrolementInsert = InferInsertModel<typeof classroomEnrolements>;
export type TEnrolementUpdate = Partial<
  Omit<TEnrolementInsert, "enrolementId" | "studentId" | "classroomId">
>;

export type TEnrolementAction = InferSelectModel<
  typeof classroomEnrolementActions
>;
export type TEnrolementActionInsert = InferInsertModel<
  typeof classroomEnrolementActions
>;

export type TLocalRoom = InferSelectModel<typeof localRooms>;
export type TLocalRoomInsert = InferInsertModel<typeof localRooms>;

export type TSeatingSession = InferSelectModel<typeof seatingSessions>;
export type TSeatingSessionInsert = InferInsertModel<typeof seatingSessions>;

export type TSeatingAssignment = InferSelectModel<typeof seatingAssignments>;
export type TSeatingAssignmentInsert = InferInsertModel<
  typeof seatingAssignments
>;

export type PaginationAndSort = {
  limit?: number;
  offset?: number;
  orderBy?: string;
  order?: "ASC" | "DESC";
};

export type WithPaginationAndSort<TData> = PaginationAndSort & TData;
