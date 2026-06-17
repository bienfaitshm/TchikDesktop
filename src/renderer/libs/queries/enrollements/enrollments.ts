import { useMutation, useSuspenseQuery } from "./base/query";
import {
  Enrollment,
  EnrollmentCreate,
  EnrollmentQuickCreate,
  EnrollmentUpdate,
  EnrollmentFilter,
} from "@/packages/@core/data-access/schema-validations";
import { enrollement } from "@/renderer/libs/apis";
import { TQueryUpdate } from "./type";
import type { UseSuspenseQueryOptions } from "@tanstack/react-query";

export function useGetEnrollments(params?: EnrollmentFilter) {
  return useSuspenseQuery({
    queryKey: ["GET_ENROLLMENTS", params],
    queryFn: () => enrollement.fetchEnrollements(params),
  });
}

export function useGetEnrollmentById(
  enrollmentId: string,
  options?: Partial<UseSuspenseQueryOptions<Enrollment>>,
) {
  return useSuspenseQuery({
    queryKey: ["GET_ENROLLMENT", enrollmentId],
    queryFn: () => enrollement.fetchEnrollementById(enrollmentId),
    ...options,
  });
}

export function useCreateEnrollment() {
  return useMutation({
    mutationKey: ["CREATE_ENROLLMENT"],
    mutationFn: (data: EnrollmentCreate) => enrollement.createEnrollement(data),
  });
}

//

export function useCreateQuickEnrollment() {
  return useMutation({
    mutationKey: ["QUICK_ENROLLMENT"],
    mutationFn: (data: EnrollmentQuickCreate) =>
      enrollement.createQuickEnrollement(data),
  });
}

export function useUpdateEnrollment() {
  return useMutation({
    mutationKey: ["UPDATE_ENROLLMENT"],
    mutationFn: ({ data, id }: TQueryUpdate<EnrollmentUpdate>) =>
      enrollement.updateEnrollement(id, data),
  });
}

export function useDeleteEnrollment() {
  return useMutation({
    mutationKey: ["DELETE_ENROLLMENT"],
    mutationFn: (id: string) => enrollement.deleteEnrollement(id),
  });
}
