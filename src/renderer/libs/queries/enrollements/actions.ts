import { useCallback, useMemo } from "react";
import { type UseMutationResult } from "@tanstack/react-query";
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
import type { FieldValues } from "react-hook-form";

// ------------------------------------------------------------------
// Types partagés
// ------------------------------------------------------------------
export type EnrollmentFormConfig = BaseMutationConfig<Enrollment>;

export interface EnrollmentFormContext {
  schoolId: string;
  yearId: string;
}

type NotificationConfig = {
  success: { title: string; description: string };
  error: { title: string };
};

// ------------------------------------------------------------------
// Fonction utilitaire : construire les filtres de recherche
// ------------------------------------------------------------------
function getEnrollmentSearchFilters(context?: Partial<EnrollmentFormContext>) {
  const schoolId = context?.schoolId ?? "";
  const yearId = context?.yearId ?? "";
  return {
    userFilters: { where: { schoolId } },
    classroomFilters: { where: { yearId, schoolId } },
  };
}

// ------------------------------------------------------------------
// Hook de base générique pour les formulaires d’inscription
// ------------------------------------------------------------------
interface UseEnrollmentFormBaseParams<TFormData, TMutateInput> {
  /** L’objet mutation déjà instancié (useCreateEnrollment, etc.) */
  mutation: UseMutationResult<any, any, TMutateInput, any>;
  config?: BaseMutationConfig<Enrollment>;
  context?: Partial<EnrollmentFormContext>;
  /** Permet de construire les notifications en fonction des données du formulaire */
  getNotifications: (data: TFormData) => NotificationConfig;
  /** Transforme la donnée du formulaire en entrée de la mutation */
  adaptData: (formData: TFormData) => TMutateInput;
  /** Action supplémentaire exécutée après un succès (avant le reset) */
  onSuccess?: (data: any) => void;
}

function useEnrollmentFormBase<
  TFormData extends FieldValues = any,
  TMutateInput = any,
>({
  mutation,
  config,
  context,
  getNotifications,
  adaptData,
  onSuccess,
}: UseEnrollmentFormBaseParams<TFormData, TMutateInput>) {
  const { formId, notifyAndInvalidate } = useFormBase(config);

  // Filtres pour les recherches utilisateur / classe
  const { userFilters, classroomFilters } = useMemo(
    () => getEnrollmentSearchFilters(context),
    [context?.schoolId, context?.yearId],
  );

  const searchUser = useSearchUsers({ filters: userFilters });
  const searchClassroom = useSearchClassrooms({ filters: classroomFilters });

  // Soumission générique
  const onSubmit: BaseFormProps<TFormData>["onSubmit"] = useCallback(
    (data, helpers) => {
      const input = adaptData(data);
      const notificationsConfig = getNotifications(data);

      mutation.mutate(
        input,
        withNotifications({
          notifications: notificationsConfig,
          onSuccess: (res) => {
            notifyAndInvalidate(res);
            helpers.reset();
            onSuccess?.(res);
          },
        }),
      );
    },
    [mutation, notifyAndInvalidate, adaptData, getNotifications, onSuccess],
  );

  return {
    formId,
    onSubmit,
    isSubmitting: mutation.isPending,
    searchUser,
    searchClassroom,
  };
}

// ------------------------------------------------------------------
// 1. Création rapide (Quick Enrollment)
// ------------------------------------------------------------------
export function useCreateQuickEnrollmentForm(
  config?: BaseMutationConfig<Enrollment>,
  context?: Partial<EnrollmentFormContext>,
) {
  const mutation = useCreateQuickEnrollment();

  return useEnrollmentFormBase<EnrollmentQuickCreate, EnrollmentQuickCreate>({
    mutation,
    config,
    context,
    getNotifications: (data) => {
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
    },
    adaptData: (data) => data,
  });
}

// ------------------------------------------------------------------
// 2. Création standard
// ------------------------------------------------------------------
export function useCreateEnrollmentForm(
  config?: BaseMutationConfig<Enrollment>,
  context?: Partial<EnrollmentFormContext>,
) {
  const mutation = useCreateEnrollment();

  return useEnrollmentFormBase<EnrollmentCreate, EnrollmentCreate>({
    mutation,
    config,
    context,
    getNotifications: () => ({
      success: {
        title: "Enrôlement effectué",
        description: "Le nouvel enrôlement a été enregistré.",
      },
      error: {
        title: "Échec de l'enrôlement.",
      },
    }),
    adaptData: (data) => data,
  });
}

// ------------------------------------------------------------------
// 3. Mise à jour
// ------------------------------------------------------------------
export function useUpdateEnrollmentForm(
  config?: BaseMutationConfig<Enrollment>,
  context?: Partial<EnrollmentFormContext>,
) {
  const mutation = useUpdateEnrollment();

  return useEnrollmentFormBase<
    QueryUpdatePayload<EnrollmentUpdate>,
    { data: EnrollmentUpdate; id: string }
  >({
    mutation,
    config,
    context,
    getNotifications: () => ({
      success: {
        title: "Mise à jour réussie",
        description: "Les informations de l'enrôlement ont été modifiées.",
      },
      error: {
        title: "Échec de la mise à jour.",
      },
    }),
    adaptData: ({ data, id }) => ({ data, id }),
  });
}

// ------------------------------------------------------------------
// 4. Suppression (reste spécifique car pas de formulaire)
// ------------------------------------------------------------------
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
