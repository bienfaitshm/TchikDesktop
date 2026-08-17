import { useCallback, useMemo } from "react";
import { SECTION_ENUM } from "@/packages/@core/data-access/db/enum";
import {
  getSectionLabel,
  SECTION_OPTIONS,
} from "@/packages/@core/data-access/db/options";
import type {
  Classroom,
  ClassroomCreate,
  ClassroomUpdate,
  OptionFilter,
} from "@/packages/@core/data-access/schema-validations";
import {
  type BaseMutationConfig,
  useFormBaseCreate,
  useFormBaseDelete,
  useFormBaseUpdate,
} from "../base";
import { useSearchOptions } from "../options";
import {
  useCreateClassroom,
  useDeleteClassroom,
  useUpdateClassroom,
} from "./classroom";
import {
  createClassroomSuggestion,
  createSuggestion,
  getPrefixIdentifier,
  type TSuggestion,
} from "./utils";

/** Sentinel values indicating an unselected or undefined option ID. */
const UNSELECTED_OPTION_VALUES: readonly string[] = [
  "undefined",
  "null",
  "none",
];

/** Default option entry for classes without a specialized stream. */
const DEFAULT_OPTION_ITEM = {
  label: "Tronc commun (Aucune option)",
  value: "none",
} as const;

/** Notifications configuration for classroom creation. */
const CREATE_CLASSROOM_NOTIFICATIONS = {
  success: {
    title: "Salle de classe créée !",
    description: "La salle de classe a été ajoutée avec succès.",
  },
  error: {
    title: "Échec de la création.",
  },
} as const;

/** Notifications configuration for classroom update. */
const UPDATE_CLASSROOM_NOTIFICATIONS = {
  success: {
    title: "Salle de classe mise à jour !",
    description: "Les modifications ont été enregistrées.",
  },
  error: {
    title: "Échec de la mise à jour.",
  },
} as const;

export type ClassroomFormData = ClassroomCreate;
export type ClassroomFormConfig = BaseMutationConfig<Classroom>;

/** Configuration parameters for updating a classroom record. */
export interface UpdateClassroomConfig extends BaseMutationConfig<ClassroomUpdate> {
  schoolId: string;
  classroomId?: string;
}

/**
 * Builds dynamic deletion notifications tailored to the specified classroom name.
 * @param identifier - Display identifier of the target classroom.
 * @returns Notification object containing success and error configurations.
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
 * Generates a fallback classroom suggestion based on section prefixing.
 * @param identifier - Base classroom code or name.
 * @param section - Associated educational section enum value.
 * @returns Formatted suggestion object.
 */
function createSectionSuggestion(
  identifier: string,
  section?: SECTION_ENUM,
): TSuggestion {
  const prefix = getPrefixIdentifier(identifier);
  const sectionLabel = getSectionLabel(section ?? SECTION_ENUM.SECONDARY);

  return createSuggestion(sectionLabel, sectionLabel.substring(0, 1), prefix);
}

/**
 * Internal shared hook providing school option search and code suggestion logic.
 * @param schoolId - Unique target school identifier.
 * @returns Form search states, section selection options, and suggestion generator.
 */
function useBaseClassroomForm(schoolId: string) {
  const searchFilters: OptionFilter = useMemo(
    () => ({ where: { options: { schoolId: { $eq: schoolId } } } }),
    [schoolId],
  );

  const search = useSearchOptions({ filters: searchFilters });

  const options = useMemo(
    () => [DEFAULT_OPTION_ITEM, ...(search.options ?? [])],
    [search.options],
  );

  const generateSuggestion = useCallback(
    (
      identifier: string,
      optionId?: string,
      section?: SECTION_ENUM,
    ): TSuggestion | null => {
      if (
        !search.options ||
        !optionId ||
        UNSELECTED_OPTION_VALUES.includes(optionId)
      ) {
        return createSectionSuggestion(identifier, section);
      }
      return createClassroomSuggestion(search.options, optionId, identifier);
    },
    [search.options],
  );

  return {
    searchOptions: {
      ...search,
      options,
    },
    sectionOptions: SECTION_OPTIONS,
    generateSuggestion,
  };
}

/**
 * Form hook providing submit handlers and state for classroom creation.
 * @param schoolId - Target school identifier.
 * @param config - Optional mutation configuration options.
 * @returns Form properties and search options for classroom creation.
 */
export function useCreateClassroomForm(
  schoolId: string,
  config?: ClassroomFormConfig,
) {
  const base = useBaseClassroomForm(schoolId);
  const formProps = useFormBaseCreate<ClassroomCreate>({
    useCreate: useCreateClassroom,
    config,
    notification: CREATE_CLASSROOM_NOTIFICATIONS,
  });

  return {
    ...formProps,
    ...base,
  };
}

/**
 * Form hook providing submit handlers and state for classroom update operations.
 * @param params - Configuration object including schoolId, classroomId, and mutation settings.
 * @returns Form properties and search options for classroom updates.
 */
export function useUpdateClassroomForm({
  schoolId,
  classroomId,
  ...config
}: UpdateClassroomConfig) {
  const base = useBaseClassroomForm(schoolId);
  const formProps = useFormBaseUpdate<ClassroomUpdate>({
    id: classroomId,
    config,
    notification: UPDATE_CLASSROOM_NOTIFICATIONS,
    useUpdate: useUpdateClassroom,
  });

  return {
    ...formProps,
    ...base,
  };
}

/**
 * Hook managing the deletion workflow for a specific classroom record.
 * @param config - Optional mutation configuration.
 * @returns Object providing the deletion trigger and pending state.
 */
export function useDeleteClassroomForm(config?: BaseMutationConfig<void>) {
  return useFormBaseDelete({
    useDelete: useDeleteClassroom,
    config,
    getNotifications: getDeleteClassroomNotifications,
  });
}
