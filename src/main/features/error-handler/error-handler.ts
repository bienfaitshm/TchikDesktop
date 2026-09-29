import { dialog, app } from "electron";
import { CustomLogger, getLogger } from "@/packages/logger";
import { sendErrorReport } from "./api-sender";

const SEND_REPORT_BUTTON_INDEX = 0;
const EXIT_BUTTON_INDEX = 1;

const FRONT_UI_LOGGER = getLogger("FRONT UI");

/**
 * Displays an asynchronous native error dialog asking the user whether to send an error report.
 * @param title - The title/headline of the error dialog.
 * @param message - Detailed information or message regarding the error.
 * @returns Promise resolving to true if the user chooses to send the report, false otherwise.
 */
export async function showErrorDialog(
  title: string,
  message: string,
): Promise<boolean> {
  const options: Electron.MessageBoxOptions = {
    type: "error",
    title: `${app.getName()} : Critical Error`,
    message: title,
    detail: message,
    buttons: ["Send Report", "Exit"],
    defaultId: SEND_REPORT_BUTTON_INDEX,
    cancelId: EXIT_BUTTON_INDEX,
    noLink: true,
  };

  const { response } = await dialog.showMessageBox(options);
  return response === SEND_REPORT_BUTTON_INDEX;
}

/**
 * Centralized handler for fatal application errors that logs, prompts user report consent, and exits the app.
 * @param type - Category or origin identifier for the fatal error.
 * @param error - The error instance or unknown error value thrown.
 * @param mainLogger - Optional logger instance used to record application events.
 */
export async function handleFatalError(
  type: string,
  error: unknown,
  mainLogger?: CustomLogger,
): Promise<void> {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  mainLogger?.error(`${type}:`, error);

  try {
    const shouldSendReport = await showErrorDialog("Fatal Error", errorMessage);

    if (shouldSendReport) {
      await sendErrorReport({
        type,
        message: errorMessage,
        stack: errorStack,
      });
    }
  } catch (dialogError) {
    mainLogger?.error("Failed to render native error dialog:", dialogError);
  }

  if (app.isPackaged) {
    app.exit(1);
  } else {
    mainLogger?.warn(
      "DEV mode active: Process retained open for debugging and analysis.",
    );
  }
}

/**
 * Handles and logs errors originated from the frontend/view layer.
 * @param error - The error instance or unknown value thrown by the UI.
 * @param mainLogger - Optional contextual logger used to record the error event.
 */
export async function handleFrontError(
  error: { message: string; name: string; stack: string; cause: string },
  mainLogger: CustomLogger = FRONT_UI_LOGGER,
): Promise<void> {
  const errorMessage = `${error.name} -${error.message}`;
  mainLogger?.error(errorMessage, error);
}
