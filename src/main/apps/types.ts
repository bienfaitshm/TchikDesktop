import type {
  WithSchoolAndYearId,
  WithSchoolId,
} from "@/main/db/services/types";

export type WithSchoolIdParams<T extends {} = {}> = WithSchoolId<T>;
export type WithSchoolAndYearIdParams<T extends {} = {}> =
  WithSchoolAndYearId<T>;
