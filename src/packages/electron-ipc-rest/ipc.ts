/**
 * @file ipc.ts
 * @description Architecture IPC Client-Serveur haute performance pour Electron.
 * Fournit une couche d'abstraction HTTP-like (REST over IPC) avec support Middleware, Intercepteurs et Typage fort.
 *
 * @author Big Tech Engineering
 * @copyright 2024 Enterprise Corp.
 */

import { BrowserWindow, type IpcMainInvokeEvent } from "electron";
import type { IpcRenderer } from "@electron-toolkit/preload";
import { HttpMethod, HttpStatus } from "./constant";
import {
  formatChannelName,
  createResponse,
  createErrorResponse,
  unwrapResult,
  HttpException,
  type IResponse,
} from "./utils";

// --- CORE INTERFACES ---

/** Interface abstraite pour le Logger (permet d'injecter Winston, Pino, etc.) */
export interface ILogger {
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, error?: unknown): void;
}

/** Structure normalisée d'une requête IPC entrant dans le Main Process. */
export interface IpcRequest<
  TBody = unknown,
  TParams = Record<string, unknown>,
> {
  readonly id: string;
  readonly body: TBody;
  readonly params: TParams;
  readonly headers: Record<string, string>;
  readonly context: {
    readonly sender: Electron.WebContents;
    readonly window: BrowserWindow | null;
  };
}

/** Configuration optionnelle pour le serveur. */
export interface ServerConfig {
  readonly logger?: ILogger;
  readonly browserWindow?: BrowserWindow | null;
}

/** Définition d'un Handler de route. */
export type RequestHandler<TRes, TBody, TParams> = (
  req: IpcRequest<TBody, TParams>
) => Promise<TRes> | TRes;

// --- IPC SERVER (MAIN PROCESS) ---

/**
 * @class IpcServer
 * @description Contrôleur central pour la gestion des messages IPC entrants.
 * Implémente un pattern de routing similaire à Express/NestJS.
 *
 * @example
 * const server = new IpcServer(ipcMain, { logger: console });
 * server.get('/users/:id', async (req) => getUser(req.params.id));
 * const dispose = server.listen();
 */
export class IpcServer {
  private readonly routes = new Map<
    string,
    { method: HttpMethod; handler: RequestHandler<any, any, any> }
  >();
  private isListening = false;
  private readonly logger: ILogger;

  constructor(
    private readonly ipcMain: Electron.IpcMain,
    private readonly config: ServerConfig = {}
  ) {
    this.logger = config.logger ?? {
      info: console.log,
      warn: console.warn,
      error: console.error,
    };
  }

  /** Enregistre une route GET */
  public get<TRes, TParams = Record<string, unknown>>(
    path: string,
    handler: RequestHandler<TRes, undefined, TParams>
  ): this {
    return this.register(path, HttpMethod.GET, handler);
  }

  /** Enregistre une route POST */
  public post<TRes, TBody, TParams = Record<string, unknown>>(
    path: string,
    handler: RequestHandler<TRes, TBody, TParams>
  ): this {
    return this.register(path, HttpMethod.POST, handler);
  }

  /** Enregistre une route PUT */
  public put<TRes, TBody, TParams = Record<string, unknown>>(
    path: string,
    handler: RequestHandler<TRes, TBody, TParams>
  ): this {
    return this.register(path, HttpMethod.PUT, handler);
  }

  /** Enregistre une route PATCH */
  public patch<TRes, TBody, TParams = Record<string, unknown>>(
    path: string,
    handler: RequestHandler<TRes, TBody, TParams>
  ): this {
    return this.register(path, HttpMethod.PATCH, handler);
  }

  /** Enregistre une route DELETE */
  public delete<TRes, TParams = Record<string, unknown>>(
    path: string,
    handler: RequestHandler<TRes, undefined, TParams>
  ): this {
    return this.register(path, HttpMethod.DELETE, handler);
  }

  public register(
    path: string,
    method: HttpMethod,
    handler: RequestHandler<any, any, any>
  ): this {
    const channel = formatChannelName(path, method);
    if (this.routes.has(channel)) {
      this.logger.warn(`[IpcServer] Route override warning: ${method} ${path}`);
    }
    this.routes.set(channel, { method, handler });
    return this;
  }

