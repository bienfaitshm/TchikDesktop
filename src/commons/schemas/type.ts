import { z } from "zod";
import {
  SchoolCreationSchema,
  UserCreationSchema,
  OptionCreationSchema,
  StudyYearCreationSchema,
  ClassroomCreationSchema,
  EnrolementCreationSchema,
  EnrolementActionCreationSchema,
  UserFilterSchema,
  ClassRoomFilterSchema,
  EnrolementFilterSchema,
} from "./models";

// --- Types d'Insertion (TModelInsert) ---

/** Type pour la création d'une école (Body de requête) */
export type TSchoolCreation = z.infer<typeof SchoolCreationSchema>;

/** Type pour la création d'un utilisateur (Body de requête) */
export type TUserCreation = z.infer<typeof UserCreationSchema>;

/** Type pour la création d'une option (Body de requête) */
export type TOptionCreation = z.infer<typeof OptionCreationSchema>;

/** Type pour la création d'une année scolaire (Body de requête) */
export type TStudyYearCreation = z.infer<typeof StudyYearCreationSchema>;

/** Type pour la création d'une classe (Body de requête) */
export type TClassroomCreation = z.infer<typeof ClassroomCreationSchema>;

/** Type pour la création d'une inscription (Body de requête) */
export type TEnrolementCreation = z.infer<typeof EnrolementCreationSchema>;

/** Type pour la création d'une action d'inscription (Body de requête) */
export type TEnrolementActionCreation = z.infer<
  typeof EnrolementActionCreationSchema
>;

// --- Types de Filtre (TModelFilter) ---

/** Type pour filtrer les utilisateurs (Query Params) */
export type TUserFilter = z.infer<typeof UserFilterSchema>;

/** Type pour filtrer les classes (Query Params) */
export type TClassRoomFilter = z.infer<typeof ClassRoomFilterSchema>;

/** Type pour filtrer les inscriptions (Query Params) */
export type TEnrolementFilter = z.infer<typeof EnrolementFilterSchema>;
