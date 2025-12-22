import { CustomLogger } from "@/packages/logger";

/**
 * @description Fonctions utilitaires pour instancier dynamiquement des classes de handlers ou de services.
 * Ces fonctions facilitent l'enregistrement et l'initialisation des dépendances sans utiliser
 * un conteneur d'injection de dépendances (DI) complet.
 */

/**
 * Type représentant le constructeur d'une classe abstraite ou concrète.
 * Il garantit que le type passé est une fonction constructeur qui retourne l'instance
 * de la classe spécifiée (`TAbstractClass`).
 *
 * @template TAbstractClass La classe abstraite ou l'interface de base pour les handlers.
 */
export type ClassConstructor<TAbstractClass> = new (
  ...args: never[]
) => TAbstractClass;

/**
 * @function instantiateClasses
 * @description Initialise une liste de classes de handlers (ou de services) sans arguments
 * dans leur constructeur, en utilisant la réflexion des types.
 *
 * Cette approche est idéale pour l'enregistrement au démarrage (bootstrapping) de l'application.
 *
 * @template TAbstractClass Le type de base que toutes les classes instanciées doivent respecter
 * (ex: AbstractEndpoint, CommandHandler).
 *
 * @param classConstructors Un tableau des constructeurs de classe à instancier.
 * @param logger L'instance de logger optionnelle pour tracer le processus d'instanciation.
 *
 * @returns {TAbstractClass[]} Un tableau des instances de classes prêtes à être utilisées.
 */
export function instantiateClasses<TAbstractClass>(
  classConstructors: ClassConstructor<TAbstractClass>[],
  logger?: CustomLogger
): TAbstractClass[] {
  const handlerCount = classConstructors.length;

  logger?.info(
    `[ServiceFactory] Attempting to instantiate ${handlerCount} service class(es).`
  );

  try {
    // Utilisation de .map pour créer les instances de manière fonctionnelle
    const instances = classConstructors.map((HandlerClass) => {
      // Le constructeur est appelé sans arguments, basé sur le type ClassConstructor
      return new HandlerClass();
    });

    logger?.info(
      `[ServiceFactory] Successfully instantiated ${instances.length} service class(es).`
    );

    return instances;
  } catch (error) {
    // Gestion et re-lancement d'une erreur claire en cas de problème d'instanciation
    logger?.error(
      `[ServiceFactory] Failed to instantiate service classes: ${error}`
    );
    throw new Error(
      `Factory initialization failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
