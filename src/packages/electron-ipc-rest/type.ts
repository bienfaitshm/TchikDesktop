import { BrowserWindow } from "electron";
import { HttpMethod } from "./constant";
import { ValidationSchemas } from "./validation";

/**
 * Defines the contract for logging server activities.
 */
export interface ILogger {
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, error?: unknown): void;
}

/**
 * Configuration options for the IPC server.
 */
export interface ServerConfig {
  readonly logger?: ILogger;
}

/**
 * Represents an interceptor function modifying data flow.
 */
export type Interceptor<T> = (value: T) => T | Promise<T>;

/**
 * Configuration for outgoing client requests.
 */
export interface ClientRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  timeout?: number;
}

/**
 * Internal payload structure received from the IPC client.
 */
export interface IpcPayload<T> {
  data: T;
  params: Record<string, unknown>;
  headers: Record<string, string>;
  route: string;
  method: HttpMethod;
}

/**
 * Standardized request object passed to route handlers.
 */
export interface IpcRequest<
  TBody = Record<string, unknown>,
  TParams = Record<string, unknown>,
  THeaders = Record<string, string>,
> {
  readonly id: string;
  body: TBody;
  params: TParams;
  headers: THeaders;
  readonly context: {
    readonly sender: Electron.WebContents;
    readonly window: BrowserWindow | null;
  };
}

/**
 * Function signature for handling incoming IPC requests.
 * @param req - The validated and formatted IPC request.
 * @returns The expected response data or a promise resolving to it.
 */
export type RequestHandler<
  TRes = unknown,
  TBody = Record<string, unknown>,
  TParams = Record<string, unknown>,
  THeaders = Record<string, string>,
> = (req: IpcRequest<TBody, TParams, THeaders>) => Promise<TRes> | TRes;

/**
 * Internal definition mapping a route to its handler and schemas.
 */
export interface RouteDefinition {
  schemas?: ValidationSchemas;
  handler: RequestHandler;
}
