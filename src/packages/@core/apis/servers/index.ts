import { getLogger } from "@/packages/logger";
import {
  instantiateClasses,
  ClassConstructor,
} from "@/packages/@core/utilities/handler-factory";
import { AbstractEndpoint } from "./abstract";

import * as schools from "./schools";

const initializerLogger = getLogger("IPC Server");
const HANDLER_CLASSES_REGISTRY: ClassConstructor<AbstractEndpoint<any>>[] = [
  // schools
  schools.GetSchools,
  schools.PostSchools,
  schools.GetSchool,
  schools.UpdateSchool,
  schools.DeleteSchool,
];

export const instantiatedHandlers = instantiateClasses(
  HANDLER_CLASSES_REGISTRY,
  initializerLogger
);
