import {
  RequestHandler,
  ValidationSchemas,
  IpcRequest,
  HttpMethod,
} from "@/packages/electron-ipc-rest";
import {
  InferBody,
  InferParams,
  createValidatedHandler,
} from "./validated-handler";

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
   * @readonly
   */
  public abstract readonly route: string;

  /**
   * La method IPC sur laquelle cet endpoint écoute.
   * @readonly
   */

  public abstract readonly method: HttpMethod;

  /**
   * Les schémas Zod pour valider les entrées.
   * @protected
   */
  public abstract readonly schemas: S;

  /**
   * Message d'erreur personnalisé en cas d'échec de validation.
   * @protected
   */
  public abstract readonly validationErrorMessage?: string;

  /**
   * Logique métier de l'endpoint.
   * Cette méthode doit être implémentée par les sous-classes.
   * Elle reçoit des données déjà validées et typées.
   *
   * @param req La requête IPC contenant body et params typés.
   * @returns Une promesse résolue avec la réponse à renvoyer au client.
   */
  protected abstract handle(
    req: IpcRequest<InferBody<S>, InferParams<S>>
  ): Promise<unknown>;

  /**
   * Construit et retourne la définition complète de l'endpoint.
   * Enveloppe la méthode `handle` avec le middleware de validation.
   *
   * @returns {EndpointDefinition} L'objet contenant la route et le handler sécurisé.
   */
  public build(): EndpointDefinition {
    // Utilisation de .bind(this) ou d'une fléchée pour conserver le contexte 'this'
    // lors de l'exécution dans le middleware.
    const boundHandler = (req: IpcRequest<any, any>) => this.handle(req);

    return {
      route: this.route,
      method: this.method,
      handler: createValidatedHandler(
        {
          schemas: this.schemas,
          errorMessage: this.validationErrorMessage,
        },
        boundHandler
      ),
    };
  }
}
