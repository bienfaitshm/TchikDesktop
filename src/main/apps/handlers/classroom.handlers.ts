import z from "zod";

import * as queries from "@/main/db/services/classroom";
import { createRouteHandler } from "@/commons/libs/electron-ipc-rest";
import { createPersistenceHandler } from "./handlers";

const schemas = z.object({});

export const getClassrooms = createRouteHandler(
  createPersistenceHandler(({ params }) => queries.getClassrooms(params)),
  {}
);

export const getClassroom = createRouteHandler(
  createPersistenceHandler(({ params }) => queries.getClassroom(params)),
  { params: schemas }
);

export const createClassroom = createRouteHandler(
  createPersistenceHandler(({ body }) => queries.createClassroom(body)),
  { params: schemas }
);

export const updateClassroom = createRouteHandler(
  createPersistenceHandler(({ body, params }) =>
    queries.updateClassroom(params.classId, body)
  ),
  { params: schemas }
);

export const deleteClassroom = createRouteHandler(
  createPersistenceHandler(({ params }) =>
    queries.deleteClassroom(params.classId)
  ),
  { params: schemas }
);
