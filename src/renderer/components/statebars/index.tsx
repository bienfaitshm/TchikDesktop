import React from "react";
import { UpdateStatusBar } from "./update-state";
import { PrinterStatusBar } from "./printer-status-bar";

/**
 * Global footer component displaying app status and update indicator.
 * @returns React functional component element.
 */
export const StateBar: React.FC = () => {
  return (
    <footer className="z-30 flex h-8 w-full shrink-0 select-none items-center justify-between gap-2 border-t bg-background/95 px-4 text-xs text-muted-foreground backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground/70">Application prête</span>
        <PrinterStatusBar />
      </div>
      <UpdateStatusBar />
    </footer>
  );
};
