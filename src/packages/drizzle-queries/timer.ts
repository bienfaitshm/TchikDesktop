import { DatabaseError } from "./error";

/**
 * Options for configuring the performance measurement decorator.
 */
export interface TimingOptions<T = unknown, A extends unknown[] = unknown[]> {
  /** Custom operation name (defaults to ClassName.methodName) */
  opName?: string;
  /** Static or dynamic execution context to attach to log payloads */
  context?:
    | Record<string, unknown>
    | ((args: A, instance: T) => Record<string, unknown>);
}

/**
 * Resolves static or dynamic context payload for logging.
 * @param optionsContext - The context option provided to the decorator.
 * @param args - Method execution arguments.
 * @param instance - Target class instance.
 * @returns Evaluated context object.
 */
function resolveContext<T, A extends unknown[]>(
  optionsContext: TimingOptions<T, A>["context"],
  args: A,
  instance: T,
): Record<string, unknown> {
  if (typeof optionsContext === "function") {
    return optionsContext(args, instance);
  }
  if (optionsContext) {
    return { ...optionsContext };
  }
  return {};
}

/**
 * Decorator measuring execution duration for sync and async methods, logging metrics and wrapping errors.
 * @param options - Configuration options for timing and context logging.
 * @returns Decorator function for class methods.
 */
export function Timed<
  T = Record<string, any>,
  A extends unknown[] = unknown[],
  R = unknown,
>(options: TimingOptions<T, A> = {}) {
  return function (
    _target: object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...args: A) => R | Promise<R>>,
  ): TypedPropertyDescriptor<(...args: A) => R | Promise<R>> {
    const originalMethod = descriptor.value;

    if (!originalMethod) {
      return descriptor;
    }

    descriptor.value = function (
      this: T & Record<string, any>,
      ...args: A
    ): R | Promise<R> {
      const instance = this;
      const className = instance.constructor?.name ?? "Unknown";
      const opName = options.opName ?? `${className}.${propertyKey}`;
      const startTime = performance.now();
      const baseTableName = instance.baseTableName ?? "Unknown";
      const logger = instance.logger;
      const logError = instance.logError?.bind(instance);

      const baseContext = resolveContext(options.context, args, instance);

      const computeDuration = (): number => {
        return Math.round((performance.now() - startTime) * 100) / 100;
      };

      const wrapSync = (result: R): R => {
        const durationMs = computeDuration();
        logger?.info(
          `[${baseTableName}Repository] [${opName}] Success - ${durationMs}ms`,
          { durationMs, ...baseContext },
        );
        return result;
      };

      const handleError = (error: unknown): never => {
        const durationMs = computeDuration();
        const logContext = { ...baseContext, durationMs };
        const dbError =
          error instanceof DatabaseError
            ? error
            : DatabaseError.from(
                error,
                `Operational failure during ${opName}.`,
              );

        logError?.(opName, dbError, logContext);
        throw dbError;
      };

      try {
        const result = originalMethod.apply(instance, args);

        if (result instanceof Promise) {
          return result.then(wrapSync).catch(handleError) as Promise<R>;
        }
        return wrapSync(result);
      } catch (error) {
        handleError(error);
      }
    };

    return descriptor;
  };
}
