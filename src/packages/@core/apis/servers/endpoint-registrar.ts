import { IpcServer } from "@/packages/electron-ipc-rest";
import { getLogger } from "@/packages/logger";
import { AbstractEndpoint } from "./abstract";

/**
 * @file endpoint-registrar.ts
 * @description Classe utilitaire responsable de l'enregistrement des handlers d'endpoints validés
 * auprès du serveur IPC (Inter-Process Communication).
 *
 * Cette classe implémente le pattern "Registrar" pour centraliser l'initialisation des routes.
 */

export class EndpointRegistrar {
  /**
   * L'instance du serveur IPC (le routeur central) qui enregistre les handlers.
   * @private
   * @readonly
   */
  private readonly ipcServer: IpcServer;

  /**
   * Le tableau des instances d'AbstractEndpoint à enregistrer.
   * Chaque AbstractEndpoint contient la logique métier, la validation et la route.
   * @private
   * @readonly
   */
  private readonly endpoints: AbstractEndpoint<any>[];

  private logger = getLogger("IPC Registrar");

  /**
   * Construit une nouvelle instance d'EndpointRegistrar.
   *
   * @param ipcServer L'objet IpcServer fourni par la librairie `electron-ipc-rest`.
   * @param endpoints Un tableau d'instances de classes descendantes de `AbstractEndpoint`.
   */
  constructor(ipcServer: IpcServer, endpoints: AbstractEndpoint<any>[]) {
    this.ipcServer = ipcServer;
    this.endpoints = endpoints;
  }

  /**
   * Enregistre chaque endpoint auprès du serveur IPC en utilisant sa méthode (GET/POST/etc.),
   * sa route et son handler sécurisé généré par le middleware de validation.
   *
   * @returns {void}
   * @public
   */
  public registerEndpoints(): void {
    if (this.endpoints.length === 0) {
      this.logger.warn("No endpoints provided for registration.");
      return;
    }

    this.endpoints.forEach((endpointInstance) => {
      const definition = endpointInstance.build();
      this.ipcServer.register(
        definition.route,
        definition.method,
        definition.handler
      );
      this.logger.info(
        `Route registered: [${definition.method}] ${definition.route}`
      );
    });
  }
}
