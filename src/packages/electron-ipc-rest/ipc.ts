import { BrowserWindow, type IpcMainInvokeEvent } from "electron";
import { HttpMethod, HttpStatus } from "./constant";
import {
  createResponse,
  createErrorResponse,
  HttpException,
  type IResponse,
} from "./utils";

export interface ILogger {
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, error?: unknown): void;
}

export type Interceptor<T> = (value: T) => T | Promise<T>;

export interface ClientRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  timeout?: number;
}

interface IpcPayload<T> {
  data: T;
  params: Record<string, unknown>;
  headers: Record<string, string>;
  route: string;
  method: HttpMethod;
}

export interface IpcRequest<
  TBody = unknown,
  TParams = Record<string, unknown>,
  THeaders = Record<string, string>,
> {
  readonly id: string;
  readonly body: TBody;
  readonly params: TParams;
  readonly headers: THeaders;
  readonly context: {
    readonly sender: Electron.WebContents;
    readonly window: BrowserWindow | null;
  };
}

export interface ServerConfig {
  readonly logger?: ILogger;
}

export type RequestHandler<
  TRes,
  TBody,
  TParams,
  THeaders = Record<string, string>,
> = (req: IpcRequest<TBody, TParams, THeaders>) => Promise<TRes> | TRes;

interface RouteDefinition {
  method: HttpMethod;
  handler: RequestHandler<any, any, any, any>;
}

export class IpcServer {
  private readonly routes = new Map<string, RouteDefinition>();
  private isListening = false;
  private readonly logger: ILogger;
  private readonly GATEWAY_CHANNEL = "IPC_HTTP_GATEWAY";

  constructor(
    private readonly ipcMain: Electron.IpcMain,
    private readonly config: ServerConfig = {},
  ) {
    this.logger = this.config.logger ?? {
      info: console.log,
      warn: console.warn,
      error: console.error,
    };
  }

  public get<
    TRes,
    TParams = Record<string, unknown>,
    THeaders = Record<string, string>,
  >(
    path: string,
    handler: RequestHandler<TRes, undefined, TParams, THeaders>,
  ): this {
    return this.register(path, HttpMethod.GET, handler);
  }

  public post<
    TRes,
    TBody,
    TParams = Record<string, unknown>,
    THeaders = Record<string, string>,
  >(
    path: string,
    handler: RequestHandler<TRes, TBody, TParams, THeaders>,
  ): this {
    return this.register(path, HttpMethod.POST, handler);
  }

  public put<
    TRes,
    TBody,
    TParams = Record<string, unknown>,
    THeaders = Record<string, string>,
  >(
    path: string,
    handler: RequestHandler<TRes, TBody, TParams, THeaders>,
  ): this {
    return this.register(path, HttpMethod.PUT, handler);
  }

  public patch<
    TRes,
    TBody,
    TParams = Record<string, unknown>,
    THeaders = Record<string, string>,
  >(
    path: string,
    handler: RequestHandler<TRes, TBody, TParams, THeaders>,
  ): this {
    return this.register(path, HttpMethod.PATCH, handler);
  }

  public delete<
    TRes,
    TParams = Record<string, unknown>,
    THeaders = Record<string, string>,
  >(
    path: string,
    handler: RequestHandler<TRes, undefined, TParams, THeaders>,
  ): this {
    return this.register(path, HttpMethod.DELETE, handler);
  }

  public register(
    path: string,
    method: HttpMethod,
    handler: RequestHandler<any, any, any, any>,
  ): this {
    const routeKey = `${method}:${path}`;
    if (this.routes.has(routeKey)) {
      this.logger.warn(`[IpcServer] Route override warning: ${routeKey}`);
    }
    this.routes.set(routeKey, { method, handler });
    return this;
  }

  /**
   * Un seul handler IPC global (Gateway) qui distribue les requêtes aux bons sous-handlers.
   * Résout nativement le problème des routes statiques/dynamiques définies côté client.
   */
  public listen(): () => void {
    if (this.isListening) return () => {};

    const gatewayHandler = async (
      event: IpcMainInvokeEvent,
      payload: IpcPayload<any>,
    ) => {
      const routeKey = `${payload.method}:${payload.route}`;
      const route = this.routes.get(routeKey);

      if (!route) {
        return createErrorResponse(
          `Route ${routeKey} Not Found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const req: IpcRequest = {
        id: crypto.randomUUID(),
        body: payload.data ?? {},
        params: payload.params ?? {},
        headers: payload.headers ?? {},
        context: {
          sender: event.sender,
          window: BrowserWindow.fromWebContents(event.sender),
        },
      };

      try {
        const result = await route.handler(req);
        return createResponse(result, HttpStatus.OK);
      } catch (error) {
        return this.handleError(req, error as Error);
      }
    };

    this.ipcMain.handle(this.GATEWAY_CHANNEL, gatewayHandler);
    this.isListening = true;
    this.logger.info(
      `[IpcServer] Gateway listening with ${this.routes.size} routes.`,
    );

    return () => {
      this.ipcMain.removeHandler(this.GATEWAY_CHANNEL);
      this.isListening = false;
    };
  }

  private handleError(
    req: IpcRequest<any, any, any>,
    error: Error,
  ): IResponse<null> {
    if (error instanceof HttpException) {
      this.logger.warn(
        `[IpcServer] HTTP ${error.statusCode} on ${req.id}: ${error.message}`,
        { error },
      );
      return createErrorResponse(
        error.message,
        error.statusCode,
        error.details,
      );
    }

    this.logger.error(
      `[IpcServer] Critical Error on ${req.id}: ${error?.message}`,
      error,
    );
    return createErrorResponse(
      "Internal Server Error",
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
