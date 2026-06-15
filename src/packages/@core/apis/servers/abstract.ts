import {
  RequestHandler,
  ValidationSchemas,
  createValidatedHandler,
  IpcRequest,
  HttpMethod,
} from "@/packages/electron-ipc-rest";
import { InferBody, InferParams } from "./validated-handler";

/**
 * Définit la structure de sortie d'un endpoint prêt à être enregistré par le routeur.
 */
export interface EndpointDefinition {
  method: HttpMethod;
  route: string;
  handler: RequestHandler<any, any, any>;
}

/**
 * Classe abstraite de base pour tous les endpoints IPC.
 * Applique le pattern "Template Method" pour standardiser la validation et l'exécution.
 *
 * @template S La structure des schémas de validation (Body, Params, Headers).
 */
export abstract class AbstractEndpoint<S extends ValidationSchemas> {
  /**
   * La route IPC sur laquelle cet endpoint écoute.
   */
  public abstract readonly route: string;

  /**
   * La méthode HTTP/IPC (GET, POST, etc.) sur laquelle cet endpoint écoute.
   */
  public abstract readonly method: HttpMethod;

  /**
   * Les schémas de validation (Zod ou autre) pour le Body, Params, etc.
   */
  public abstract readonly schemas: S;

  /**
   * Message d'erreur personnalisé en cas d'échec de validation.
   */
  public readonly validationErrorMessage?: string = undefined;

  /**
   * Logique métier de l'endpoint.
   * Cette méthode doit être implémentée par les sous-classes.
   * Elle reçoit des données déjà validées et typées à l'exécution.
   */
  protected abstract handle(
    req: IpcRequest<InferBody<S>, InferParams<S>>,
  ): Promise<unknown>;

  /**
   * Construit et retourne la définition complète de l'endpoint.
   * Enveloppe la méthode `handle` avec le middleware de validation.
   */
  public build(): EndpointDefinition {
    const boundHandler = (req: IpcRequest<InferBody<S>, InferParams<S>>) => {
      return this.handle(req);
    };

    return {
      route: this.route,
      method: this.method,
      handler: createValidatedHandler(
        {
          schemas: this.schemas,
          errorMessage: this.validationErrorMessage,
        },
        boundHandler as RequestHandler<any, any, any>,
      ),
    };
  }
}
