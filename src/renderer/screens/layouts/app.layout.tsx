import {
  SidebarInset,
  SidebarProvider,
} from "@/renderer/components/ui/sidebar";
import {
  ApplicationSidebar,
  ApplicationSidebarProps,
} from "@/renderer/components/app-sidebar/app-sidebar";
import { Outlet } from "react-router";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { LoadingSpinner } from "@/renderer/components/loaders/loading-spinner";
import React from "react";
import {
  ScreenSaveProvider,
  LockScreenButton,
} from "@/components/screen-saver";

type AppLayoutProps = ApplicationSidebarProps;

export function AppLayout({ menus = [] }: AppLayoutProps) {
  const { schoolId, yearId } = useCurrentConfig();
  const outletContext = React.useMemo(
    () => ({ schoolId, yearId }),
    [schoolId, yearId],
  );

  return (
    <ScreenSaveProvider requiredPin="1234" lockShortcutKey="l">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "15rem",
            "--sidebar-width-mobile": "20rem",
          } as React.CSSProperties
        }
      >
        <ApplicationSidebar menus={menus} />
        <SidebarInset className="flex flex-col h-svh min-w-0 w-full overflow-hidden">
          <SidebarInset className="flex flex-col h-svh min-w-0 overflow-hidden">
            {/* Header */}
            <header className="bg-background/95 backdrop-blur-sm sticky top-0 z-30 flex h-10 shrink-0 items-center justify-between gap-2 border-b px-4">
              <div></div>
              <div>
                <LockScreenButton />
              </div>
            </header>
            <div className="flex-1 min-h-0 min-w-0 w-full overflow-hidden">
              <Suspense
                fallback={
                  <div className="h-full flex justify-center items-center">
                    <LoadingSpinner />
                  </div>
                }
              >
                <Outlet context={outletContext} />
              </Suspense>
            </div>
            <footer className="bg-background/95 backdrop-blur-sm sticky bottom-0 z-30 flex h-5 shrink-0 items-center gap-2 border-t px-4"></footer>
          </SidebarInset>
        </SidebarInset>
      </SidebarProvider>
    </ScreenSaveProvider>
  );
}
