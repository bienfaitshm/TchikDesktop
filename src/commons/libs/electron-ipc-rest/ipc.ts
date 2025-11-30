/**
 * @file ipc.ts
 * @description Implémentation du Server IPC (Main Process) et du Client IPC (Renderer Process) avec support d'intercepteurs.
 * Fournit une abstraction HTTP-like au-dessus d'Electron IPC.
 */

import { BrowserWindow, ipcMain, type IpcMainInvokeEvent } from "electron";
import type { IpcRenderer } from "@electron-toolkit/preload";

import { HttpMethod, HttpStatus } from "./constant";
import {
  formatChannelName,
  createResponse,
  createErrorResponse,
  unwrapResult,
  HttpException,
  IResponse,
} from "./utils";

/** Payload complet envoyé par le Client au processus Main. */
export interface IpcPayload<TData = unknown> {
  data: TData;
  params: Record<string, unknown>;
  headers: Record<string, unknown>;
  route: string;
  method: HttpMethod;
}

/** La requête reçue par le handler côté Serveur (Main). */
export interface ServerRequest<
  TData = unknown,
  TParams = Record<string, unknown>,
> {
  body: TData;
  params: TParams;
  headers: Record<string, unknown>;
  /** Contexte Electron (fenêtre appelante). */
  context: {
    sender: Electron.WebContents;
    window: BrowserWindow | null;
  };
}

/** Handler de route asynchrone côté Main (Serveur). */
export type RouteHandler<TRes, TData, TParams> = (
  req: ServerRequest<TData, TParams>
) => Promise<TRes> | TRes;

interface RouteDefinition {
  name: string;
  method: HttpMethod;
  handler: RouteHandler<any, any, any>;
}

// --- II. IpcServer (Processus Main) ---

/**
 * @class IpcServer
 * @description Gère l'enregistrement des routes IPC (Handlers) dans le processus Main.
 * Fournit un "Error Boundary" centralisé pour capturer les exceptions des handlers.
 */
export class IpcServer {
  private routes: Map<string, RouteDefinition> = new Map();
  private isListening = false;
  private readonly ipcMainInstance: typeof ipcMain;

  /**
   * @constructor
   * @param customIpcMain Permet d'injecter une instance mockée de ipcMain pour les tests unitaires.
   */
  constructor(customIpcMain?: typeof ipcMain) {
    // Utilise l'instance injectée ou l'instance statique d'Electron par défaut
    this.ipcMainInstance = customIpcMain ?? ipcMain;
  }

  // Méthodes HTTP pour l'enregistrement de routes (get, post, put, delete, patch...)
  public get<TRes, TParams = Record<string, unknown>>(
    route: string,
    handler: RouteHandler<TRes, undefined, TParams>
  ): void {
    this.register(route, HttpMethod.GET, handler);
  }

  public post<TRes, TBody, TParams = Record<string, unknown>>(
    route: string,
    handler: RouteHandler<TRes, TBody, TParams>
  ): void {
    this.register(route, HttpMethod.POST, handler);
  }

  // NOTE: Les méthodes put, delete, patch sont omises ici par souci de concision mais doivent suivre le même pattern.

  private register(
    path: string,
    method: HttpMethod,
    handler: RouteHandler<any, any, any>
  ): void {
    const channel = formatChannelName(path, method);
    this.routes.set(channel, { name: channel, method, handler });
  }

  /**
   * Active tous les écouteurs IPC enregistrés.
   * @returns Une fonction de nettoyage (dispose) pour retirer tous les handlers.
   */
  public listen(): () => void {
    if (this.isListening) {
      console.warn("[IpcServer] Le serveur écoute déjà.");
      return () => {};
    }

    // ** Utilisation de l'instance injectée **
    const listeners: string[] = [];
    this.routes.forEach((route) => {
      this.ipcMainInstance.removeHandler(route.name); // Nettoyage
      this.ipcMainInstance.handle(
        route.name,
        async (event: IpcMainInvokeEvent, payload: IpcPayload) => {
          return this.executeRoute(route, event, payload);
        }
      );
      listeners.push(route.name);
    });

    this.isListening = true;
    console.log(`[IpcServer] ${listeners.length} routes enregistrées. 📡`);
    return () => {
      // ** Utilisation de l'instance injectée pour le nettoyage **
      listeners.forEach((channel) =>
        this.ipcMainInstance.removeHandler(channel)
      );
      this.isListening = false;
    };
  }

