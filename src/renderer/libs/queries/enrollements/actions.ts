import { useCallback, useMemo } from "react";
import { withNotifications } from "@/renderer/libs/notifications";
import {
  useCreateEnrollment,
  useCreateQuickEnrollment,
  useUpdateEnrollment,
  useDeleteEnrollment,
} from "./enrollments";
import type {
  Enrollment,
  EnrollmentCreate,
  EnrollmentQuickCreate,
  EnrollmentUpdate,
} from "@/packages/@core/data-access/schema-validations";
import { useSearchUsers } from "../users";
import { useSearchClassrooms } from "../classrooms";
import {
  type BaseFormProps,
  type BaseMutationConfig,
  type QueryUpdatePayload,
  useFormBase,
} from "../base";

/**
 * Interface partagée pour les filtres contextuels des formulaires d'inscription
 */
export interface EnrollmentFormContext {
  schoolId: string;
  yearId: string;
}

/**
 * 1. Hook pour la CRÉATION RAPIDE (Quick Enrollment)
 */
export function useCreateQuickEnrollmentForm(
  config?: BaseMutationConfig<Enrollment>,
  context?: Partial<EnrollmentFormContext>,
) {
  const { formId, notifyAndInvalidate } = useFormBase(config);
  const mutation = useCreateQuickEnrollment();

  const userFilters = useMemo(
    () => ({ where: { schoolId: context?.schoolId ?? "" } }),
    [context?.schoolId],
  );
  const classroomFilters = useMemo(
    () => ({
      where: {
        yearId: context?.yearId ?? "",
        schoolId: context?.schoolId ?? "",
      },
    }),
    [context?.yearId, context?.schoolId],
  );

  const searchUser = useSearchUsers({ filters: userFilters });
  const searchClassroom = useSearchClassrooms({ filters: classroomFilters });

  const onSubmit: BaseFormProps<EnrollmentQuickCreate>["onSubmit"] =
    useCallback(
      (data, helpers) => {
        const studentName = [data?.student?.firstName, data?.student?.lastName]
          .filter(Boolean)
          .join(" ");

        mutation.mutate(
          data,
          withNotifications({
            notifications: {
              success: {
                title: "Inscription réussie !",
                description: studentName
                  ? `L'élève ${studentName} a été inscrit avec succès.`
                  : "L'élève a été inscrit avec succès.",
              },
              error: {
                title: "Erreur d'inscription rapide.",
              },
            },
            onSuccess: (res) => {
              notifyAndInvalidate(res);
              helpers.reset();
            },
          }),
        );
      },
      [mutation, notifyAndInvalidate],
    );

  return {
    formId,
    onSubmit,
    isSubmitting: mutation.isPending,
    searchUser,
    searchClassroom,
  };
}

/**
 * 2. Hook pour la CRÉATION standard d'un enrôlement.
 */
export function useCreateEnrollmentForm(
  config?: BaseMutationConfig<Enrollment>,
  context?: Partial<EnrollmentFormContext>,
) {
  const { formId, notifyAndInvalidate } = useFormBase(config);
  const mutation = useCreateEnrollment();

  const userFilters = useMemo(
    () => ({ where: { schoolId: context?.schoolId ?? "" } }),
    [context?.schoolId],
  );
  const classroomFilters = useMemo(
    () => ({
      where: {
        yearId: context?.yearId ?? "",
        schoolId: context?.schoolId ?? "",
      },
    }),
    [context?.yearId, context?.schoolId],
  );

  const searchUser = useSearchUsers({ filters: userFilters });
  const searchClassroom = useSearchClassrooms({ filters: classroomFilters });

  const onSubmit: BaseFormProps<EnrollmentCreate>["onSubmit"] = useCallback(
    (data, helpers) => {
      mutation.mutate(
        data,
        withNotifications({
          notifications: {
            success: {
              title: "Enrôlement effectué",
              description: "Le nouvel enrôlement a été enregistré.",
            },
            error: {
              title: "Échec de l'enrôlement.",
            },
          },
          onSuccess: (res) => {
            notifyAndInvalidate(res);
            helpers.reset();
          },
        }),
      );
    },
    [mutation, notifyAndInvalidate],
  );

  return {
    formId,
    onSubmit,
    isSubmitting: mutation.isPending,
    searchUser,
    searchClassroom,
  };
}

/**
 * 3. Hook pour la MISE À JOUR d'un enrôlement.
 */
export function useUpdateEnrollmentForm(
  config?: BaseMutationConfig<Enrollment>,
  context?: Partial<EnrollmentFormContext>,
) {
  const { formId, notifyAndInvalidate } = useFormBase(config);
  const mutation = useUpdateEnrollment();

  const userFilters = useMemo(
    () => ({ where: { schoolId: context?.schoolId ?? "" } }),
    [context?.schoolId],
  );
  const classroomFilters = useMemo(
    () => ({
      where: {
        yearId: context?.yearId ?? "",
        schoolId: context?.schoolId ?? "",
      },
    }),
    [context?.yearId, context?.schoolId],
  );

  const searchUser = useSearchUsers({ filters: userFilters });
  const searchClassroom = useSearchClassrooms({ filters: classroomFilters });

  const onSubmit: BaseFormProps<
    QueryUpdatePayload<EnrollmentUpdate>
  >["onSubmit"] = useCallback(
    ({ data, id }, helpers) => {
      mutation.mutate(
        { data, id },
        withNotifications({
          notifications: {
            success: {
              title: "Mise à jour réussie",
              description:
                "Les informations de l'enrôlement ont été modifiées.",
            },
            error: {
              title: "Échec de la mise à jour.",
            },
          },
          onSuccess: (res) => {
            notifyAndInvalidate(res);
            helpers.reset();
          },
        }),
      );
    },
    [mutation, notifyAndInvalidate],
  );

  return {
    formId,
    onSubmit,
    isSubmitting: mutation.isPending,
    searchUser,
    searchClassroom,
  };
}

/**
 * 4. Hook pour la SUPPRESSION d'un enrôlement.
 */
export function useDeleteEnrollmentForm(config?: BaseMutationConfig<void>) {
  const { notifyAndInvalidate } = useFormBase(config);
  const mutation = useDeleteEnrollment();

  const deleteEnrollment = useCallback(
    (enrollmentId: string, studentName?: string) => {
      mutation.mutate(
        enrollmentId,
        withNotifications({
          notifications: {
            success: {
              title: "Enrôlement annulé",
              description: studentName
                ? `L'enrôlement de ${studentName} a été supprimé.`
                : "L'enrôlement a été supprimé.",
            },
          },
          onSuccess: () => {
            notifyAndInvalidate(undefined as void);
          },
        }),
      );
    },
    [mutation, notifyAndInvalidate],
  );

  return {
    deleteEnrollment,
    isDeleting: mutation.isPending,
  };
}
