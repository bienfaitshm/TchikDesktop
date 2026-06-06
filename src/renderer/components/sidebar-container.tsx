"use client";

import * as React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/renderer/components/ui/resizable";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { cn } from "@/renderer/utils";
import type { ImperativePanelGroupHandle } from "react-resizable-panels";

interface SidebarContainerProps
  extends React.ComponentPropsWithoutRef<typeof ResizablePanelGroup> {
  sidebar: React.ReactNode;
  sidebarProps?: React.ComponentPropsWithoutRef<typeof ResizablePanel>;
  mainProps?: React.ComponentPropsWithoutRef<typeof ResizablePanel>;
}

/**
 * Skeleton dédié à la sidebar pour éviter de polluer le composant principal.
 */
const SidebarSkeleton = () => (
  <div className="p-6 space-y-6 animate-pulse" aria-hidden="true">
    <div className="h-8 w-8 bg-muted rounded-lg" />
    <div className="h-10 w-full bg-muted rounded-md" />
    <div className="space-y-3">
      <div className="h-4 w-1/2 bg-muted rounded" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-9 w-full bg-muted/60 rounded" />
      ))}
    </div>
  </div>
);

export const SidebarContainer = React.forwardRef<
  ImperativePanelGroupHandle,
  SidebarContainerProps
>(
  (
    { sidebar, children, className, sidebarProps, mainProps, ...props },
    ref,
  ) => {
    return (
      <ResizablePanelGroup
        ref={ref}
        className={cn("h-full items-stretch", className)}
        {...props}
      >
        <ResizablePanel
          defaultSize={20}
          minSize={15}
          maxSize={30}
          {...sidebarProps}
          className={cn(
            "h-full bg-sidebar/50 backdrop-blur-xs",
            sidebarProps?.className,
          )}
        >
          <Suspense fallback={<SidebarSkeleton />}>{sidebar}</Suspense>
        </ResizablePanel>

        <ResizableHandle
          withHandle
          className="bg-border/50 hover:bg-primary/20 transition-colors"
        />

        <ResizablePanel
          defaultSize={80}
          {...mainProps}
          className={cn("flex flex-col", mainProps?.className)}
        >
          <main className="flex-1 overflow-hidden relative">{children}</main>
        </ResizablePanel>
      </ResizablePanelGroup>
    );
  },
);

SidebarContainer.displayName = "SidebarContainer";
