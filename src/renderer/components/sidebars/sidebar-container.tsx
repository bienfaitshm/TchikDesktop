"use client";

import * as React from "react";
import {
  ResizableHandle as ResizableHandlePrimitive,
  ResizablePanel as ResizablePanelPrimitive,
  ResizablePanelGroup as ResizablePanelGroupPrimitive,
} from "@/renderer/components/ui/resizable";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { cn } from "@/renderer/utils";

export const SidebarSkeleton = () => (
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

type SidebarLayoutProps = React.ComponentProps<
  typeof ResizablePanelGroupPrimitive
>;

export const SidebarLayout = React.forwardRef<
  React.ComponentRef<typeof ResizablePanelGroupPrimitive>,
  SidebarLayoutProps
>(({ className, orientation = "horizontal", ...props }, _) => (
  <ResizablePanelGroupPrimitive
    orientation={orientation}
    className={cn("h-full flex-1 items-stretch", className)}
    {...props}
  />
));
SidebarLayout.displayName = "SidebarLayout";

interface SidebarPanelProps extends React.ComponentProps<
  typeof ResizablePanelPrimitive
> {
  fallback?: React.ReactNode;
}

export const SidebarPanel = React.forwardRef<
  React.ComponentRef<typeof ResizablePanelPrimitive>,
  SidebarPanelProps
>(
  (
    {
      children,
      className,
      defaultSize = "25%",
      minSize = "15%",
      maxSize = "30%",
      fallback = <SidebarSkeleton />,
      ...props
    },
    _,
  ) => (
    <ResizablePanelPrimitive
      defaultSize={defaultSize}
      minSize={minSize}
      maxSize={maxSize}
      className={cn(
        "bg-sidebar/50 backdrop-blur-xs overflow-y-hidden",
        className,
      )}
      {...props}
    >
      <Suspense fallback={fallback}>{children}</Suspense>
    </ResizablePanelPrimitive>
  ),
);
SidebarPanel.displayName = "SidebarPanel";

type SidebarHandleProps = React.ComponentProps<typeof ResizableHandlePrimitive>;

export const SidebarHandle = React.forwardRef<
  React.ComponentRef<typeof ResizableHandlePrimitive>,
  SidebarHandleProps
>(({ className, withHandle = true, ...props }, _) => (
  <ResizableHandlePrimitive
    withHandle={withHandle}
    className={cn(
      "bg-border/50 hover:bg-primary/20 transition-colors",
      className,
    )}
    {...props}
  />
));
SidebarHandle.displayName = "SidebarHandle";

type SidebarMainProps = React.ComponentProps<typeof ResizablePanelPrimitive>;

export const SidebarMain = React.forwardRef<
  React.ComponentRef<typeof ResizablePanelPrimitive>,
  SidebarMainProps
>(({ children, className, defaultSize = "75%", ...props }, _) => (
  <ResizablePanelPrimitive
    defaultSize={defaultSize}
    className={cn("flex flex-col", className)}
    {...props}
  >
    <main className="flex-1 overflow-hidden relative">{children}</main>
  </ResizablePanelPrimitive>
));
SidebarMain.displayName = "SidebarMain";
