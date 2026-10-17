import installExtension, {
  type ExtensionReference,
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS,
} from "electron-devtools-installer";
import { is } from "@electron-toolkit/utils";

/**
 * Interface representing a logger for tracking extension installation events.
 */
export interface ILogger {
  info(message: string): void;
  error(message: string, error?: unknown): void;
}

/**
 * Configuration options for the development extension installer.
 */
export interface ExtensionInstallerConfig {
  extensions?: ExtensionReference[];
  logger?: ILogger;
  forceDownload?: boolean;
  loadExtensionOptions?: { allowFileAccess?: boolean; [key: string]: unknown };
}

/**
 * Installs a single browser extension and logs success or failure.
 * @param extensionId - The reference ID of the extension to install.
 * @param logger - The logger instance to record events.
 * @param forceDownload - Whether to force download the extension.
 * @param loadExtensionOptions - Additional options for loading the extension.
 * @returns A promise that resolves when the extension installation attempt completes.
 */
async function installSingleExtension(
  extensionId: ExtensionReference,
  logger: ILogger,
  forceDownload: boolean,
  loadExtensionOptions?: { allowFileAccess?: boolean; [key: string]: unknown },
): Promise<void> {
  try {
    const name = await installExtension(extensionId, {
      loadExtensionOptions: { allowFileAccess: true, ...loadExtensionOptions },
      forceDownload,
    });
    logger.info(`[DevTools] Successfully installed: ${name.name}`);
  } catch (error) {
    logger.error(
      `[DevTools] Failed to install extension with ID: ${String(extensionId)}`,
      error,
    );
  }
}

/**
 * Sets up the development environment by installing requested browser extensions.
 * @param config - Optional configuration containing extensions, logger, download flags, and load options.
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
  const loadExtensionOptions = config?.loadExtensionOptions;

  const installationPromises = extensions.map((extId) =>
    installSingleExtension(extId, logger, forceDownload, loadExtensionOptions),
  );

  await Promise.all(installationPromises);
}
