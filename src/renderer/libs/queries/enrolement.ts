import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import type {
  TEnrolement,
  TWithUser,
  TQuickEnrolementInsert,
  TEnrolementInsert,
} from "@/commons/types/services";
import * as apis from "@/renderer/libs/apis/enrolement";

export function useGetEnrolements(params: apis.GetEnrolementParams) {
  return useSuspenseQuery<TWithUser<TEnrolement>[], Error>({
    queryKey: ["GET_ENROLEMENTS", params],
    queryFn: () => apis.getEnrolements(params),
  });
}

export function useCreateQuickEnrolement() {
  return useMutation<TEnrolement, Error, TQuickEnrolementInsert>({
    mutationKey: ["QUICK_ENROLEMENT"],
    mutationFn: (data) => apis.quickEnrolement(data),
  });
}

export function useUpdateEnrollment() {
  return useMutation<
    TEnrolement,
    Error,
    {
      enrolementId: string;
      data: Partial<TEnrolementInsert>;
    }
  >({
    mutationKey: ["UPDATE_ENROLEMENT"],
    mutationFn: ({ data, enrolementId }) =>
      apis.updateEnrolement(enrolementId, data),
  });
}
