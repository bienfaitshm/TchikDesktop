import type { BrowserWindow } from "electron"
import { ipcMain } from "electron"
import { Methods, Status } from "./constant"
import { formatRouteMethodName, response, type TResponse } from "./utils"

type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

type ServerRequest<TParams extends object = Record<string, unknown>, TData = unknown> = {
    headers: object
    data: TData
    params: TParams
}

type ResponseType = ReturnType<typeof response>
type ServerResponse = TResponse<ResponseType>

type RouteHandler = (request: ServerRequest) => Promise<ServerResponse>

type Route = {
    name: string
    handler: RouteHandler
}

type RegisterRoute = (
    route: string,
    handler: (request: ServerRequest) => Promise<ResponseType | unknown>,
) => void

interface IServer {
    listen(win: BrowserWindow | null, callback?: (routes: Route[]) => void): void
    get: RegisterRoute
    post: RegisterRoute
    put: RegisterRoute
    delete: RegisterRoute
}

class Server implements IServer {
    private win: BrowserWindow | null = null
    private routes: Route[] = []

    get(route: string, handler): void {
        this.addRoute(route, handler, Methods.GET)
    }

    post(route: string, handler): void {
        this.addRoute(route, handler, Methods.POST)
    }

    put(route: string, handler): void {
        this.addRoute(route, handler, Methods.PUT)
    }

    delete(route: string, handler): void {
        this.addRoute(route, handler, Methods.DELETE)
    }

    listen(win: BrowserWindow | null, callback?: (routes: Route[]) => void): void {
        this.win = win
        this.routes.forEach((route) => {
            ipcMain.handle(route.name, async (_, request) =>
                route.handler(this.getRequest(request)),
            )
        })
        callback?.(this.routes)
    }

    private getRequest(request): ServerRequest {
        const headers = request.headers ? request.headers : {}
        return {
            data: request,
            params: request,
            headers: {
                win: this.win,
                ...headers,
            },
        }
    }

    private createRoute(routeName: string, method: HTTPMethod, handler: RouteHandler): Route {
        return {
            name: formatRouteMethodName(routeName, method),
            handler: async (request: ServerRequest): Promise<ServerResponse> => {
                try {
                    const res = await handler(request)
                    if (res?.__func) return res
                    return response(res.data, Status.OK) as ServerResponse
                } catch (error: unknown) {
                    const errMsg = error instanceof Error ? error.message : String(error)
                    return response(
                        undefined as unknown as never,
                        Status.INTERNAL_SERVER,
                        errMsg,
                    ) as ServerResponse
                }
            },
        }
    }

    private addRoute(route: string, handler: RouteHandler, method: HTTPMethod): void {
        this.routes.push(this.createRoute(route, method, handler))
    }
}

export const server = new Server()

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
