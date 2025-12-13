import { z } from "zod";
import { SchoolService } from "@/main/db/services/school.service";
import { createValidatedHandler } from "@/commons/libs/electron-ipc-rest";
import { SchoolCreationSchema } from "@/commons/schemas/models";

import type { TSchoolCreation } from "@/commons/schemas/type";
import { createPersistenceHandler } from "./handlers";

/** Schéma pour valider un ID unique dans le chemin de l'URL */
export const IdParamSchema = z
  .object({
    schoolId: z.string().nonempty(),
  })
  .strict();

// =============================================================================
//  DEFINITION DES HANDLERS DE ROUTE
// =============================================================================

/**
 * @handler GET /schools
 * @description Récupère la liste des schools en appliquant les filtres de requête.
 */
export const getSchools = createValidatedHandler(
  createPersistenceHandler<any, unknown, unknown>(({ params }) =>
    SchoolService.getSchools(params)
  ),
  {
    schemas: {},
  }
);

/**
 * @handler GET /school/:schoolId
 * @description Récupère une salle de classe spécifique par son ID.
 */
export const getSchool = createValidatedHandler(
  createPersistenceHandler<unknown, unknown, z.infer<typeof IdParamSchema>>(
    ({ params }) => SchoolService.getSchoolById(params.schoolId) as any
  ),
  {
    schemas: {
      params: IdParamSchema,
    },
  }
);

/**
 * @handler POST /school
 * @description Crée une nouvelle salle de classe.
 */
export const createSchool = createValidatedHandler(
  createPersistenceHandler<unknown, TSchoolCreation>(({ body }) =>
    SchoolService.createSchool(body)
  ),
  {
    schemas: {
      body: SchoolCreationSchema,
    },
  }
);

/**
 * @handler PUT /school/:schoolId
 * @description Met à jour une salle de classe existante.
 */
export const updateSchool = createValidatedHandler(
  createPersistenceHandler<
    unknown,
    Partial<TSchoolCreation>,
    z.infer<typeof IdParamSchema>
  >(({ params, body }) => SchoolService.updateSchool(params.schoolId, body)),
  {
    schemas: {
      body: SchoolCreationSchema.partial(),
      params: IdParamSchema,
    },
  }
);

/**
 * @handler DELETE /school/:schoolId
 * @description Supprime une salle de classe par son ID.
 */
export const deleteSchool = createValidatedHandler(
  createPersistenceHandler<boolean, unknown, z.infer<typeof IdParamSchema>>(
    ({ params }) => SchoolService.deleteSchool(params.schoolId) as any
  ),
  {
    schemas: {
      params: IdParamSchema,
    },
  }
);
