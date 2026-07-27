import installExtension, {
  type ExtensionReference,
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS,
} from "electron-devtools-installer";
import { is } from "@electron-toolkit/utils";

interface ILogger {
  info(message: string): void;
  error(message: string, error?: unknown): void;
}

interface ExtensionInstallerConfig {
  extensions?: ExtensionReference[];
  logger?: ILogger;
  forceDownload?: boolean;
}

/**
 * Service de gestion des extensions (Single Responsibility & Open/Closed)
 * On peut ajouter de nouvelles extensions sans modifier la logique de base.
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
      logger.info(`[DevTools] Installée avec succès : ${name.name}`);
    } catch (e) {
      logger.error(
        `[DevTools] Échec de l'installation pour l'ID : ${extId}`,
        e,
      );
    }
  });

  await Promise.all(installationPromises);
}
