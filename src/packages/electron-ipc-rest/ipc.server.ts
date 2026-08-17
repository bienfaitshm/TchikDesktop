import { BrowserWindow, type IpcMainInvokeEvent, type IpcMain } from "electron";
import { randomUUID } from "node:crypto";
import { HttpMethod, HttpStatus } from "./constant";
import {
  createResponse,
  createErrorResponse,
  HttpException,
  formatChannelName,
  type IResponse,
} from "./utils";
import { type ValidationSchemas, wrapSchemaValidation } from "./validation";
import type {
  ILogger,
  IpcPayload,
  IpcRequest,
  RequestHandler,
  RouteDefinition,
  ServerConfig,
} from "./type";

/**
 * Main IPC Server class managing request routing, validation, and execution.
 */
export class IpcServer {
  private static readonly routeDefinitions = new Map<string, RouteDefinition>();
  private readonly activeHandlers = new Map<string, RequestHandler>();
  private isListening = false;
  private readonly logger: ILogger;
  private readonly GATEWAY_CHANNEL = "IPC_HTTP_GATEWAY";

  /**
   * Initializes the IPC Server.
   * @param ipcMain - The Electron IpcMain instance.
   * @param config - Server configuration overrides.
   */
  constructor(
    private readonly ipcMain: IpcMain,
    private readonly config: ServerConfig = {},
  ) {
    this.logger = this.config.logger ?? {
      info: console.log,
      warn: console.warn,
      error: console.error,
    };
  }

  /**
   * Method decorator to statically register a route.
   * @param method - The HTTP method equivalent.
   * @param route - The string path of the route.
   * @param schemas - Optional validation schemas.
   * @returns A method decorator function.
   */
  static register(
    method: HttpMethod,
    route: string,
    schemas?: ValidationSchemas,
  ) {
    return (
      _target: unknown,
      _propertyKey: string,
      descriptor: PropertyDescriptor,
    ) => {
      const key = formatChannelName(route, method);
      IpcServer.routeDefinitions.set(key, {
        schemas,
        handler: descriptor.value,
      });
    };
  }

  /**
   * Starts listening for incoming IPC requests and builds active routes.
   * @returns A cleanup function to stop listening.
   */
  public listen(): () => void {
    const stopListening = () => {
      this.ipcMain.removeHandler(this.GATEWAY_CHANNEL);
      this.isListening = false;
    };

    if (this.isListening) {
      return stopListening;
    }

    // Build active handlers once at startup to prevent per-request wrapping
    for (const [key, definition] of IpcServer.routeDefinitions.entries()) {
      const handler = definition.schemas
        ? wrapSchemaValidation(definition.handler, definition.schemas)
        : definition.handler;
      this.activeHandlers.set(key, handler);
    }

    const gatewayHandler = async (
      event: IpcMainInvokeEvent,
      payload: IpcPayload<unknown>,
    ) => {
      const routeKey = formatChannelName(payload.route, payload.method);
      const handler = this.activeHandlers.get(routeKey);

      if (!handler) {
        return createErrorResponse(
          `Route ${routeKey} Not Found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const req: IpcRequest = {
        id: randomUUID(),
        body: (payload.data as Record<string, unknown>) ?? {},
        params: payload.params ?? {},
        headers: payload.headers ?? {},
        context: {
          sender: event.sender,
          window: BrowserWindow.fromWebContents(event.sender),
        },
      };

      this.logger.info(`[Incoming]: ${routeKey}`, { payload: req });
      const startTime = performance.now();

      try {
        const result = await handler(req);
        const duration = performance.now() - startTime;

        this.logger.info(`[Success]: ${routeKey} - ${duration.toFixed(2)}ms`, {
          requestId: req.id,
          durationMs: duration,
        });

        return createResponse(result, HttpStatus.OK);
      } catch (error) {
        const duration = performance.now() - startTime;

        this.logger.warn(
          `[Failed]: ${routeKey} after ${duration.toFixed(2)}ms`,
          {
            requestId: req.id,
            durationMs: duration,
          },
        );

        return this.handleError(req, error as Error);
      }
    };

    this.ipcMain.handle(this.GATEWAY_CHANNEL, gatewayHandler);
    this.isListening = true;
    this.logger.info(
      `[Gateway] listening with ${this.activeHandlers.size} active routes.`,
    );

    return stopListening;
  }

  /**
   * Processes caught exceptions and translates them into standardized responses.
   * @param req - The request context during which the error occurred.
   * @param error - The caught error instance.
   * @returns A properly formatted error response object.
   */
  private handleError(
    req: IpcRequest<unknown, unknown, unknown>,
    error: Error,
  ): IResponse<null> {
    if (error instanceof HttpException) {
      this.logger.warn(
        `HTTP ${error.statusCode} on ${req.id}: ${error.message}`,
        { error },
      );
      return createErrorResponse(
        error.message,
        error.statusCode,
        error.details,
      );
    }

    this.logger.error(`Critical Error on ${req.id}: ${error?.message}`, error);
    return createErrorResponse(
      "Internal Server Error",
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
