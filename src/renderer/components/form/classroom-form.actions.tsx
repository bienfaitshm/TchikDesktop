import { useCallback } from "react";
import { useGetOptionAsOptions } from "@/renderer/hooks/data-as-options";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";
import {
  useCreateClassroom,
  useUpdateClassroom,
  useDeleteClassroom,
} from "@/renderer/libs/queries/classroom";
import {
  createSuggestion,
  type ClassroomFormData,
} from "./classroom-form.utils";
import {
  type BaseFormProps,
  type UseFormBaseConfig,
  useFormBase,
} from "./base-form";

export type ClassroomFormConfig = UseFormBaseConfig<ClassroomFormData>;

function useBaseClassroomForm(schoolId: string) {
  const { options: selectItems, data: rawOptions } =
    useGetOptionAsOptions(schoolId);

  const generateSuggestion = useCallback(
    (optionId: string, currentName: string) => {
      if (!rawOptions) return null;
      return createSuggestion(rawOptions, optionId, currentName);
    },
    [rawOptions],
  );

  return {
    selectItems,
    rawOptions,
    generateSuggestion,
  };
}

export function useCreateClassroomForm(
  schoolId: string,
  config?: ClassroomFormConfig,
) {
  const { formId, handleSuccess } = useFormBase(config);
  const base = useBaseClassroomForm(schoolId);
  const mutation = useCreateClassroom();

  const onSubmit = useCallback<
    NonNullable<BaseFormProps<ClassroomFormData>["onSubmit"]>
  >(
    (data, helpers) => {
      mutation.mutate(
        data,
        createMutationCallbacksWithNotifications({
          successMessageTitle: "Salle de classe créée !",
          successMessageDescription: `La salle '${data.identifier}' a été ajoutée avec succès.`,
          errorMessageTitle: "Échec de la création.",
          onSuccess: (responseData) => {
            handleSuccess(responseData);
            helpers?.reset?.();
          },
        }),
      );
    },
    [mutation, handleSuccess],
  );

  return {
    formId,
    onSubmit,
    isCreating: mutation.isPending,
    ...base,
  };
}

interface UpdateClassroomConfig extends ClassroomFormConfig {
  schoolId: string;
  classroomId: string;
}

export function useUpdateClassroomForm({
  schoolId,
  classroomId,
  ...config
}: UpdateClassroomConfig) {
  const { formId, handleSuccess } = useFormBase(config);
  const base = useBaseClassroomForm(schoolId);
  const mutation = useUpdateClassroom();

  const onSubmit = useCallback<
    NonNullable<BaseFormProps<ClassroomFormData>["onSubmit"]>
  >(
    (data, helpers) => {
      mutation.mutate(
        { id: classroomId, data },
        createMutationCallbacksWithNotifications({
          successMessageTitle: "Salle de classe mise à jour !",
          successMessageDescription: `Les modifications de '${data.identifier}' ont été enregistrées.`,
          errorMessageTitle: "Échec de la mise à jour.",
          onSuccess: (responseData) => {
            handleSuccess(responseData);
            helpers?.reset?.(responseData);
          },
        }),
      );
    },
    [classroomId, mutation, handleSuccess],
  );

  return {
    formId,
    onSubmit,
    isUpdating: mutation.isPending,
    ...base,
  };
}

export function useDeleteClassroomForm(config?: UseFormBaseConfig<string>) {
  const { handleSuccess } = useFormBase(config);
  const mutation = useDeleteClassroom();

  const deleteClassroom = useCallback(
    async (classId: string, identifier?: string) => {
      return mutation.mutateAsync(
        classId,
        createMutationCallbacksWithNotifications({
          successMessageTitle: "Salle de classe supprimée",
          successMessageDescription: identifier
            ? `La salle '${identifier}' a été définitivement retirée.`
            : "La salle de classe a été supprimée avec succès.",
          errorMessageTitle: "Erreur de suppression",
          errorMessageDescription:
            "Impossible de supprimer la salle. Elle est peut-être liée à d'autres données.",
          onSuccess: () => handleSuccess?.(classId),
        }),
      );
    },
    [mutation, handleSuccess],
  );

  return {
    isDeleting: mutation.isPending,
    deleteClassroom,
  };
}
