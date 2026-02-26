import type {
  TEnrolement,
  TWithUser,
  TQuickEnrolementInsert,
  QueryParams,
  WithSchoolAndYearId,
  TEnrolementInsert,
  TWithClassroom,
} from "@/commons/types/services";
import { clientApis } from "./client";

export type GetEnrolementParams = QueryParams<
  WithSchoolAndYearId,
  Partial<TEnrolementInsert>
>;

export const getEnrolements = (params: GetEnrolementParams) => {
  return clientApis
    .get<TWithUser<TWithClassroom<TEnrolement>>[]>("enrolements", {
      params,
    })
    .then((res) => res.data);
};

/**
 * Récupère l'historique des inscriptions, filtrable par école, année et/ou classe.
 * @param {{ schoolId: string; yearId?: string; classId?: string }} params - Les critères de recherche.
 * @returns {Promise<EnrolementHistory>} Un tableau d'objets représentant l'historique d'inscriptions.
 */
export const getEnrolementHistory = (
  params: WithSchoolAndYearId<{ classId?: string }>
) => {
  return clientApis
    .get<TEnrolement[]>("enrolements/history", {
      params,
    })
    .then((res) => res.data);
};

export const getEnrolement = (enrolementId: string) => {
  return clientApis
    .get<TWithUser<TWithClassroom<TEnrolement>>>("enrolements/:enrolementId", {
      params: { enrolementId },
    })
    .then((res) => res.data);
};

export const quickCreateEnrolement = (data: TQuickEnrolementInsert) => {
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
