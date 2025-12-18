import {
  useMutation,
  useSuspenseQuery,
  UseSuspenseQueryOptions,
} from "@tanstack/react-query";
import {
  TEnrolementAttributes,
  TEnrolementCreate,
  TEnrolementQuickCreate,
  TEnrolementUpdate,
  TEnrolementFilter,
} from "@/packages/@core/data-access/schema-validations";
import { enrollement } from "@/renderer/libs/apis";
import { TQueryUpdate } from "./type";

export function useGetEnrollments(params?: TEnrolementFilter) {
  return useSuspenseQuery({
    queryKey: ["GET_ENROLLMENTS", params],
    queryFn: () => enrollement.fetchEnrollements(params),
  });
}

export function useGetEnrollmentById(
  enrolementId: string,
  options?: Partial<UseSuspenseQueryOptions<TEnrolementAttributes>>
) {
  return useSuspenseQuery({
    queryKey: ["GET_ENROLLMENT", enrolementId],
    queryFn: () => enrollement.fetchEnrollementById(enrolementId),
    ...options,
  });
}

export function useCreateEnrolement() {
  return useMutation({
    mutationKey: ["CREATE_ENROLEMENT"],
    mutationFn: (data: TEnrolementCreate) =>
      enrollement.createEnrollement(data),
  });
}

//

export function useCreateQuickEnrolement() {
  return useMutation({
    mutationKey: ["QUICK_ENROLEMENT"],
    mutationFn: (data: TEnrolementQuickCreate) =>
      enrollement.createQuickEnrollement(data),
  });
}

export function useUpdateEnrollment() {
  return useMutation({
    mutationKey: ["UPDATE_ENROLEMENT"],
    mutationFn: ({ data, id }: TQueryUpdate<TEnrolementUpdate>) =>
      enrollement.updateEnrollement(id, data),
  });
}
