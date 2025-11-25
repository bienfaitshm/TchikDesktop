import { AppDataSystem } from "./data-system";
import * as classooms from "./handlers/classroom.handlers";
import { BaseQueryHandler } from "./handlers/handler";

/**
 * 🛠️ Type d'un Constructeur de Query Handler.
 * Définit une classe qui peut être instanciée pour produire un BaseQueryHandler.
 */
type HandlerConstructor = new (...args: any[]) => BaseQueryHandler<any, any>;

/**
 * 🏭 Fonction Wrapper pour instancier les classes de Handlers.
 * Prend un tableau de constructeurs de classes de Handlers et retourne
 * un tableau d'instances de ces Handlers.
 * * @param handlerClasses Le tableau des classes (constructeurs) de BaseQueryHandler.
 * @returns Un tableau d'instances BaseQueryHandler.
 */
function registerHandlers(
  handlerClasses: HandlerConstructor[]
): BaseQueryHandler[] {
  return handlerClasses.map((HandlerClass) => new HandlerClass());
}

/**
 * 📦 Liste déclarative des classes de Data Handlers enregistrés.
 * C'est le manifeste qui référence les classes, et non les objets instanciés.
 */
const HANDLERS_CLASSES_MANIFEST: HandlerConstructor[] = [
  classooms.ClassroomEnrollmentQueryHandler,
];

// ------------------------------------------------------------------

// 1. Instanciation des Handlers à partir des classes.
const HANDLERS_INSTANCES_MANIFEST = registerHandlers(HANDLERS_CLASSES_MANIFEST);

// 2. Initialisation du système de données avec les instances créées.
export const appDataSystem = new AppDataSystem(HANDLERS_INSTANCES_MANIFEST);
