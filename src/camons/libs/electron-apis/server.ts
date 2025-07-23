import type { BrowserWindow } from "electron";import { ipcMain } from "electron";
import { Methods, Status } from "./constant";
import { formatRouteMethodName, response, type TResponse } from "./utils";

type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface ServerRequest<
  TData = unknown,
  TParams extends object = Record<string, unknown>,
> {
  headers: object;
  data: TData;
  params: TParams;
}

type ServerResponse<R> = TResponse<R>;

type RouteHandler<TRes, TData, TParams extends object> = (
  request: ServerRequest<TData, TParams>,
) => Promise<ServerResponse<TRes> | TRes>;

interface Route<TRes = unknown, TData = unknown, TParams extends object = {}> {
  name: string;
  handler: RouteHandler<TRes, TData, TParams>;
}

class Server {
  private win: BrowserWindow | null = null;
  private routes: Route[] = [];

  get<TRes, TParams extends object = {}>(
    route: string,
    handler: RouteHandler<TRes, undefined, TParams>,
  ): void {
    this.addRoute(route, handler, Methods.GET);
  }

  post<TRes, TData, TParams extends object = {}>(
    route: string,
    handler: RouteHandler<TRes, TData, TParams>,
  ): void {
    this.addRoute(route, handler, Methods.POST);
  }

  put<TRes, TData, TParams extends object = {}>(
    route: string,
    handler: RouteHandler<TRes, TData, TParams>,
  ): void {
    this.addRoute(route, handler, Methods.PUT);
  }

  delete<TRes, TParams extends object = {}>(
    route: string,
    handler: RouteHandler<TRes, undefined, TParams>,
  ): void {
    this.addRoute(route, handler, Methods.DELETE);
  }

  listen(
    win: BrowserWindow | null,
    callback?: (routes: Route[]) => void,
  ): void {
    this.win = win;
    this.routes.forEach((route) => {
      ipcMain.handle(route.name, async (_, request) =>
        route.handler(this.buildRequest(request)),
      );
    });
    callback?.(this.routes);
  }

  private buildRequest(request: any): ServerRequest {
    const headers = request?.headers ?? {};
    return {
      ...request,
      headers: {
        win: this.win,
        ...headers,
      },
    };
  }

  private createRoute<TRes, TData, TParams extends object>(
    routeName: string,
    method: HTTPMethod,
    handler: RouteHandler<TRes, TData, TParams>,
  ): Route {
    return {
      name: formatRouteMethodName(routeName, method),
      handler: async (request) => {
        try {
          const res = await handler(request as any);
          if ((res as any)?.__func) return res;
          return response((res as any).data, Status.OK);
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : String(error);
          return response(undefined as never, Status.INTERNAL_SERVER, message);
        }
      },
    };
  }

  private addRoute<TRes, TData, TParams extends object>(
    route: string,
    handler: RouteHandler<TRes, TData, TParams>,
    method: HTTPMethod,
  ): void {
    this.routes.push(this.createRoute(route, method, handler));
  }
}

export const server = new Server();

/**
 * Example Usage:
 *
 * import { server } from "./lib/electron-apis/server";
 * import { BrowserWindow } from "electron";
 *
 * server.get("example", (request) => ({
 *   data: { message: "GET request received", params: request.params }
 * }));
 *
 * server.post("example", (request) => ({
 *   data: { message: "POST request received", data: request.data }
 * }));
 *
 * const win = new BrowserWindow();
 * server.listen(win, () => {
 *   console.log("Server is listening...");
 * });
 */
