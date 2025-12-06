import { z } from "zod";
import * as queries from "@/main/db/services/classroom";
import { createValidatedHandler } from "@/commons/libs/electron-ipc-rest";
import {
  ClassRoomFilterSchema,
  ClassroomCreationSchema,
} from "@/commons/schemas/models";
import type {
  TClassRoomFilter,
  TClassroomCreation,
} from "@/commons/schemas/type";
import { createPersistenceHandler } from "./handlers";

/** Schéma pour valider un ID unique dans le chemin de l'URL */
export const IdParamSchema = z
  .object({
    classId: z.string().nonempty(),
  })
  .strict();

const UpdateClassroomSchema = ClassroomCreationSchema.partial();

// =============================================================================
//  DEFINITION DES HANDLERS DE ROUTE
// =============================================================================

/**
 * @handler GET /classes
 * @description Récupère la liste des classes en appliquant les filtres de requête.
 */
export const getClassrooms = createValidatedHandler(
  createPersistenceHandler<any, unknown, TClassRoomFilter>(
    ({ params }) => queries.getClassrooms(params) as any
  ),
  {
    schemas: {
      params: ClassRoomFilterSchema,
    },
  }
);

/**
 * @handler GET /classes/:classId
 * @description Récupère une salle de classe spécifique par son ID.
 */
export const getClassroom = createValidatedHandler(
  createPersistenceHandler<
    unknown,
    Partial<TClassroomCreation>,
    z.infer<typeof IdParamSchema>
  >(({ params }) => queries.getClassroom(params.classId) as any),
  {
    schemas: {
      params: IdParamSchema,
    },
  }
);

/**
 * @handler POST /classes
 * @description Crée une nouvelle salle de classe.
 */
export const createClassroom = createValidatedHandler(
  createPersistenceHandler<unknown, TClassroomCreation>(({ body }) =>
    queries.createClassroom(body)
  ),
  {
    schemas: {
      body: ClassroomCreationSchema,
    },
  }
);

/**
 * @handler PUT /classes/:classId
 * @description Met à jour une salle de classe existante.
 */
export const updateClassroom = createValidatedHandler(
  createPersistenceHandler<
    unknown,
    Partial<TClassroomCreation>,
    z.infer<typeof IdParamSchema>
  >(({ params, body }) => queries.updateClassroom(params.classId, body)),
  {
    schemas: {
      body: UpdateClassroomSchema,
      params: IdParamSchema,
    },
  }
);

/**
 * @handler DELETE /classes/:classId
 * @description Supprime une salle de classe par son ID.
 */
export const deleteClassroom = createValidatedHandler(
  createPersistenceHandler<boolean, unknown, z.infer<typeof IdParamSchema>>(
    ({ params }) => queries.deleteClassroom(params.classId) as any
  ),
  {
    schemas: {
      params: IdParamSchema,
    },
  }
);
