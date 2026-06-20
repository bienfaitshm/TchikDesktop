"use client";

import * as React from "react";
import { cn } from "@/renderer/utils";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";

interface PageShellProps {
  header: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: "xl" | "2xl" | "full";
}

interface PageShellContextType {
  isScrolled: boolean;
}

export const PageShellContext = React.createContext<
  PageShellContextType | undefined
>(undefined);

export const usePageShell = () => {
  const context = React.useContext(PageShellContext);
  if (!context) {
    throw new Error(
      "usePageShell doit être utilisé à l'intérieur de <PageShell>",
    );
  }
  return context;
};

const MAX_WIDTH_CLASSES = {
  xl: "max-w-(--breakpoint-xl)",
  "2xl": "max-w-(--breakpoint-2xl)",
  full: "max-w-full",
} as const;

export const PageShell = ({
  header,
  children,
  maxWidth = "2xl",
}: PageShellProps) => {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-background">
      <ScrollArea className="h-full w-full">
        <div className="flex min-h-full flex-col">
          <header className={cn("w-full pt-8 px-6")}>
            <div className={cn("mx-auto", MAX_WIDTH_CLASSES[maxWidth])}>
              <div className="px-2 flex w-full items-center justify-between">
                {header}
              </div>
            </div>
          </header>

          <main
            className={cn(
              "mx-auto w-full px-6 lg:px-10 lg:pt-5",
              MAX_WIDTH_CLASSES[maxWidth],
            )}
          >
            {children}
          </main>
        </div>
      </ScrollArea>
    </div>
  );
};

PageShell.displayName = "PageShell";
