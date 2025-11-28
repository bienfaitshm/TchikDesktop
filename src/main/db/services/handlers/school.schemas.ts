// school.schemas.ts

import { z } from "zod";

/** Schéma de base pour les IDs (utilisé pour les Find/Delete/Update par PK) */
export const SchoolDetailParamSchema = z.object({
  schoolId: z.string().min(1, "L'ID ne peut pas être vide."),
});

export const YearDetailParamSchema = z.object({
  yeaderId: z.string().min(1, "L'ID ne peut pas être vide."),
});
/** Schéma pour les filtres de recherche d'écoles */
export const GetSchoolsParamsSchema = z
  .object({
    schoolId: z
      .string()
      .optional()
      .describe("ID de l'école (recherche exacte)."),
    name: z
      .string()
      .optional()
      .describe("Nom de l'école (recherche partielle)."),
    // ... autres champs TSchoolInsert
  })
  .partial();

/** Schéma pour la création d'une école */
export const CreateSchoolParamsSchema = z.object({
  name: z
    .string()
    .min(3, "Le nom de l'école doit contenir au moins 3 caractères."),
  address: z.string().optional(),
  // ... autres champs obligatoires pour TSchoolInsert
});

/** Schéma pour la mise à jour d'une école (l'ID est géré séparément dans le Handler, mais inclus ici par convention) */
export const UpdateSchoolParamsSchema =
  CreateSchoolParamsSchema.partial().extend({
    id: z.string().min(1, "L'ID de l'école est requis pour la mise à jour."),
  });

// Schémas StudyYear
// ... (Les schémas StudyYear seraient définis ici de manière similaire)

/** Schéma pour la recherche d'années d'études */
export const GetStudyYearsParamsSchema = z
  .object({
    schoolId: z
      .string()
      .min(1, "L'ID de l'école est requis pour filtrer les années."),
    yearName: z.string().optional(),
    // ... autres champs TStudyYearInsert
  })
  .partial()
  .required({ schoolId: true }); // schoolId est requis pour la recherche
