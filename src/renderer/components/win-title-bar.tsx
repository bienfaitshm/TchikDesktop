import React, { useEffect, useState, CSSProperties } from "react";
import { Minus, Square, X, Copy } from "lucide-react";
import { SidebarTrigger } from "@/renderer/components/app-sidebar/app-sidebar.toggle-button";
import { LockScreenButton } from "@/renderer/components/screen-saver";
import { cn } from "@/renderer/utils";

const DRAG_STYLE: CSSProperties = { WebkitAppRegion: "drag" } as CSSProperties;
const NO_DRAG_STYLE: CSSProperties = {
  WebkitAppRegion: "no-drag",
} as CSSProperties;

const BASE_BUTTON_CLASSES =
  "inline-flex h-8 w-11 items-center justify-center rounded-none text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

/**
 * Custom hook to track and synchronize the window's maximized state via Electron IPC.
 * @returns A boolean indicating whether the window is currently maximized.
 */
function useWindowControls(): boolean {
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  useEffect(() => {
    const controls = window.windowControls;
    if (!controls) return;

    controls.isMaximized().then(setIsMaximized);
    const unsubscribe = controls.onMaximizeChange(setIsMaximized);

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  return isMaximized;
}

/**
 * Renders the window control buttons (minimize, maximize/restore, close).
 * @returns A React component containing the window action buttons.
 */
export const WindowControls: React.FC = () => {
  const isMaximized = useWindowControls();

  return (
    <div className="-mr-4 flex items-center self-stretch">
      <button
        type="button"
        aria-label="Minimize"
        className={BASE_BUTTON_CLASSES}
        onClick={() => window.windowControls?.minimize()}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        aria-label={isMaximized ? "Restore" : "Maximize"}
        className={BASE_BUTTON_CLASSES}
        onClick={() => window.windowControls?.maximize()}
      >
        {isMaximized ? (
          <Copy className="h-3 w-3 -scale-x-100" />
        ) : (
          <Square className="h-3 w-3" />
        )}
      </button>

      <button
        type="button"
        aria-label="Close"
        className={cn(BASE_BUTTON_CLASSES, "hover:bg-red-500 hover:text-white")}
        onClick={() => window.windowControls?.close()}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

/**
 * Renders the main window title bar with draggable regions and embedded actions.
 * @returns A React header element representing the custom desktop title bar.
 */
export const WindowTitleBar: React.FC = () => {
  return (
    <header
      className="z-30 flex h-10 w-full shrink-0 select-none items-center justify-between gap-2 border-b bg-background/95 px-4 backdrop-blur-sm"
      style={DRAG_STYLE}
    >
      <div className="flex items-center gap-2" style={NO_DRAG_STYLE}>
        <SidebarTrigger />
      </div>

      <div className="flex h-full items-center gap-2">
        <div style={NO_DRAG_STYLE}>
          <LockScreenButton />
        </div>

        <div style={NO_DRAG_STYLE}>
          <WindowControls />
        </div>
      </div>
    </header>
  );
};
