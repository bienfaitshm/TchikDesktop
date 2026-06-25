"use client";

import * as React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/renderer/components/ui/resizable";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { cn } from "@/renderer/utils";

type ResizablePanelGroupProps = React.ComponentProps<
  typeof ResizablePanelGroup
>;
type ResizablePanelProps = React.ComponentProps<typeof ResizablePanel>;

interface SidebarContainerProps extends ResizablePanelGroupProps {
  sidebar: React.ReactNode;
  sidebarProps?: Partial<ResizablePanelProps>;
  mainProps?: Partial<ResizablePanelProps>;
}

const SidebarSkeleton = () => (
  <div className="h-full p-6 space-y-6 animate-pulse" aria-hidden="true">
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
  React.ComponentRef<typeof ResizablePanelGroup>,
  SidebarContainerProps
>(
  (
    {
      sidebar,
      children,
      className,
      sidebarProps,
      mainProps,
      orientation = "horizontal",
      ...props
    },
    _,
  ) => {
    return (
      <ResizablePanelGroup
        orientation={orientation}
        className={cn("h-full items-stretch", className)}
        {...props}
      >
        {/* Panneau de la Sidebar */}
        <ResizablePanel
          defaultSize="25%"
          minSize="20%"
          maxSize="30%"
          {...sidebarProps}
          className={cn(
            "bg-sidebar/50 backdrop-blur-xs overflow-y-hidden",
            sidebarProps?.className,
          )}
        >
          <Suspense fallback={<SidebarSkeleton />}>{sidebar}</Suspense>
        </ResizablePanel>

        {/* Poignée de redimensionnement (Gère les interactions clavier + souris) */}
        <ResizableHandle
          withHandle
          className="bg-border/50 hover:bg-primary/20 transition-colors"
        />

        {/* Panneau du contenu Principal */}
        <ResizablePanel
          defaultSize="75%"
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
