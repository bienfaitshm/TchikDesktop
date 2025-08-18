import {
  useMutation,
  useSuspenseQuery,
  UseSuspenseQueryOptions,
} from "@tanstack/react-query";
import type {
  TEnrolement,
  TWithUser,
  TQuickEnrolementInsert,
  TEnrolementInsert,
  TWithClassroom,
} from "@/commons/types/services";
import * as apis from "@/renderer/libs/apis/enrolement";

export function useGetEnrollments(params: apis.GetEnrolementParams) {
  return useSuspenseQuery<TWithUser<TEnrolement>[], Error>({
    queryKey: ["GET_ENROLLMENTS", params],
    queryFn: () => apis.getEnrolements(params),
  });
}

export function useGetEnrollment(
  enrolementId: string,
  options?: Partial<
    UseSuspenseQueryOptions<TWithUser<TWithClassroom<TEnrolement>>>
  >
) {
  return useSuspenseQuery<TWithUser<TWithClassroom<TEnrolement>>, Error>({
    queryKey: ["GET_ENROLLMENT", enrolementId],
    queryFn: () => apis.getEnrolement(enrolementId),
    ...options,
  });
}

//

export function useCreateQuickEnrolement() {
  return useMutation<TEnrolement, Error, TQuickEnrolementInsert>({
    mutationKey: ["QUICK_ENROLEMENT"],
    mutationFn: (data) => apis.quickCreateEnrolement(data),
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
