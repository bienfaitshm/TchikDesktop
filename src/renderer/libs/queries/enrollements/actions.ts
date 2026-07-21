import { useCallback, useMemo } from "react";
import type { FieldValues } from "react-hook-form";
import type {
  ClassroomFilter,
  Enrollment,
  EnrollmentCreate,
  EnrollmentQuickCreate,
  EnrollmentUpdate,
  UserFilter,
} from "@/packages/@core/data-access/schema-validations";
import { withNotifications } from "@/renderer/libs/notifications";
import { useSearchClassrooms } from "../classrooms";
import { useSearchUsers } from "../users";
import type {
  BaseMutationConfig,
  QueryUpdatePayload,
  UseBaseParams,
} from "../base";
import { useFormBase, useFormBaseNotify } from "../base";
import {
  useCreateEnrollment,
  useCreateQuickEnrollment,
  useDeleteEnrollment,
  useUpdateEnrollment,
} from "./enrollments";

export type EnrollmentFormConfig = BaseMutationConfig<Enrollment>;

export interface EnrollmentFormContext {
  schoolId: string;
  yearId: string;
}

const CREATE_ENROLLMENT_NOTIFICATIONS = {
  success: {
    title: "Enrôlement effectué",
    description: "Le nouvel enrôlement a été enregistré.",
  },
  error: {
    title: "Échec de l'enrôlement.",
  },
};

const UPDATE_ENROLLMENT_NOTIFICATIONS = {
  success: {
    title: "Mise à jour réussie",
    description: "Les informations de l'enrôlement ont été modifiées.",
  },
  error: {
    title: "Échec de la mise à jour.",
  },
};

/**
 * Builds deletion notifications for enrollment cancellations.
 * @param studentName - Optional student name to display in the notification body.
 * @returns Notification object for enrollment deletion.
 */
const getDeleteEnrollmentNotifications = (studentName?: string) => ({
  success: {
    title: "Enrôlement annulé",
    description: studentName
      ? `L'enrôlement de ${studentName} a été supprimé.`
      : "L'enrôlement a été supprimé.",
  },
});

/**
 * Computes query filters for user and classroom searches.
 * @param context - Optional context parameters containing school and year IDs.
 * @returns Object containing userFilters and classroomFilters.
 */
function getEnrollmentSearchFilters(context?: Partial<EnrollmentFormContext>): {
  userFilters: UserFilter;
  classroomFilters: ClassroomFilter;
} {
  const schoolId = context?.schoolId ?? "";
  return {
    userFilters: { where: { users: { schoolId: { $eq: schoolId } } } },
    classroomFilters: {
      where: { classrooms: { schoolId: { $eq: schoolId } } },
    },
  };
}

export interface UseEnrollmentFormBaseParams<
  TFormData extends FieldValues,
  TMutateInput,
  TReturnData = unknown,
> extends UseBaseParams<TFormData, TMutateInput, TReturnData> {
  context?: Partial<EnrollmentFormContext>;
}

/**
 * Internal base hook encapsulating user/classroom search option hooks and form mutation bindings.
 * @template TFormData - The form input field values structure.
 * @template TMutateInput - The variable structure required by the mutation.
 * @template TReturnData - The response data type returned by the mutation.
 * @param params - Parameters object containing context, mutation, adapters, and notifications.
 * @returns Object exposing formId, onSubmit, submission status, and search option states.
 */
function useEnrollmentFormBase<
  TFormData extends FieldValues,
  TMutateInput,
  TReturnData = unknown,
>({
  context,
  ...params
}: UseEnrollmentFormBaseParams<TFormData, TMutateInput, TReturnData>) {
  const { userFilters, classroomFilters } = useMemo(
    () => getEnrollmentSearchFilters(context),
    [context?.schoolId, context?.yearId],
  );

  const searchUser = useSearchUsers({ filters: userFilters });
  const searchClassroom = useSearchClassrooms({ filters: classroomFilters });

  const formNotify = useFormBaseNotify<TFormData, TMutateInput, TReturnData>(
    params,
  );

  return {
    ...formNotify,
    searchUser,
    searchClassroom,
  };
}

