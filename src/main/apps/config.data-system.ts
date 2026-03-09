/**
 * @file config.data-system.ts
 * @description Centralisation de l'accès aux données via le DataQueryBus.
 * Ce bus sert de médiateur entre les services applicatifs et les Handlers de données Sequelize.
 */

import { DataQueryBus } from "@/packages/data-system";
import { instantiatedHandlers } from "@/packages/@core/data-access/data-system-access";

/**
 * Instance globale du Bus de Données.
 * * @description
 * Cette instance orchestre l'exécution des requêtes en routant chaque demande
 * vers son Handler respectif (ex: ClassroomHandler, UserHandler).
 * Elle permet un couplage faible : les composants appellent le bus sans
 * connaître l'implémentation interne des Handlers.
 * * @example
 * // Utilisation dans un contrôleur ou un service :
 * const result = await dataBus.execute("get-user", {id: 1234});
 */
export const dataBus = new DataQueryBus(instantiatedHandlers);

/**
 * Alias de type pour faciliter l'injection de dépendances ou le typage des services.
 */
export type TDataBus = typeof dataBus;
