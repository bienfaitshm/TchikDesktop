import type { TEnrolementInsert, TUserInsert } from "@/camons/types/models";

export type WithSchoolId<T = {}> = T & { schoolId: string };
export type WithSchoolAndYearId<T = {}> = T & {
  schoolId: string;
  yearId?: string;
};
export type QueryParams<TQuery, TParams> = TQuery & { params: TParams };

export type TQuickEnrolementInsert = Omit<TEnrolementInsert, "studentId"> & {
  student: TUserInsert;
};

export * from "./models";