  /**
   * Exécute le handler, gère le contexte, l'enveloppe de réponse et le boundary d'erreur.
   */
  private async executeRoute(
    route: RouteDefinition,
    event: IpcMainInvokeEvent,
    payload: IpcPayload
  ): Promise<IResponse<unknown>> {
    try {
      const request: ServerRequest = {
        body: payload.data,
        params: payload.params,
        headers: payload.headers,
        context: {
          sender: event.sender,
          window: BrowserWindow.fromWebContents(event.sender),
        },
      };

      const result = await route.handler(request);
      return createResponse(result, HttpStatus.OK);
    } catch (error: unknown) {
      // Gestion Centralisée des Erreurs
      if (error instanceof HttpException) {
        return createErrorResponse(
          error.message,
          error.statusCode,
          error.details
        );
      }

      console.error(`[IpcServer] Erreur critique sur ${route.name}:`, error);
      const message =
        error instanceof Error ? error.message : "Erreur interne inconnue";
      return createErrorResponse(message, HttpStatus.INTERNAL_SERVER_ERROR, {
        stack: (error as Error).stack,
      });
    }
  }
}

export const server = new IpcServer();

// --- III. IpcClient (Processus Renderer) avec Intercepteurs ---

/** Interface pour les intercepteurs (comme Axios). */
interface Interceptors {
  request: {
    use: (interceptor: RequestInterceptor) => void;
  };
  response: {
    use: (interceptor: ResponseInterceptor) => void;
  };
}

/** Intercepteur de Requête: Modifie le payload AVANT l'envoi IPC. */
type RequestInterceptor = <TData>(
  payload: IpcPayload<TData>
) => IpcPayload<TData> | Promise<IpcPayload<TData>>;

/** Intercepteur de Réponse: Modifie la structure de réponse APRES la réception IPC. */
type ResponseInterceptor = <T>(
  response: IResponse<T>
) => IResponse<T> | Promise<IResponse<T>>;

/** Configuration de requête fournie par l'utilisateur. */
interface RequestConfig {
  params?: Record<string, unknown>;
  headers?: Record<string, unknown>;
}

/**
 * @class IpcClient
 * @description Fournit une interface HTTP-like pour interagir avec le processus Main via `ipcRenderer.invoke`.
 * Supporte le chaînage d'intercepteurs pour l'authentification et la gestion globale des erreurs.
 */
export class IpcClient {
  private ipcRenderer: IpcRenderer | null = null;
  private defaultHeaders: Record<string, unknown> = {};

  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  public interceptors: Interceptors | undefined;

  constructor(ipcRenderer?: IpcRenderer) {
    this.ipcRenderer = ipcRenderer || null;
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.interceptors = {
      request: {
        use: (interceptor: RequestInterceptor) =>
          this.requestInterceptors.push(interceptor),
      },
      response: {
        use: (interceptor: ResponseInterceptor) =>
          this.responseInterceptors.push(interceptor),
      },
    };
  }

  /** Met à jour les en-têtes par défaut pour toutes les futures requêtes. */
  public create({ headers }: { headers?: Record<string, unknown> }): IpcClient {
    this.defaultHeaders = headers || {};
    return this;
  }

  // --- Méthodes de Requête Publiques ---

  /** Exécute une requête GET. Retourne les données (TData) ou lève une HttpException. */
  public get<TData = unknown>(
    route: string,
    config: RequestConfig = {}
  ): Promise<TData> {
    return this.request<TData>(route, HttpMethod.GET, undefined, config);
  }

  /** Exécute une requête POST. Retourne les données (TData) ou lève une HttpException. */
  public post<TData = unknown, TBody = unknown>(
    route: string,
    data: TBody,
    config: RequestConfig = {}
  ): Promise<TData> {
    return this.request<TData, TBody>(route, HttpMethod.POST, data, config);
  }

  // NOTE: Les méthodes put, delete, patch sont omises ici par souci de concision mais suivent le même pattern.

  /**
   * Logique centrale d'envoi et de réception de la requête IPC.
   * Gère le chaînage des intercepteurs.
   */
  private async request<TData, TBody = unknown>(
    route: string,
    method: HttpMethod,
    data: TBody | undefined,
    config: RequestConfig
  ): Promise<TData> {
    if (!this.ipcRenderer) {
      throw new HttpException(
        "IPC Renderer non disponible.",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    // 1. Construction du Payload initial
    let payload: IpcPayload<TBody> = {
      route,
      method,
      data: data as TBody,
      params: config.params || {},
      headers: { ...this.defaultHeaders, ...config.headers },
    };

    // 2. Exécution des Intercepteurs de Requête (chaînage)
    for (const interceptor of this.requestInterceptors) {
      payload = await interceptor(payload as any);
    }

    const channel = formatChannelName(payload.route, payload.method);

    // 3. Appel IPC
    let response: IResponse<TData> = await this.ipcRenderer.invoke(
      channel,
      payload
    );

    // 4. Exécution des Intercepteurs de Réponse (chaînage)
    for (const interceptor of this.responseInterceptors) {
      response = await interceptor(response as any);
    }

    // 5. Unwrapper final: gère la structure IResponse et throw si erreur.
    return unwrapResult(Promise.resolve(response));
  }
}

// Export d'une instance singleton (à initialiser dans le fichier preload.ts ou le renderer).
// export const client = new IpcClient(globalThis.ipcRenderer as unknown as IpcRenderer);
