import { useSearchClassrooms } from "../classrooms";
import { useSearchStudents } from "../users";
import type {
  BaseMutationConfig,
  NotificationConfig,
  NotificationResolver,
} from "../base";
import {
  useCreateEnrollment,
  useCreateQuickEnrollment,
  useDeleteEnrollment,
  useUpdateEnrollment,
} from "./enrollments";
import {
  useFormBaseDelete,
  useFormBaseCreate,
  useFormBaseUpdate,
} from "../base";
import { useSearchTutors } from "../tutors/helper";
import type { EnrollmentDTO } from "@/packages/@core/data-access/db";

/**
 * Contextual parameters required for enrollment form operations.
 */
export interface EnrollmentFormContext {
  /** Unique identifier of the target school. */
  schoolId: string;
  /** Unique identifier of the target academic year. */
  yearId: string;
}

export type EnrollmentFormConfig = BaseMutationConfig<EnrollmentDTO>;

/** Default notification messages for enrollment creation operations. */
const CREATE_ENROLLMENT_NOTIFICATIONS: NotificationConfig = {
  success: {
    title: "Enrôlement effectué",
    description: "Le nouvel enrôlement a été enregistré.",
  },
  error: {
    title: "Échec de l'enrôlement",
    description: "Impossible d'enregistrer le nouvel enrôlement.",
  },
};

/** Default notification messages for enrollment update operations. */
const UPDATE_ENROLLMENT_NOTIFICATIONS: NotificationConfig = {
  success: {
    title: "Mise à jour réussie",
    description: "Les informations de l'enrôlement ont été modifiées.",
  },
  error: {
    title: "Échec de la mise à jour",
    description: "Impossible de modifier les informations de l'enrôlement.",
  },
};

/**
 * Generates notification configurations for enrollment deletion actions.
 * @param studentName - Optional student full name to display in notification.
 * @returns Notification configuration object with success and error details.
 */
const getDeleteEnrollmentNotifications = (
  studentName?: string,
): NotificationConfig => ({
  success: {
    title: "Enrôlement annulé",
    description: studentName
      ? `L'enrôlement de ${studentName} a été supprimé.`
      : "L'enrôlement a été supprimé.",
  },
  error: {
    title: "Erreur d'annulation",
    description: "Impossible d'annuler cet enrôlement.",
  },
});

/**
 * Builds dynamic notification configurations for quick enrollment operations.
 * @param data - Quick enrollment payload containing student identity details.
 * @returns Formatted notification configuration object.
 */
const getQuickEnrollmentNotifications: NotificationResolver<EnrollmentDTO> = (
  data,
) => {
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
      title: "Erreur d'inscription rapide",
      description: "Impossible de procéder à l'inscription rapide de l'élève.",
    },
  };
};

/**
 * Internal helper hook initializing search dependencies for enrollment forms.
 * @param schoolId - Unique identifier of the school context.
 * @returns Object containing user, classroom, and tutor search hook instances.
 */
function useEnrollmentFormBase(schoolId: string) {
  const searchUser = useSearchStudents();
  const searchClassroom = useSearchClassrooms({ schoolId });
  const searchTutor = useSearchTutors({ schoolId });

  return {
    searchUser,
    searchClassroom,
    searchTutor,
  };
}

/**
 * Form hook managing quick student enrollment creation operations.
 * @param options - Combined school context and mutation options for quick creation.
 * @returns Form state handlers, submission logic, and context search instances.
 */
export function useCreateQuickEnrollmentForm({
  schoolId,
  ...config
}: EnrollmentFormContext & EnrollmentFormConfig) {
  const form = useFormBaseCreate({
    useCreate: useCreateQuickEnrollment,
    config,
    notification: getQuickEnrollmentNotifications,
  });

  const search = useEnrollmentFormBase(schoolId);

  return { ...form, ...search };
}

/**
 * Form hook managing standard student enrollment creation operations.
 * @param options - Combined school context and mutation options for standard creation.
 * @returns Form state handlers, submission logic, and context search instances.
 */
export function useCreateEnrollmentForm({
  schoolId,
  ...config
}: EnrollmentFormContext & EnrollmentFormConfig) {
  const form = useFormBaseCreate({
    useCreate: useCreateEnrollment,
    config,
    notification: CREATE_ENROLLMENT_NOTIFICATIONS,
  });

  const search = useEnrollmentFormBase(schoolId);
  return { ...form, ...search };
}

/**
 * Form hook managing student enrollment update operations.
 * @param options - Combined school context and mutation options for updates.
 * @returns Form state handlers, submission logic, and context search instances.
 */
export function useUpdateEnrollmentForm({
  schoolId,
  ...config
}: EnrollmentFormContext & EnrollmentFormConfig) {
  const form = useFormBaseUpdate({
    useUpdate: useUpdateEnrollment,
    config,
    notification: UPDATE_ENROLLMENT_NOTIFICATIONS,
  });

  const search = useEnrollmentFormBase(schoolId);
  return { ...form, ...search };
}

/**
 * Hook managing enrollment deletion operations and pending states.
 * @param config - Optional mutation configuration settings for deletion.
 * @returns Object containing deletion trigger callback and pending state.
 */
export function useDeleteEnrollmentForm(config?: BaseMutationConfig<void>) {
  return useFormBaseDelete({
    config,
    useDelete: useDeleteEnrollment,
    getNotifications: getDeleteEnrollmentNotifications,
  });
}
