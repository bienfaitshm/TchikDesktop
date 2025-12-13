import { z } from "zod";
import { SchoolService } from "@/main/db/services/school.service";
import { createValidatedHandler } from "@/commons/libs/electron-ipc-rest";

import { StudyYearCreationSchema } from "@/commons/schemas/models";

import type { TStudyYearCreation } from "@/commons/schemas/type";
import { createPersistenceHandler } from "./handlers";

// =============================================================================
// SCHÉMAS DE PARAMÈTRES SPÉCIFIQUES À STUDY YEAR
// =============================================================================

/** Schéma pour valider un ID unique dans le chemin de l'URL pour StudyYear */
// Renommé et adapté pour l'ID d'année d'étude
export const YearIdParamSchema = z
  .object({
    yearId: z.string().nonempty(),
  })
  .strict();

type StudyYearParams = z.infer<typeof YearIdParamSchema>;

// =============================================================================
// DEFINITION DES HANDLERS DE ROUTE (CRUD)
// =============================================================================

/**
 * @handler GET /study-years
 * @description Récupère la liste de toutes les années d'étude en appliquant les filtres de requête.
 */
export const getStudyYears = createValidatedHandler(
  createPersistenceHandler<any, unknown, unknown>(({ params }) =>
    SchoolService.getStudyYears(params)
  ),
  {
    schemas: {},
  }
);

/**
 * @handler GET /study-year/:yearId
 * @description Récupère une année d'étude spécifique par son ID.
 */
export const getStudyYear = createValidatedHandler(
  createPersistenceHandler<unknown, unknown, StudyYearParams>(
    ({ params }) => SchoolService.getStudyYearById(params.yearId) as any
  ),
  {
    schemas: {
      params: YearIdParamSchema,
    },
  }
);

/**
 * @handler POST /study-year
 * @description Crée une nouvelle année d'étude.
 */
export const createStudyYear = createValidatedHandler(
  createPersistenceHandler<unknown, TStudyYearCreation>(({ body }) =>
    SchoolService.createStudyYear(body)
  ),
  {
    schemas: {
      body: StudyYearCreationSchema,
    },
  }
);

/**
 * @handler PUT /study-year/:yearId
 * @description Met à jour une année d'étude existante.
 */
export const updateStudyYear = createValidatedHandler(
  createPersistenceHandler<
    unknown,
    Partial<TStudyYearCreation>,
    StudyYearParams
  >(({ params, body }) => SchoolService.updateStudyYear(params.yearId, body)),
  {
    schemas: {
      body: StudyYearCreationSchema,
      params: YearIdParamSchema,
    },
  }
);

/**
 * @handler DELETE /study-year/:yearId
 * @description Supprime une année d'étude par son ID.
 */
export const deleteStudyYear = createValidatedHandler(
  createPersistenceHandler<boolean, unknown, StudyYearParams>(
    ({ params }) => SchoolService.deleteStudyYear(params.yearId) as any
  ),
  {
    schemas: {
      params: YearIdParamSchema,
    },
  }
);
