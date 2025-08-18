import type { TEnrolementInsert, TUserInsert } from "@/commons/types/models";
import { TClassroomInsert } from "./models";
export * from "./models";

export type WithSchoolId<T = {}> = T & { schoolId: string };
export type WithSchoolAndYearId<T = {}> = T & {
  schoolId: string;
  yearId?: string;
};
export type QueryParams<TQuery, TParams> = TQuery & { params?: TParams };

export type TQuickEnrolementInsert = Omit<TEnrolementInsert, "studentId"> & {
  student: TUserInsert;
};

// params
export type GetClassroomParams = QueryParams<
  WithSchoolAndYearId,
  Partial<TClassroomInsert>
>;
