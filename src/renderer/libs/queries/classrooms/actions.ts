import { useCallback, useMemo } from "react";
import { SECTION_ENUM } from "@/packages/@core/data-access/db/enum";
import {
  getSectionLabel,
  SECTION_OPTIONS,
} from "@/packages/@core/data-access/db/options";
import { withNotifications } from "@/renderer/libs/notifications";
import {
  useCreateClassroom,
  useUpdateClassroom,
  useDeleteClassroom,
} from "./classroom";
import {
  createClassroomSuggestion,
  getPrefixIdentifier,
  createSuggestion,
  type TSuggestion,
} from "./utils";
import type {
  Classroom,
  ClassroomCreate,
  ClassroomUpdate,
  OptionFilter,
} from "@/packages/@core/data-access/schema-validations";
import {
  type BaseMutationConfig,
  type QueryUpdatePayload,
  useFormBase,
  useFormBaseNotify,
} from "../base";
import { useSearchOptions } from "../options";

const NONE_VALUES = ["undefined", "null"];

export type ClassroomFormData = ClassroomCreate;
export type ClassroomFormConfig = BaseMutationConfig<Classroom>;

export interface UpdateClassroomConfig extends BaseMutationConfig<ClassroomUpdate> {
  schoolId: string;
  classroomId?: string;
}

const CREATE_CLASSROOM_NOTIFICATIONS = {
  success: {
    title: "Salle de classe créée !",
    description: "La salle de classe a été ajoutée avec succès.",
  },
  error: {
    title: "Échec de la création.",
  },
};

const UPDATE_CLASSROOM_NOTIFICATIONS = {
  success: {
    title: "Salle de classe mise à jour !",
    description: "Les modifications ont été enregistrées.",
  },
  error: {
    title: "Échec de la mise à jour.",
  },
};

/**
 * Builds deletion notifications for classrooms.
 * @param identifier - Optional classroom identifier label.
 * @returns Notification configuration object for classroom deletion.
 */
const getDeleteClassroomNotifications = (identifier?: string) => ({
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
});

/**
 * Creates a section-based suggestion using section label prefixes.
 * @param identifier - Target classroom identifier code.
 * @param section - Associated educational section enum.
 * @returns Generated suggestion metadata object.
 */
function createSectionSuggestion(
  identifier: string,
  section?: SECTION_ENUM,
): TSuggestion {
  const prefix = getPrefixIdentifier(identifier);
  const sectionLabel = getSectionLabel(section);

  return createSuggestion(sectionLabel, sectionLabel.substring(0, 1), prefix);
}

/**
 * Shared infrastructure hook encapsulating search options and code suggestion generators.
 * @param schoolId - Unique target school identifier.
 * @returns Option search state, section options, and suggestion generator callback.
 */
function useBaseClassroomForm(schoolId: string) {
  const searchFilters: OptionFilter = useMemo(
    () => ({ where: { options: { schoolId: { $eq: schoolId } } } }),
    [schoolId],
  );
  const search = useSearchOptions({ filters: searchFilters });

  const generateSuggestion = useCallback(
    (
      identifier: string,
      optionId?: string,
      section?: SECTION_ENUM,
    ): TSuggestion | null => {
      if (!search.options || !optionId || NONE_VALUES.includes(optionId)) {
        return createSectionSuggestion(identifier, section);
      }
      return createClassroomSuggestion(search.options, optionId, identifier);
    },
    [search.options],
  );

  return {
    searchOptions: {
      ...search,
      options: [
        { label: "Tronc commun (Aucune option)", value: "none" },
        ...(search.options ?? []),
      ],
    },
    sectionOptions: SECTION_OPTIONS,
    generateSuggestion,
  };
}

/**
 * Form hook managing classroom creation operations.
 * @param schoolId - Unique target school identifier.
 * @param config - Optional base mutation configuration.
 * @returns Form state, submission handlers, and option search states.
 */
export function useCreateClassroomForm(
  schoolId: string,
  config?: ClassroomFormConfig,
) {
  const mutation = useCreateClassroom();
  const base = useBaseClassroomForm(schoolId);

  const adaptData = useCallback((data: ClassroomCreate) => data, []);

  const formNotify = useFormBaseNotify<
    ClassroomCreate,
    ClassroomCreate,
    Classroom
  >({
    mutation,
    config,
    getNotifications: () => CREATE_CLASSROOM_NOTIFICATIONS,
    adaptData,
  });

  return {
    ...formNotify,
    ...base,
  };
}

/**
 * Form hook managing classroom update operations.
 * @param params - Combined configuration parameters containing schoolId and classroomId.
 * @returns Form state, submission handlers, and option search states.
 */
export function useUpdateClassroomForm({
  schoolId,
  classroomId,
  ...config
}: UpdateClassroomConfig) {
  const mutation = useUpdateClassroom();
  const base = useBaseClassroomForm(schoolId);

  const adaptData = useCallback(
    ({ data, id }: QueryUpdatePayload<ClassroomUpdate>) => ({
      id: id ?? classroomId ?? "",
      data,
    }),
    [classroomId],
  );

  const formNotify = useFormBaseNotify<
    QueryUpdatePayload<ClassroomUpdate>,
    { id: string; data: ClassroomUpdate },
    ClassroomUpdate
  >({
    mutation,
    config,
    getNotifications: () => UPDATE_CLASSROOM_NOTIFICATIONS,
    adaptData,
  });

  return {
    ...formNotify,
    ...base,
  };
}

/**
 * Hook for executing classroom deletion operations.
 * @param config - Optional base mutation configuration settings.
 * @returns Object containing deletion trigger and pending state indicator.
 */
export function useDeleteClassroomForm(config?: BaseMutationConfig<void>) {
  const { notifyAndInvalidate } = useFormBase<void>(config);
  const mutation = useDeleteClassroom();

  const deleteClassroom = useCallback(
    async (classId: string, identifier?: string) => {
      return mutation.mutateAsync(
        classId,
        withNotifications({
          notifications: getDeleteClassroomNotifications(identifier),
          onSuccess: () => {
            notifyAndInvalidate();
          },
        }),
      );
    },
    [mutation, notifyAndInvalidate],
  );

  return {
    isDeleting: mutation.isPending,
    deleteClassroom,
    onDelete: deleteClassroom,
  };
}
