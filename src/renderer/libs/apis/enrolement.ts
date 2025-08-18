import type {
  TEnrolement,
  TWithUser,
  TQuickEnrolementInsert,
  QueryParams,
  WithSchoolAndYearId,
  TEnrolementInsert,
} from "@/commons/types/services";
import { clientApis } from "./client";

export type GetEnrolementParams = QueryParams<
  WithSchoolAndYearId,
  Partial<TEnrolementInsert>
>;

export const getEnrolements = (params: GetEnrolementParams) => {
  return clientApis
    .get<TWithUser<TEnrolement>[]>("enrolements", {
      params,
    })
    .then((res) => res.data);
};

export const quickEnrolement = (data: TQuickEnrolementInsert) => {
  return clientApis
    .post<TEnrolement, TQuickEnrolementInsert>("enrolements/quick", data)
    .then((res) => res.data);
};

export const updateEnrolement = (
  enrolementId: string,
  data: Partial<TEnrolementInsert>
) => {
  return clientApis
    .put<
      TEnrolement,
      Partial<TEnrolementInsert>
    >("enrolements/:enrolementId", data, { params: { enrolementId } })
    .then((res) => res.data);
};

export const deleteEnrolement = (enrolementId: string) => {
  return clientApis
    .delete("enrolements/:enrolementId", { params: { enrolementId } })
    .then((res) => res.data);
};
