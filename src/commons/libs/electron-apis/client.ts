/**
 * Electron IPC Client for communicating with the main process.
 * Provides methods for making HTTP-like requests (GET, POST, PUT, DELETE, PATCH) via Electron's IPC.
 *
 * @example
 * ```typescript
 * import client from './client';
 *
 * // Example: GET request
 * const response = await client.get('/example-route', {
 *   params: { id: 123 },
 *   headers: { Authorization: 'Bearer token' }
 * });
 *
 * // Example: POST request
 * const postResponse = await client.post('/example-route', { name: 'John Doe' }, {
 *   headers: { 'Content-Type': 'application/json' }
 * });
 * ```
 */

import { formatRouteMethodName, actionFn, TResponse } from "./utils";
import { Methods } from "./constant";
import type { IpcRenderer } from "@electron-toolkit/preload";

type TCreateClientParams = {
  ipcRender?: IpcRenderer;
  headers?: Record<string, unknown>;
};

type TServerRequest<
  TParams extends {} = Record<string, unknown>,
  TData = unknown,
> = {
  headers: object;
  data: TData;
  params: TParams;
};

type TConfig = {
  params?: Record<string, unknown>;
  headers?: Record<string, unknown>;
};

interface IClient {
  create(params: TCreateClientParams): IClient;
  get<Data = unknown>(
    route: string,
    config?: TConfig,
  ): Promise<TResponse<Data>>;
  delete<Data = unknown>(
    route: string,
    config?: TConfig,
  ): Promise<TResponse<Data>>;
  post<Data = unknown, TData = unknown>(
    route: string,
    data: TData,
    config?: TConfig,
  ): Promise<TResponse<Data>>;
  put<Data = unknown, TData = unknown>(
    route: string,
    data: TData,
    config?: TConfig,
  ): Promise<TResponse<Data>>;
  patch<Data = unknown, TData = unknown>(
    route: string,
    data: TData,
    config?: TConfig,
  ): Promise<TResponse<Data>>;
}

export class Client implements IClient {
  private ipcRender: IpcRenderer | null = null;
  private headers: Record<string, unknown> = {};

  /**
   * Initializes the Client instance with the provided IpcRenderer.
   * @param ipcRender - The Electron IpcRenderer instance.
   */
  constructor(ipcRender?: IpcRenderer) {
    this.ipcRender = ipcRender || null;
  }

  /**
   * Updates the client configuration.
   * @param params - Configuration parameters including headers and a custom IpcRenderer.
   */
  create({ headers, ipcRender }: TCreateClientParams) {
    if (ipcRender) {
      this.ipcRender = ipcRender;
    }
    this.headers = headers || {};
    return this;
  }

  /**
   * Sends a GET request to the specified route.
   * @param route - The route to send the request to.
   * @param config - Optional configuration for headers and query parameters.
   * @returns A promise resolving to the response.
   */
  get<Data = unknown>(
    route: string,
    config?: TConfig,
  ): Promise<TResponse<Data>> {
    if (!this.ipcRender) {
      throw new Error("IPC Renderer is not initialized.");
    }
    return actionFn<Data>(
      this.ipcRender?.invoke(
        formatRouteMethodName(route, Methods.GET),
        this.getRequest({ config }),
      ),
    );
  }

  /**
   * Sends a DELETE request to the specified route.
   * @param route - The route to send the request to.
   * @param config - Optional configuration for headers and query parameters.
   * @returns A promise resolving to the response.
   */
  delete<Data = unknown>(
    route: string,
    config?: TConfig,
  ): Promise<TResponse<Data>> {
    if (!this.ipcRender) {
      throw new Error("IPC Renderer is not initialized.");
    }
    return actionFn<Data>(
      this.ipcRender?.invoke(
        formatRouteMethodName(route, Methods.DELETE),
        this.getRequest({ config }),
      ),
    );
  }

  /**
   * Sends a POST request to the specified route.
   * @param route - The route to send the request to.
   * @param data - The data to send in the request body.
   * @param config - Optional configuration for headers and query parameters.
   * @returns A promise resolving to the response.
   */
  post<Data = unknown, TData = unknown>(
    route: string,
    data: TData,
    config?: TConfig,
  ): Promise<TResponse<Data>> {
    if (!this.ipcRender) {
      throw new Error("IPC Renderer is not initialized.");
    }
    return actionFn(
      this.ipcRender?.invoke(
        formatRouteMethodName(route, Methods.POST),
        this.getRequest({ config, data }),
      ),
    );
  }

  /**
   * Sends a PUT request to the specified route.
   * @param route - The route to send the request to.
   * @param data - The data to send in the request body.
   * @param config - Optional configuration for headers and query parameters.
   * @returns A promise resolving to the response.
   */
  put<Data = unknown, TData = unknown>(
    route: string,
    data: TData,
    config?: TConfig,
  ): Promise<TResponse<Data>> {
    if (!this.ipcRender) {
      throw new Error("IPC Renderer is not initialized.");
    }
    return actionFn<Data>(
      this.ipcRender?.invoke(
        formatRouteMethodName(route, Methods.PUT),
        this.getRequest({ config, data }),
      ),
    );
  }

  /**
   * Sends a PATCH request to the specified route.
   * @param route - The route to send the request to.
   * @param data - The data to send in the request body.
   * @param config - Optional configuration for headers and query parameters.
   * @returns A promise resolving to the response.
   */
  patch<Data = unknown, TData = unknown>(
    route: string,
    data: TData,
    config?: TConfig,
  ): Promise<TResponse<Data>> {
    if (!this.ipcRender) {
      throw new Error("IPC Renderer is not initialized.");
    }
    return actionFn(
      this.ipcRender?.invoke(
        formatRouteMethodName(route, Methods.PATCH),
        this.getRequest({ config, data }),
      ),
    );
  }

  /**
   * Constructs the request payload to be sent via IPC.
   * @param request - The request data and configuration.
   * @returns The constructed server request object.
   */
  private getRequest<TData = unknown>(request: {
    data?: TData;
    config?: TConfig;
  }): TServerRequest {
    return {
      data: request?.data,
      params: { ...request?.config?.params },
      headers: { ...this.headers, ...request?.config?.headers },
    };
  }
}

// Create and export a singleton instance of the Client.
export const client = new Client();
