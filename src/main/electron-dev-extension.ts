import installExtension, {
  type ExtensionReference,
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS,
} from "electron-devtools-installer";
import { is } from "@electron-toolkit/utils";

/**
 * Interface representing a logger for tracking extension installation events.
 */
interface ILogger {
  info(message: string): void;
  error(message: string, error?: unknown): void;
}

/**
 * Configuration options for the development extension installer.
 */
interface ExtensionInstallerConfig {
  extensions?: ExtensionReference[];
  logger?: ILogger;
  forceDownload?: boolean;
}

/**
 * Sets up the development environment by installing requested browser extensions.
 * @param config - Optional configuration containing extensions, logger, and download flags.
 * @returns A promise that resolves when all extensions have been processed.
 */
export async function setupDevelopmentEnvironment(
  config?: ExtensionInstallerConfig,
): Promise<void> {
  if (!is.dev) return;

  const logger = config?.logger ?? console;
  const forceDownload = config?.forceDownload ?? false;
  const extensions = config?.extensions ?? [
    REACT_DEVELOPER_TOOLS,
    REDUX_DEVTOOLS,
  ];

  const installationPromises = extensions.map(async (extId) => {
    try {
      const name = await installExtension(extId, {
        loadExtensionOptions: { allowFileAccess: true },
        forceDownload,
      });
      logger.info(`[DevTools] Successfully installed: ${name.name}`);
    } catch (e) {
      logger.error(
        `[DevTools] Failed to install extension with ID: ${extId}`,
        e,
      );
    }
  });

  await Promise.all(installationPromises);
}
