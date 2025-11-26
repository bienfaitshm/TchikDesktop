/**
 * @file data-system-initializer.ts
 * @description Module central d'initialisation du Bus de Requêtes (DataQueryBus).
 * Déclare, instancie et injecte tous les Query Handlers disponibles dans le Bus.
 */

import { DataQueryBus, IQueryBus } from "./query-bus.service";
import * as classooms from "./handlers/classroom.query-handler.ts";
import { AbstractDataQueryHandler } from "./handlers/data-query-handler";
import { getLogger } from "@/main/libs/logger";

const initializerLogger = getLogger("DataSystemInitializer");

// ==========================================
// 1. Définition des Types Sécures
// ==========================================

/**
 * 🛠️ Type d'un Constructeur de Query Handler.
 * Définit une classe qui peut être instanciée sans argument dans ce contexte précis.
 * Assure que le constructeur retourne bien une instance de AbstractDataQueryHandler.
 */
type QueryHandlerConstructor = new (
  ...args: never[]
) => AbstractDataQueryHandler<any, any>;

// ==========================================
// 2. Registre des Classes
// ==========================================

/**
 * 📦 Le Registre (ou Manifeste) des classes de Query Handlers.
 * Toute nouvelle requête doit être ajoutée ici.
 */
const QUERY_HANDLER_CLASSES_REGISTRY: QueryHandlerConstructor[] = [
  classooms.ClassroomEnrollmentQueryHandler,
];

// ==========================================
// 3. Fonction d'Instanciation Sécurisée
// ==========================================

/**
 * 🏭 Factory Function pour l'instanciation.
 * Prend un tableau de constructeurs et retourne un tableau d'instances.
 * @param handlerClasses Le tableau des classes de Query Handlers.
 * @returns Un tableau d'instances AbstractDataQueryHandler.
 */
function instantiateHandlers(
  handlerClasses: QueryHandlerConstructor[]
): AbstractDataQueryHandler<any, any>[] {
  initializerLogger.info(
    `Attempting to instantiate ${handlerClasses.length} query handler(s).`
  );

  // Utilisation de .map pour créer les instances
  const instances = handlerClasses.map((HandlerClass) => new HandlerClass());

  initializerLogger.info(
    `Successfully instantiated ${instances.length} handler(s).`
  );
  return instances;
}

// ==========================================
// 4. Exécution de l'Initialisation et Export
// ==========================================

// 1. Création des instances à partir du registre
const instantiatedHandlers = instantiateHandlers(
  QUERY_HANDLER_CLASSES_REGISTRY
);

// 2. Initialisation du Bus de Requêtes avec les instances créées.
// Le Bus est exporté pour être utilisé comme source de données dans toute l'application.
export const appQueryBus: IQueryBus = new DataQueryBus(instantiatedHandlers);
