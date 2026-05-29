import { dialog, app } from "electron";
import type { CustomLogger } from "@/packages/logger";

/**
 * Affiche la boîte de dialogue.
 * On retourne un booléen pour savoir si l'utilisateur a demandé l'envoi.
 */
export const showErrorDialog = (title: string, message: string): boolean => {
  const options: Electron.MessageBoxOptions = {
    type: "error",
    title: `${app.getName()} : Erreur Critique`,
    message: title,
    detail: message,
    buttons: ["Envoyer le rapport", "Quitter"],
    defaultId: 0,
    cancelId: 1,
    noLink: true,
  };

  const response = dialog.showMessageBoxSync(options);
  return response === 0;
};

/**
 * Gestionnaire centralisé des erreurs fatales.
 */
export const handleFatalError = (
  type: string,
  error: any,
  mainLogger?: CustomLogger,
) => {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // 1. Log toujours l'erreur
  mainLogger?.error(`${type}:`, error);

  // 2. Tente l'affichage interactif
  try {
    const shouldSendReport = showErrorDialog("Erreur fatale", errorMessage);
    if (shouldSendReport) {
      sendErrorReport(errorMessage);
    }
  } catch (dialogErr) {
    mainLogger?.error(
      "Impossible d'afficher la boîte de dialogue :",
      dialogErr,
    );
  }

  // 3. Quitter proprement (si production)
  if (app.isPackaged) {
    app.exit(1);
  } else {
    mainLogger?.warn(
      "Mode DEV : Le processus est maintenu ouvert pour analyse.",
    );
  }
};

const sendErrorReport = (error: string) => {
  console.log(`Envoi du rapport vers le serveur...`, error);
  // Conseil : utilise une requête synchrone ou attends que l'opération se termine
  // si tu veux être sûr que le rapport parte avant l'exit.
};
