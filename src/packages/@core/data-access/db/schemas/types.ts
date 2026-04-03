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
import { SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";

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
export type TLocalRoomUpdate = Partial<TLocalRoomInsert>;

export type TSeatingSession = InferSelectModel<typeof seatingSessions>;
export type TSeatingSessionInsert = InferInsertModel<typeof seatingSessions>;
export type TSeatingSessionUpdate = Partial<TSeatingSessionInsert>;

export type TSeatingAssignment = InferSelectModel<typeof seatingAssignments>;
export type TSeatingAssignmentInsert = InferInsertModel<
  typeof seatingAssignments
>;
export type TSeatingAssignmentUpdate = Partial<TSeatingAssignmentInsert>;

/**
 * Extrait les noms des colonnes d'une table pour le typage du tri et des filtres
 */
export type ColumnKeys<T extends SQLiteTableWithColumns<any>> =
  keyof InferSelectModel<T>;

/**
 * Structure de tri multiple conforme à la fonction applyQueryOptions
 */
export interface SortStep<T extends SQLiteTableWithColumns<any>> {
  column: ColumnKeys<T>;
  order: "asc" | "desc";
}

/**
 * Le nouveau standard pour tes options de requête
 */
export interface FindManyOptions<T extends SQLiteTableWithColumns<any>> {
  where?: Partial<InferSelectModel<T>>;
  whereIn?: Partial<Record<ColumnKeys<T>, any[]>>;
  search?: Partial<Record<ColumnKeys<T>, string>>;
  or?: Array<Partial<InferSelectModel<T>>>;
  limit?: number;
  offset?: number;
  orderBy?: SortStep<T>[];
}

export type PaginationAndSort<T extends SQLiteTableWithColumns<any>> = Pick<
  FindManyOptions<T>,
  "limit" | "offset" | "orderBy"
>;

/**
 * Type utilitaire pour combiner des données (ex: filtres personnalisés)
 * avec la logique de pagination/tri
 */
export type WithQueryOptions<
  TData,
  TTable extends SQLiteTableWithColumns<any>,
> = TData & FindManyOptions<TTable>;
