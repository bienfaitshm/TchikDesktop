import type {
  TSchoolInsert,
  TStudyYearInsert,
  TSchool,
  TStudyYear,
  TOption,
  TOptionInsert,
  TClassroom,
  TClassroomInsert,
  TUser,
  TUserInsert,
} from "@/commons/types/services";
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
export const useSchoolManagement = createManagementHook<TSchool, TSchoolInsert>(
  {
    itemName: "École",
    queryKey: ["GET_SCHOOLS"],
    useCreateMutation: useCreateSchool,
    useUpdateMutation: useUpdateSchool,
    useDeleteMutation: useDeleteSchool,
  }
);

/**
 * @description Hook de gestion pour l'entité StudyYear (Année d'étude).
 */
export const useStudyYearManagement = createManagementHook<
  TStudyYear,
  TStudyYearInsert
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
export const useOptionManagement = createManagementHook<TOption, TOptionInsert>(
  {
    itemName: "Option",
    queryKey: ["GET_OPTIONS"],
    useCreateMutation: useCreateOption,
    useDeleteMutation: useDeleteOption,
    useUpdateMutation: useUpdateOption,
  }
);

/**
 * @description Hook de gestion pour l'entité Classroom (salle de classe).
 */

export const useClassroomManagement = createManagementHook<
  TClassroom,
  TClassroomInsert
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

export const useUserManagement = createManagementHook<TUser, TUserInsert>({
  itemName: "Utilisateur/Eleve",
  queryKey: ["GET_USERS"],
  useCreateMutation: useCreateUser,
  useDeleteMutation: useDeleteUser,
  useUpdateMutation: useUpdateUser,
});
