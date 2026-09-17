"use client";

import * as React from "react";
import {
  ResizableHandle as ResizableHandlePrimitive,
  ResizablePanel as ResizablePanelPrimitive,
  ResizablePanelGroup as ResizablePanelGroupPrimitive,
} from "@/renderer/components/ui/resizable";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { cn } from "@/renderer/utils";

/**
 * Hook to detect if the current viewport is mobile based on a breakpoint.
 * @param breakpoint - The pixel width under which the screen is considered mobile (default: 768).
 * @returns Boolean indicating if the screen is mobile.
 */
function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < breakpoint);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, [breakpoint]);

  return isMobile;
}

interface SidebarContextValue {
  isOpen: boolean;
  toggle: () => void;
  isMobile: boolean;
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(
  undefined,
);

/**
 * Accesses the sidebar context to manage state and responsive mode.
 * @returns SidebarContextValue containing isOpen, toggle, and isMobile.
 */
export function useSidebar(): SidebarContextValue {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarLayout");
  }
  return context;
}

/**
 * Skeleton loader displayed while the sidebar content is loading.
 * @returns JSX Element representing a loading state.
 */
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

/**
 * Main layout wrapper for the application. Injects the Sidebar context.
 * @param props - Standard props for ResizablePanelGroupPrimitive.
 * @returns A context provider wrapping the panel group.
 */
export const SidebarLayout = React.forwardRef<
  React.ComponentRef<typeof ResizablePanelGroupPrimitive>,
  SidebarLayoutProps
>(({ className, orientation = "horizontal", children, ...props }, ref) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const toggle = React.useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, isMobile }}>
      <ResizablePanelGroupPrimitive
        ref={ref}
        orientation={orientation}
        className={cn("h-full flex-1 items-stretch relative", className)}
        {...props}
      >
        {children}
      </ResizablePanelGroupPrimitive>
    </SidebarContext.Provider>
  );
});
SidebarLayout.displayName = "SidebarLayout";

/**
 * Button to toggle the sidebar on mobile devices.
 * @param props - Standard HTML button props.
 * @returns A button visible only on mobile screens.
 */
export const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { toggle, isMobile } = useSidebar();

  if (!isMobile) return null;

  return (
    <button
      ref={ref}
      onClick={toggle}
      className={cn(
        "p-2 rounded-md hover:bg-muted transition-colors z-50 focus:outline-none focus:ring-2 focus:ring-primary",
        className,
      )}
      aria-label="Toggle Sidebar"
      {...props}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

interface SidebarPanelProps extends React.ComponentProps<
  typeof ResizablePanelPrimitive
> {
  fallback?: React.ReactNode;
}

/**
 * Adaptive sidebar panel. Renders as a fixed off-canvas drawer on mobile,
 * and as a resizable panel on desktop.
 * @param props - Props matching ResizablePanelPrimitive.
 * @returns The adaptive panel element.
 */
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
    ref,
  ) => {
    const { isMobile, isOpen, toggle } = useSidebar();

    if (isMobile) {
      return (
        <>
          {isOpen && (
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity"
              onClick={toggle}
              aria-hidden="true"
            />
          )}
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-[80%] max-w-sm bg-sidebar shadow-lg transform transition-transform duration-300 ease-in-out overflow-y-auto",
              isOpen ? "translate-x-0" : "-translate-x-full",
              className,
            )}
          >
            <Suspense fallback={fallback}>{children}</Suspense>
          </div>
        </>
      );
    }

    return (
      <ResizablePanelPrimitive
        ref={ref}
        defaultSize={defaultSize}
        minSize={minSize}
        maxSize={maxSize}
        className={cn(
          "bg-sidebar/50 backdrop-blur-xs overflow-y-auto",
          className,
        )}
        {...props}
      >
        <Suspense fallback={fallback}>{children}</Suspense>
      </ResizablePanelPrimitive>
    );
  },
);
SidebarPanel.displayName = "SidebarPanel";

type SidebarHandleProps = React.ComponentProps<typeof ResizableHandlePrimitive>;

/**
 * Handle to resize the sidebar on desktop. Automatically hidden on mobile.
 * @param props - Standard ResizableHandle props.
 * @returns The resize handle element.
 */
export const SidebarHandle = React.forwardRef<
  React.ComponentRef<typeof ResizableHandlePrimitive>,
  SidebarHandleProps
>(({ className, withHandle = true, ...props }, ref) => {
  const { isMobile } = useSidebar();

  if (isMobile) return null;

  return (
    <ResizableHandlePrimitive
      ref={ref}
      withHandle={withHandle}
      className={cn(
        "bg-border/50 hover:bg-primary/20 transition-colors",
        className,
      )}
      {...props}
    />
  );
});
SidebarHandle.displayName = "SidebarHandle";

type SidebarMainProps = React.ComponentProps<typeof ResizablePanelPrimitive>;

/**
 * Wrapper for the main content area taking the remaining space.
 * @param props - Standard ResizablePanelPrimitive props.
 * @returns The main content wrapper.
 */
export const SidebarMain = React.forwardRef<
  React.ComponentRef<typeof ResizablePanelPrimitive>,
  SidebarMainProps
>(({ children, className, defaultSize = 75, ...props }, ref) => (
  <ResizablePanelPrimitive
    ref={ref}
    defaultSize={defaultSize}
    className={cn("flex flex-col relative", className)}
    {...props}
  >
    <main className="flex-1 overflow-auto p-4">{children}</main>
  </ResizablePanelPrimitive>
));
SidebarMain.displayName = "SidebarMain";
