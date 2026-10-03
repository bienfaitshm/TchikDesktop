import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";
import type {
  DownloadProgressPayload,
  UpdateStatusPayload,
} from "../../../preload/updater";
import { cn } from "@/renderer/utils";

/**
 * Union type representing all possible updater status states.
 */
export type UpdateStateStatus =
  "idle" | "checking" | "available" | "downloading" | "downloaded" | "error";

/**
 * Custom hook to manage Electron updater IPC events and update state transitions.
 * @returns Object containing current update status, version information, and action handlers.
 */
function useAppUpdater() {
  const [currentVersion, setCurrentVersion] = useState<string>("");
  const [newVersion, setNewVersion] = useState<string>("");
  const [status, setStatus] = useState<UpdateStateStatus>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

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

  const startDownload = useCallback(async (): Promise<void> => {
    try {
      setStatus("downloading");
      await window.updater?.startDownload();
    } catch (error) {
      setStatus("error");
      setErrorMessage("Échec du téléchargement");
    }
  }, []);

  const quitAndInstall = useCallback((): void => {
    window.updater?.quitAndInstall();
  }, []);

  return {
    currentVersion,
    newVersion,
    status,
    progress,
    errorMessage,
    startDownload,
    quitAndInstall,
  };
}

/**
 * Renders the application update status bar badge with pulse indicator and popover controls.
 * @returns React element displaying the updater status interface.
 */
export const UpdateStatusBar: React.FC = () => {
  const {
    currentVersion,
    newVersion,
    status,
    progress,
    errorMessage,
    startDownload,
    quitAndInstall,
  } = useAppUpdater();

  const isUpdateAvailable = status === "available" || status === "downloaded";

  const badgeColor = isUpdateAvailable
    ? "text-primary border-primary/50"
    : status === "error"
      ? "text-destructive border-destructive/50"
      : "text-muted-foreground";

  return (
    <div className="flex items-center justify-end gap-3 text-xs">
      <Popover>
        <PopoverTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              "relative inline-flex items-center gap-1.5 font-mono text-[10px] cursor-pointer transition-colors hover:bg-accent px-2 py-0.5",
              badgeColor,
            )}
          >
            {isUpdateAvailable && (
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary animate-pulse" />
              </span>
            )}
            <span>v{currentVersion || "0.0.0"}</span>
          </Badge>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-4" sideOffset={8}>
          <div className="space-y-3">
            <div className="space-y-1">
              <h4 className="font-semibold leading-none flex items-center gap-2 text-sm">
                <Info className="size-4 text-muted-foreground" />
                Centre de mise à jour
              </h4>
              <p className="text-xs text-muted-foreground">
                Gérez les versions de votre application.
              </p>
            </div>

            <div className="flex items-center justify-center rounded-md border bg-muted/40 p-2">
              {status === "idle" && (
                <span className="text-xs text-muted-foreground text-center">
                  L'application est à jour.
                </span>
              )}

              {status === "checking" && (
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="size-4 animate-spin" />
                  Vérification des mises à jour...
                </span>
              )}

              {status === "available" && (
                <div className="flex flex-col gap-3 w-full">
                  <span className="text-xs font-medium text-primary text-center">
                    Une nouvelle version (v{newVersion}) est disponible !
                  </span>
                  <Button
                    size="sm"
                    className="w-full rounded-full text-xs"
                    onClick={startDownload}
                  >
                    <Download className="mr-2 size-4" />
                    Télécharger
                  </Button>
                </div>
              )}

              {status === "downloading" && (
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex justify-between text-xs font-medium gap-2">
                    <span>Téléchargement en cours</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2 w-full" />
                </div>
              )}

              {status === "downloaded" && (
                <div className="flex flex-col gap-3 py-2 w-full">
                  <span className="flex items-center justify-center gap-2 text-xs font-medium text-primary">
                    <CheckCircle2 className="size-4" />
                    Mise à jour prête
                  </span>
                  <Button
                    size="sm"
                    variant="default"
                    className="w-full rounded-full px-6 text-xs bg-primary text-primary-foreground"
                    onClick={quitAndInstall}
                  >
                    <RefreshCw className="mr-2 size-4" />
                    Redémarrer & Installer
                  </Button>
                </div>
              )}

              {status === "error" && (
                <span className="flex items-start gap-2 text-xs font-medium text-destructive">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </span>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
