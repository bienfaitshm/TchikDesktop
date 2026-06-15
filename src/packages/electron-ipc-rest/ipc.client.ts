import type { BrowserWindow } from "electron";
import type { IpcRenderer } from "@electron-toolkit/preload";
import { HttpMethod, HttpStatus } from "./constant";
import { unwrapResult, HttpException, type IResponse } from "./utils";

export interface ILogger {
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, error?: unknown): void;
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

// Handler mis à jour avec le type Headers instanciable
export type RequestHandler<
  TRes,
  TBody,
  TParams,
  THeaders = Record<string, string>,
> = (req: IpcRequest<TBody, TParams, THeaders>) => Promise<TRes> | TRes;

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

export class IpcClient {
  // Ajout d'un système d'éjection pour éviter les fuites de mémoire
  private requestHandlers: Interceptor<IpcPayload<any>>[] = [];
  private responseHandlers: Interceptor<IResponse<any>>[] = [];

  public interceptors = {
    request: {
      use: (fn: Interceptor<IpcPayload<any>>) => {
        this.requestHandlers.push(fn);
        return () => {
          this.requestHandlers = this.requestHandlers.filter((h) => h !== fn);
        };
      },
    },
    response: {
      use: (fn: Interceptor<IResponse<any>>) => {
        this.responseHandlers.push(fn);
        return () => {
          this.responseHandlers = this.responseHandlers.filter((h) => h !== fn);
        };
      },
    },
  };

  constructor(
    private readonly ipcRenderer: IpcRenderer,
    private readonly baseHeaders: Record<string, string> = {},
  ) {}

  public get<T>(url: string, config?: ClientRequestConfig): Promise<T> {
    return this.request<T>(url, HttpMethod.GET, undefined, config);
  }

  public post<T, B = unknown>(
    url: string,
    data?: B,
    config?: ClientRequestConfig,
  ): Promise<T> {
    return this.request<T>(url, HttpMethod.POST, data, config);
  }

  public put<T, B = unknown>(
    url: string,
    data?: B,
    config?: ClientRequestConfig,
  ): Promise<T> {
    return this.request<T>(url, HttpMethod.PUT, data, config);
  }

  public patch<T, B = unknown>(
    url: string,
    data?: B,
    config?: ClientRequestConfig,
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
    config: ClientRequestConfig = {},
  ): Promise<TRes> {
    let payload: IpcPayload<unknown> = {
      route,
      method,
      data,
      params: config.params ?? {},
      headers: { ...this.baseHeaders, ...config.headers },
    };

    // 1. Pipeline Intercepteurs Requête
    for (const handler of this.requestHandlers) {
      payload = await handler(payload);
    }

    // 2. Appel via le canal unique Gateway
    let rawResponse: IResponse<TRes>;
    try {
      rawResponse = await this.ipcRenderer.invoke("IPC_HTTP_GATEWAY", payload);
    } catch (err: any) {
      throw new HttpException(
        "IPC Communication Failed",
        HttpStatus.SERVICE_UNAVAILABLE,
        err,
      );
    }

    // 3. Pipeline Intercepteurs Réponse
    for (const handler of this.responseHandlers) {
      rawResponse = await handler(rawResponse);
    }

    return unwrapResult(Promise.resolve(rawResponse));
  }
}
