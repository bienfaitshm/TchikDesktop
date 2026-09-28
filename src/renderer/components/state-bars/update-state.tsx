import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Download, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import type {
  DownloadProgressPayload,
  UpdateStatusPayload,
} from "../../../preload/updater";

/**
 * Status union representing all possible states of the application updater workflow.
 */
export type UpdateStateStatus =
  "idle" | "checking" | "available" | "downloading" | "downloaded" | "error";

/**
 * Renders the status bar element managing auto-update states and user actions.
 * @returns React functional component element.
 */
export const UpdateBarState: React.FC = () => {
  const [currentVersion, setCurrentVersion] = useState<string>("");
  const [newVersion, setNewVersion] = useState<string>("");
  const [status, setStatus] = useState<UpdateStateStatus>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    /**
     * Fetches current app version and initiates background update verification.
     */
    const initializeUpdate = async (): Promise<void> => {
      try {
        if (window.electron?.getAppVersion) {
          const version = await window.electron.getAppVersion();
          if (isMounted) setCurrentVersion(version);
        }

        if (window.updater?.checkUpdate) {
          setStatus("checking");
          await window.updater.checkUpdate();
        }
      } catch (error) {
        if (!isMounted) return;
        const msg = error instanceof Error ? error.message : String(error);

        // Silently handle non-packaged development environment errors
        if (msg.includes("only available after packaging")) {
          setStatus("idle");
        } else {
          setStatus("error");
          setErrorMessage("Échec de la vérification des mises à jour");
        }
      }
    };

    initializeUpdate();

    const unsubscribeAvailable = window.updater?.onUpdateAvailable(
      (data: UpdateStatusPayload) => {
        if (!isMounted) return;
        if (data.update && data.newVersion) {
          setNewVersion(data.newVersion);
          setStatus("available");
        } else {
          setStatus("idle");
        }
      },
    );

    const unsubscribeProgress = window.updater?.onDownloadProgress(
      (data: DownloadProgressPayload) => {
        if (!isMounted) return;
        setStatus("downloading");
        setProgress(Math.round(data.percent));
      },
    );

    const unsubscribeDownloaded = window.updater?.onUpdateDownloaded(() => {
      if (!isMounted) return;
      setStatus("downloaded");
    });

    const unsubscribeError = window.updater?.onUpdateError((err) => {
      if (!isMounted) return;
      const msg = err.message || "";
      if (msg.includes("only available after packaging")) {
        setStatus("idle");
      } else {
        setStatus("error");
        setErrorMessage("Une erreur est survenue lors de la mise à jour");
      }
    });

    return () => {
      isMounted = false;
      unsubscribeAvailable?.();
      unsubscribeProgress?.();
      unsubscribeDownloaded?.();
      unsubscribeError?.();
    };
  }, []);

  /**
   * Sends IPC command to download the available update.
   */
  const handleStartDownload = async (): Promise<void> => {
    try {
      setStatus("downloading");
      await window.updater.startDownload();
    } catch (error) {
      setStatus("error");
      setErrorMessage("Échec du téléchargement");
    }
  };

  /**
   * Sends IPC command to restart and install the downloaded update.
   */
  const handleQuitAndInstall = (): void => {
    window.updater.quitAndInstall();
  };

  return (
    <div className="flex items-center justify-end gap-3 text-xs">
      <Badge variant="outline" className="font-mono text-[10px]">
        v{currentVersion || "0.0.0"}
      </Badge>

      {status === "checking" && (
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Vérification des mises à jour...
        </span>
      )}

      {status === "available" && (
        <div className="flex items-center gap-2">
          <span className="font-medium text-blue-600 dark:text-blue-400">
            Version v{newVersion} disponible !
          </span>
          <Button
            size="sm"
            variant="default"
            className="h-6 text-[11px] px-2"
            onClick={handleStartDownload}
          >
            <Download className="mr-1 h-3 w-3" />
            Télécharger
          </Button>
        </div>
      )}

      {status === "downloading" && (
        <div className="flex items-center gap-2">
          <span>Téléchargement : {progress}%</span>
          <Progress value={progress} className="h-1.5 w-20" />
        </div>
      )}

      {status === "downloaded" && (
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-medium text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Mise à jour prête
          </span>
          <Button
            size="sm"
            variant="default"
            className="h-6 bg-green-600 text-[11px] px-2 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
            onClick={handleQuitAndInstall}
          >
            <RefreshCw className="mr-1 h-3 w-3" />
            Redémarrer & Installer
          </Button>
        </div>
      )}

      {status === "error" && (
        <span className="flex items-center gap-1.5 font-medium text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          {errorMessage}
        </span>
      )}
    </div>
  );
};
