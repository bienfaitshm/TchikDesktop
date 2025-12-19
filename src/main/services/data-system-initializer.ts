/**
 * @file data-system-initializer.ts
 * @description Module central d'initialisation du Bus de Requêtes (DataQueryBus).
 * Déclare, instancie et injecte tous les Query Handlers disponibles dans le Bus.
 */

import {
  DataQueryBus,
  IQueryBus,
  AbstractDataQueryHandler,
} from "@/packages/data-system";

import { getLogger } from "@/packages/logger";
import {
  instantiateClasses,
  ClassConstructor,
} from "@/packages/@core/utilities/handler-factory";

const initializerLogger = getLogger("DataSystemInitializer");

const HANDLER_CLASSES_REGISTRY: ClassConstructor<AbstractDataQueryHandler>[] =
  [];

export const instantiatedHandlers = instantiateClasses(
  HANDLER_CLASSES_REGISTRY,
  initializerLogger
);
