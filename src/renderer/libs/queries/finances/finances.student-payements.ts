import { useMutation, useSuspenseQuery } from "../base";
import { studentPayment as paymentApi } from "@/renderer/libs/apis";
import type {
  StudentPaymentCreate,
  StudentPaymentFilter,
  StudentPaymentUpdate,
} from "@/packages/@core/data-access/schema-validations";
import type { TQueryUpdate } from "../type";
import type {
  SelectOption,
  StudentPaymentDTO,
} from "@/packages/@core/data-access/db/queries";
import type {
  UseMutationOptions,
  UseSuspenseQueryOptions,
} from "@tanstack/react-query";

export const studentPaymentKeys = {
  all: ["fin", "student-payments"] as const,
  lists: (params?: StudentPaymentFilter) =>
    [...studentPaymentKeys.all, "list", { params }] as const,
  options: (params?: StudentPaymentFilter) =>
    [...studentPaymentKeys.all, "options", { params }] as const,
  details: () => [...studentPaymentKeys.all, "detail"] as const,
  detail: (id: string) => [...studentPaymentKeys.details(), id] as const,
  mutations: {
    create: () => [...studentPaymentKeys.all, "create"] as const,
    update: () => [...studentPaymentKeys.all, "update"] as const,
    delete: () => [...studentPaymentKeys.all, "delete"] as const,
  },
} as const;

export function useGetStudentPayments(
  params?: StudentPaymentFilter,
  options?: Partial<UseSuspenseQueryOptions<StudentPaymentDTO[]>>,
) {
  return useSuspenseQuery({
    queryKey: studentPaymentKeys.lists(params),
    queryFn: () => paymentApi.fetchStudentPayments(params),
    ...options,
  });
}

export function useGetStudentPaymentAsOptions(
  params?: StudentPaymentFilter,
  options?: Partial<
    UseSuspenseQueryOptions<(SelectOption & StudentPaymentDTO)[]>
  >,
) {
  return useSuspenseQuery({
    queryKey: studentPaymentKeys.options(params),
    queryFn: () => paymentApi.fetchStudentPaymentsAsOptions(params),
    ...options,
  });
}

export function useGetStudentPaymentById(
  paymentId: string,
  options?: Partial<UseSuspenseQueryOptions<StudentPaymentDTO>>,
) {
  return useSuspenseQuery({
    queryKey: studentPaymentKeys.detail(paymentId),
    queryFn: () => paymentApi.fetchStudentPaymentById(paymentId),
    ...options,
  });
}

export function useCreateStudentPayment(
  options?: Partial<
    UseMutationOptions<StudentPaymentDTO, Error, StudentPaymentCreate>
  >,
) {
  return useMutation({
    mutationKey: studentPaymentKeys.mutations.create(),
    mutationFn: (data) => paymentApi.createStudentPayment(data),
    ...options,
  });
}

export function useUpdateStudentPayment(
  options?: Partial<
    UseMutationOptions<
      StudentPaymentDTO,
      Error,
      TQueryUpdate<StudentPaymentUpdate>
    >
  >,
) {
  return useMutation({
    mutationKey: studentPaymentKeys.mutations.update(),
    mutationFn: ({ data, id }) => paymentApi.updateStudentPayment(id, data),
    ...options,
  });
}

export function useDeleteStudentPayment(
  options?: Partial<UseMutationOptions<void, Error, string>>,
) {
  return useMutation({
    mutationKey: studentPaymentKeys.mutations.delete(),
    mutationFn: (paymentId: string) =>
      paymentApi.deleteStudentPayment(paymentId),
    ...options,
  });
}
