import type { BrowserWindow } from "electron";
import { ipcMain } from "electron";
import { Methods } from "./constant";
import { formatRouteMethodName, reponse, type TFuncReponse, type TReponse } from "./utils";

type TMethods = "GET"| "POST"| "PUT"| "DELETE"| "PATCH";

/**
 * Represents a server request.
 * @template TParams - The type of the request parameters.
 * @template TData - The type of the request data.
 */
type TServerRequest<TParams extends {} = Record<string, unknown>, TData = unknown> = {
    headers: object;
    data: TData;
    params: TParams;
};

/**
 * Represents a server response.
 * @template TResponse - The type of the response data.
 */
type TServerResponse<TRes> = TFuncReponse<TRes> | TReponse<TRes>

/**
 * Represents a route definition.
 * @template TRequest - The type of the request.
 * @template TResponse - The type of the response.
 */
type TRoute<TRequest = unknown, R = unknown> = {
    name: string;
    callback(request: TRequest): TServerResponse<R>
};

/**
 * Callback type for server functions.
 * @template TResponse - The type of the response.
 */
type ServerFunctionCallback<R = unknown> = (
    request: TServerRequest
) => (TServerResponse<R> | R)

/**
 * Type definition for server functions (GET, POST, PUT, DELETE).
 */
type ServerFunction = (route: string, callback: ServerFunctionCallback) => void;

/**
 * Interface defining the server's API.
 */
interface IServer {
    /**
     * Starts the server and binds routes to the provided BrowserWindow.
     * @param win - The Electron BrowserWindow instance.
     * @param callback - Optional callback to execute after the server starts.
     */
    listen(win: BrowserWindow | null, callback?: (routes?:TRoute[]) => void): void;

    get: ServerFunction;
    post: ServerFunction;
    put: ServerFunction;
    delete: ServerFunction;
}

/**
 * Implementation of the IServer interface.
 */
class Server implements IServer {
    private win: BrowserWindow | null = null;
    private routes: TRoute[] = [];

    /**
     * Registers a GET route.
     * @param name - The route name.
     * @param callback - The callback to handle the request.
     */
    get(name: string, callback: ServerFunctionCallback): void {
        this.addRoute(name, callback, Methods.GET);
    }

    /**
     * Registers a POST route.
     * @param name - The route name.
     * @param callback - The callback to handle the request.
     */
    post(name: string, callback: ServerFunctionCallback): void {
        this.addRoute(name, callback, Methods.POST);
    }

    /**
     * Registers a PUT route.
     * @param name - The route name.
     * @param callback - The callback to handle the request.
     */
    put(name: string, callback: ServerFunctionCallback): void {
        this.addRoute(name, callback, Methods.PUT);
    }

    /**
     * Registers a DELETE route.
     * @param name - The route name.
     * @param callback - The callback to handle the request.
     */
    delete(name: string, callback: ServerFunctionCallback): void {
        this.addRoute(name, callback, Methods.DELETE);
    }

    /**
     * Starts the server and binds all registered routes to the provided BrowserWindow.
     * @param win - The Electron BrowserWindow instance.
     * @param callback - Optional callback to execute after the server starts.
     */
    listen(win: BrowserWindow | null, callback?: (routes:TRoute[]) => void): void {
        this.win = win;

        this.routes.forEach((route) => {
            ipcMain.handle(route.name, (_, request) => route.callback(request));
        });

        callback?.(this.routes);
    }

    /**
     * Adds a route to the server.
     * @param name - The route name.
     * @param func - The callback to handle the request.
     * @param method - The HTTP method (GET, POST, PUT, DELETE).
     */
    private addRoute(
        name: string,
        func: ServerFunctionCallback,
        method: TMethods
    ): void {
        const route: TRoute = {
            name: formatRouteMethodName(name, method),
            callback(request: TServerRequest): TServerResponse<unknown> {
                const res = func(request);
                if ((res as any)?.__func) return res as TServerResponse<unknown>;
                return reponse(res as unknown);
            },
        };
        this.routes.push(route);
    }
}

// Create an instance of the server
const server = new Server();
export default server;

/**
 * Example Usage:
 * 
 * ```typescript
 * import server from "./lib/electron-apis/server";
 * import { BrowserWindow } from "electron";
 * 
 * // Define routes
 * server.get("example", (request) => {
 *   return { data: { message: "GET request received", params: request.params } };
 * });
 * 
 * server.post("example", (request) => {
 *   return { data: { message: "POST request received", data: request.data } };
 * });
 * 
 * // Start the server
 * const win = new BrowserWindow();
 * server.listen(win, () => {
 *   console.log("Server is listening...");
 * });
 * ```
 */