  /**
   * Active l'écoute des événements IPC.
   * Gère le cycle de vie, le context binding et le global error handling.
   */
  public listen(): () => void {
    if (this.isListening) return () => {};

    const activeChannels: string[] = [];

    this.routes.forEach(({ handler }, channel) => {
      // Wrapper de sécurité pour chaque route
      const safeHandler = async (event: IpcMainInvokeEvent, payload: any) => {
        const req: IpcRequest = {
          id: crypto.randomUUID(),
          body: payload.data,
          params: payload.params ?? {},
          headers: payload.headers ?? {},
          context: {
            sender: event.sender,
            window: null, //BrowserWindow.fromWebContents(event.sender) ?? null,
          },
        };

        try {
          const result = await handler(req);
          return createResponse(result, HttpStatus.OK);
        } catch (error) {
          return this.handleError(req, error);
        }
      };
      console.log(this.ipcMain);
      this.ipcMain?.removeHandler(channel); // Clean slate
      this.ipcMain?.handle(channel, safeHandler);
      activeChannels.push(channel);
    });

    this.isListening = true;
    this.logger.info(
      `[IpcServer] Initialized with ${activeChannels.length} routes.`
    );

    return () => {
      activeChannels.forEach((c) => this.ipcMain.removeHandler(c));
      this.isListening = false;
    };
  }

  private handleError(req: IpcRequest, error: unknown): IResponse<null> {
    if (error instanceof HttpException) {
      this.logger.warn(
        `[IpcServer] HTTP ${error.statusCode} on ${req.id}: ${error.message}`
      );
      return createErrorResponse(
        error.message,
        error.statusCode,
        error.details
      );
    }

    this.logger.error(`[IpcServer] Critical Error on ${req.id}`, error);
    // En production, ne jamais renvoyer la stack trace complète au client
    return createErrorResponse(
      "Internal Server Error",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

// --- IPC CLIENT (RENDERER PROCESS) ---

/** Définition d'un intercepteur. */
export type Interceptor<T> = (value: T) => T | Promise<T>;

export interface InterceptorManager<T> {
  use: (onFulfilled: Interceptor<T>) => void;
  handlers: Interceptor<T>[];
}

/** Options de configuration pour une requête client. */
export interface ClientRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  timeout?: number; // TODO: Implementer le timeout
}

/** Payload interne envoyé sur le pont IPC. */
interface IpcPayload<T> {
  data: T;
  params: Record<string, unknown>;
  headers: Record<string, string>;
  route: string;
  method: HttpMethod;
}

/**
 * @class IpcClient
 * @description Client HTTP-like robuste pour communiquer avec le processus Main.
 * API fluente inspirée d'Axios.
 */
export class IpcClient {
  public interceptors = {
    request: {
      handlers: [] as Interceptor<IpcPayload<any>>[],
      use(fn: Interceptor<IpcPayload<any>>) {
        this.handlers.push(fn);
      },
    },
    response: {
      handlers: [] as Interceptor<IResponse<any>>[],
      use(fn: Interceptor<IResponse<any>>) {
        this.handlers.push(fn);
      },
    },
  };

  constructor(
    private readonly ipcRenderer: IpcRenderer,
    private readonly baseHeaders: Record<string, string> = {}
  ) {}

  public get<T>(url: string, config?: ClientRequestConfig): Promise<T> {
    return this.request<T>(url, HttpMethod.GET, undefined, config);
  }

  public post<T, B = unknown>(
    url: string,
    data?: B,
    config?: ClientRequestConfig
  ): Promise<T> {
    return this.request<T>(url, HttpMethod.POST, data, config);
  }

  public put<T, B = unknown>(
    url: string,
    data?: B,
    config?: ClientRequestConfig
  ): Promise<T> {
    return this.request<T>(url, HttpMethod.PUT, data, config);
  }

  public patch<T, B = unknown>(
    url: string,
    data?: B,
    config?: ClientRequestConfig
  ): Promise<T> {
    return this.request<T>(url, HttpMethod.PATCH, data, config);
  }

  public delete<T>(url: string, config?: ClientRequestConfig): Promise<T> {
    return this.request<T>(url, HttpMethod.DELETE, undefined, config);
  }

  private async request<TRes>(
    route: string,
    method: HttpMethod,
    data: unknown,
    config: ClientRequestConfig = {}
  ): Promise<TRes> {
    let payload: IpcPayload<unknown> = {
      route,
      method,
      data,
      params: config.params ?? {},
      headers: { ...this.baseHeaders, ...config.headers },
    };

    // 1. Pipeline Intercepteurs Requête
    for (const handler of this.interceptors.request.handlers) {
      payload = await handler(payload);
    }

    const channel = formatChannelName(payload.route, payload.method);

    // 2. Appel IPC
    let rawResponse: IResponse<TRes>;
    try {
      rawResponse = await this.ipcRenderer.invoke(channel, payload);
    } catch (err: any) {
      // Fallback si l'IPC lui-même échoue (ex: crash du main process)
      throw new HttpException(
        "IPC Communication Failed",
        HttpStatus.SERVICE_UNAVAILABLE,
        err
      );
    }

    // 3. Pipeline Intercepteurs Réponse
    for (const handler of this.interceptors.response.handlers) {
      rawResponse = await handler(rawResponse);
    }

    return unwrapResult(Promise.resolve(rawResponse));
  }
}
