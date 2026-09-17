import React from "react";
import { Outlet } from "react-router";
import { SidebarProvider } from "@/renderer/components/ui/sidebar";
import {
  ApplicationSidebar,
  ApplicationSidebarProps,
} from "@/renderer/components/app-sidebar/app-sidebar";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { LoadingSpinner } from "@/renderer/components/loaders/loading-spinner";
import {
  ScreenSaveProvider,
  LockScreenButton,
} from "@/renderer/components/screen-saver";
import { SidebarTrigger } from "@/renderer/components/app-sidebar/app-sidebar.toggle-button";

// Application version injected via environment variables or fallback
const APP_VERSION = import.meta.env?.VITE_APP_VERSION || "1.0.0";

// Sidebar styling configuration
const SIDEBAR_CONFIG_STYLES: React.CSSProperties = {
  "--sidebar-width": "14rem",
  "--sidebar-width-mobile": "20rem",
} as React.CSSProperties;

type AppLayoutProps = ApplicationSidebarProps;

/**
 * Renders a full-height, centered loading indicator for async operations.
 * @returns The loading container element.
 */
function MainLoader(): React.JSX.Element {
  return (
    <div
      className="flex h-full items-center justify-center"
      role="status"
      aria-busy="true"
    >
      <LoadingSpinner />
    </div>
  );
}

/**
 * Main application layout encompassing the header, sidebar, main workspace, and footer.
 * @param props - Component props containing the navigation menus configuration.
 * @returns The fully structured app layout React node.
 */
export function AppLayout({ menus = [] }: AppLayoutProps): React.JSX.Element {
  const { schoolId, yearId } = useCurrentConfig();

  const outletContext = React.useMemo(
    () => ({ schoolId, yearId }),
    [schoolId, yearId],
  );

  return (
    <ScreenSaveProvider lockShortcutKey="l">
      <SidebarProvider style={SIDEBAR_CONFIG_STYLES}>
        <div className="flex h-svh w-full flex-col overflow-hidden bg-background">
          {/* Full-width Header */}
          <header className="z-30 flex h-10 w-full shrink-0 items-center justify-between gap-2 border-b bg-background/95 px-4 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
            </div>
            <div className="flex items-center gap-2">
              <LockScreenButton />
            </div>
          </header>

          {/* Central Workspace */}
          <div className="relative flex w-full min-w-0 flex-1 overflow-hidden">
            <ApplicationSidebar menus={menus} />

            <main className="h-full min-w-0 flex-1 overflow-y-auto">
              <Suspense fallback={<MainLoader />}>
                <Outlet context={outletContext} />
              </Suspense>
            </main>
          </div>

          {/* Full-width Status Bar Footer */}
          <footer className="z-30 flex h-7 w-full shrink-0 select-none items-center justify-between gap-2 border-t bg-background/95 px-4 text-xs text-muted-foreground backdrop-blur-sm">
            <span>Ready</span>
            <span>App Version {APP_VERSION}</span>
          </footer>
        </div>
      </SidebarProvider>
    </ScreenSaveProvider>
  );
}
