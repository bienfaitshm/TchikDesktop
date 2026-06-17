import { useCallback, useMemo } from "react";
import { withNotifications } from "@/renderer/libs/notifications";
import {
  useCreateClassroom,
  useUpdateClassroom,
  useDeleteClassroom,
} from "./classroom";
import { createClassroomSuggestion } from "./utils";
import type {
  Classroom,
  ClassroomCreate,
  ClassroomUpdate,
} from "@/packages/@core/data-access/schema-validations";
import {
  type BaseFormProps,
  type BaseMutationConfig,
  type QueryUpdatePayload,
  useFormBase,
} from "../base";
import { useSearchOptions } from "../options";

export type ClassroomFormData = ClassroomCreate;
export type ClassroomFormConfig = BaseMutationConfig<Classroom>;

/**
 * Hook d'infrastructure interne (Privé à ce fichier)
 * Centralise la recherche des filières (options) et la logique de suggestion.
 */
function useBaseClassroomForm(schoolId: string) {
  const searchFilters = useMemo(() => ({ where: { schoolId } }), [schoolId]);
  const search = useSearchOptions({ filters: searchFilters });

  const generateSuggestion = useCallback(
    (optionId: string, currentName: string) => {
      if (!search.options) return null;
      return createClassroomSuggestion(search.options, optionId, currentName);
    },
    [search.options],
  );

  return {
    searchOptions: search.options,
    isSearchingOptions: search.isSearching,
    generateSuggestion,
  };
}

/**
 * Hook pour la CRÉATION d'une salle de classe.
 */
export function useCreateClassroomForm(
  schoolId: string,
  config?: ClassroomFormConfig,
) {
  const { formId, notifyAndInvalidate } = useFormBase(config);
  const base = useBaseClassroomForm(schoolId);
  const mutation = useCreateClassroom();

  const onSubmit: BaseFormProps<ClassroomFormData>["onSubmit"] = useCallback(
    (data, helpers) => {
      mutation.mutate(
        data,
        withNotifications({
          notifications: {
            success: {
              title: "Salle de classe créée !",
              description: `La salle '${data.identifier}' a été ajoutée avec succès.`,
            },
            error: {
              title: "Échec de la création.",
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
    ...base,
  };
}

interface UpdateClassroomConfig extends BaseMutationConfig<Classroom> {
  schoolId: string;
  classroomId: string;
}

/**
 * Hook pour la MISE À JOUR d'une salle de classe.
 */
export function useUpdateClassroomForm({
  schoolId,
  classroomId,
  ...config
}: UpdateClassroomConfig) {
  const { formId, notifyAndInvalidate } = useFormBase(config);
  const base = useBaseClassroomForm(schoolId);
  const mutation = useUpdateClassroom();

  const onSubmit: BaseFormProps<
    QueryUpdatePayload<ClassroomUpdate>
  >["onSubmit"] = useCallback(
    ({ data, id }, helpers) => {
      mutation.mutate(
        { id: id ?? classroomId, data },
        withNotifications({
          notifications: {
            success: {
              title: "Salle de classe mise à jour !",
              description: `Les modifications de '${data.identifier}' ont été enregistrées.`,
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
    [classroomId, mutation, notifyAndInvalidate],
  );

  return {
    formId,
    onSubmit,
    isSubmitting: mutation.isPending,
    ...base,
  };
}

/**
 * Hook pour la SUPPRESSION d'une salle de classe.
 */
export function useDeleteClassroomForm(config?: BaseMutationConfig<void>) {
  const { notifyAndInvalidate } = useFormBase(config);
  const mutation = useDeleteClassroom();

  const deleteClassroom = useCallback(
    async (classId: string, identifier?: string) => {
      return mutation.mutateAsync(
        classId,
        withNotifications({
          notifications: {
            success: {
              title: "Salle de classe supprimée",
              description: identifier
                ? `La salle '${identifier}' a été définitivement retirée.`
                : "La salle de classe a été supprimée avec succès.",
            },
            error: {
              title: "Erreur de suppression",
              description:
                "Impossible de supprimer la salle. Elle est peut-être liée à d'autres données.",
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
    isDeleting: mutation.isPending,
    deleteClassroom,
  };
}