/**
 * Form hook managing quick student enrollment creation operations.
 * @param config - Optional base mutation configuration settings.
 * @param context - Context parameters containing schoolId and yearId.
 * @returns Form handlers, submission states, and user/classroom search instances.
 */
export function useCreateQuickEnrollmentForm(
  config?: BaseMutationConfig<Enrollment>,
  context?: Partial<EnrollmentFormContext>,
) {
  const mutation = useCreateQuickEnrollment();

  const adaptData = useCallback((data: EnrollmentQuickCreate) => data, []);

  const getNotifications = useCallback((data: EnrollmentQuickCreate) => {
    const studentName = [data?.student?.firstName, data?.student?.lastName]
      .filter(Boolean)
      .join(" ");
    return {
      success: {
        title: "Inscription réussie !",
        description: studentName
          ? `L'élève ${studentName} a été inscrit avec succès.`
          : "L'élève a été inscrit avec succès.",
      },
      error: {
        title: "Erreur d'inscription rapide.",
      },
    };
  }, []);

  return useEnrollmentFormBase<
    EnrollmentQuickCreate,
    EnrollmentQuickCreate,
    Enrollment
  >({
    mutation,
    config,
    context,
    getNotifications,
    adaptData,
  });
}

/**
 * Form hook managing standard student enrollment creation operations.
 * @param config - Optional base mutation configuration settings.
 * @param context - Context parameters containing schoolId and yearId.
 * @returns Form handlers, submission states, and user/classroom search instances.
 */
export function useCreateEnrollmentForm(
  config?: BaseMutationConfig<Enrollment>,
  context?: Partial<EnrollmentFormContext>,
) {
  const mutation = useCreateEnrollment();

  const adaptData = useCallback((data: EnrollmentCreate) => data, []);

  return useEnrollmentFormBase<EnrollmentCreate, EnrollmentCreate, Enrollment>({
    mutation,
    config,
    context,
    getNotifications: () => CREATE_ENROLLMENT_NOTIFICATIONS,
    adaptData,
  });
}

/**
 * Form hook managing student enrollment update operations.
 * @param config - Optional base mutation configuration settings.
 * @param context - Context parameters containing schoolId and yearId.
 * @returns Form handlers, submission states, and user/classroom search instances.
 */
export function useUpdateEnrollmentForm(
  config?: BaseMutationConfig<EnrollmentUpdate>,
  context?: Partial<EnrollmentFormContext>,
) {
  const mutation = useUpdateEnrollment();

  const adaptData = useCallback(
    ({ data, id }: QueryUpdatePayload<EnrollmentUpdate>) => ({ data, id }),
    [],
  );

  return useEnrollmentFormBase<
    QueryUpdatePayload<EnrollmentUpdate>,
    { data: EnrollmentUpdate; id: string },
    EnrollmentUpdate
  >({
    mutation,
    config,
    context,
    getNotifications: () => UPDATE_ENROLLMENT_NOTIFICATIONS,
    adaptData,
  });
}

/**
 * Hook for executing enrollment deletion operations.
 * @param config - Optional base mutation configuration settings.
 * @returns Object containing deleteEnrollment callback and pending state indicator.
 */
export function useDeleteEnrollmentForm(config?: BaseMutationConfig<void>) {
  const { notifyAndInvalidate } = useFormBase<void>(config);
  const mutation = useDeleteEnrollment();

  const deleteEnrollment = useCallback(
    (enrollmentId: string, studentName?: string) => {
      mutation.mutate(
        enrollmentId,
        withNotifications({
          notifications: getDeleteEnrollmentNotifications(studentName),
          onSuccess: () => {
            notifyAndInvalidate();
          },
        }),
      );
    },
    [mutation, notifyAndInvalidate],
  );

  return {
    deleteEnrollment,
    isDeleting: mutation.isPending,
    onDelete: deleteEnrollment,
  };
}
