import type {
  TSchoolAttributes,
  TSchoolCreate,
  TStudyYearAttributes,
  TStudyYearCreate,
  TOptionAttributes,
  TOptionCreate,
  TClassroomAttributes,
  TUserAttributes,
  TUserCreate,
  TClassroomCreate,
} from "@/packages/@core/data-access/schema-validations";
import { createManagementHook } from "@/renderer/hooks/base-query";
import {
  useCreateSchool,
  useCreateStudyYear,
  useDeleteSchool,
  useDeleteStudyYear,
  useUpdateSchool,
  useUpdateStudyYear,
} from "@/renderer/libs/queries/school";

import {
  useCreateOption,
  useDeleteOption,
  useUpdateOption,
} from "@/renderer/libs/queries/option";
import {
  useCreateClassroom,
  useUpdateClassroom,
  useDeleteClassroom,
} from "@/renderer/libs/queries/classroom";
import {
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "@/renderer/libs/queries/account";

/**
 * @description Hook de gestion pour l'entité School (École).
 */
export const useSchoolManagement = createManagementHook<
  TSchoolAttributes,
  TSchoolCreate
>({
  itemName: "École",
  queryKey: ["GET_SCHOOLS"],
  useCreateMutation: useCreateSchool,
  useUpdateMutation: useUpdateSchool,
  useDeleteMutation: useDeleteSchool,
});

/**
 * @description Hook de gestion pour l'entité StudyYear (Année d'étude).
 */
export const useStudyYearManagement = createManagementHook<
  TStudyYearAttributes,
  TStudyYearCreate
>({
  itemName: "Année d'étude",
  queryKey: ["GET_STUDY_YEARS"],
  useCreateMutation: useCreateStudyYear,
  useUpdateMutation: useUpdateStudyYear,
  useDeleteMutation: useDeleteStudyYear,
});

/**
 * @description Hook de gestion pour l'entité Option.
 */
export const useOptionManagement = createManagementHook<
  TOptionAttributes,
  TOptionCreate
>({
  itemName: "Option",
  queryKey: ["GET_OPTIONS"],
  useCreateMutation: useCreateOption,
  useDeleteMutation: useDeleteOption,
  useUpdateMutation: useUpdateOption,
});

/**
 * @description Hook de gestion pour l'entité Classroom (salle de classe).
 */

export const useClassroomManagement = createManagementHook<
  TClassroomAttributes,
  TClassroomCreate
>({
  itemName: "Salle de classe",
  queryKey: ["GET_CLASSROOMS"],
  useCreateMutation: useCreateClassroom,
  useDeleteMutation: useDeleteClassroom,
  useUpdateMutation: useUpdateClassroom,
});

/**
 * @description Hook de gestion pour l'entité User (utilisateur).
 */

export const useUserManagement = createManagementHook<
  TUserAttributes,
  TUserCreate
>({
  itemName: "Utilisateur/Eleve",
  queryKey: ["GET_USERS"],
  useCreateMutation: useCreateUser,
  useDeleteMutation: useDeleteUser,
  useUpdateMutation: useUpdateUser,
});
