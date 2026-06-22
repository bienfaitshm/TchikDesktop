"use client";

import { Download } from "lucide-react";
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/renderer/components/ui/sidebar";
import { cn } from "@/renderer/utils";
import { ButtonExport } from "@/renderer/components/buttons/button-export";
import { DialogDataExport } from "@/renderer/dialog-actions/dialog-document-expoter-actions";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
} from "@/renderer/components/ui/menubar";

interface SidebarExportDocumentProps {
  className?: string;
}

export function SidebarExportDocument({
  className,
}: SidebarExportDocumentProps) {
  const { schoolId, yearId } = useCurrentConfig();

  if (!schoolId) return null;

  return (
    <SidebarMenuItem className={cn("list-none", className)}>
      <Menubar className="h-auto border-none bg-transparent p-0 shadow-none">
        <MenubarMenu>
          <div className="hidden group-data-[state=collapsed]:block w-full">
            <DialogDataExport
              schoolId={schoolId}
              yearId={yearId}
              buttonTrigger={
                <MenubarTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    tooltip="Exporter les données ou documents"
                    className="w-full justify-center"
                  >
                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg shadow-sm transition-all duration-200 group-hover:scale-105">
                      <Download className="size-4 transition-transform group-hover:-translate-y-0.5" />
                    </div>
                  </SidebarMenuButton>
                </MenubarTrigger>
              }
            />
          </div>

          <div
            className={cn(
              "w-full rounded-xl border border-sidebar-border bg-sidebar-accent/20 p-3 shadow-xs transition-all duration-200",
              "group-data-[state=collapsed]:hidden",
              "animate-in fade-in-40 slide-in-from-left-3 duration-200 ease-out",
            )}
          >
            <div className="mb-3 flex flex-col gap-0.5 select-none">
              <span className="text-sm font-semibold text-sidebar-foreground/90">
                Exportation
              </span>
              <p className="text-xs text-muted-foreground leading-normal">
                Générez et téléchargez vos documents et données brutes.
              </p>
            </div>

            <DialogDataExport
              schoolId={schoolId}
              yearId={yearId}
              buttonTrigger={
                <MenubarTrigger asChild>
                  <ButtonExport className="w-full justify-center shadow-xs" />
                </MenubarTrigger>
              }
            />
          </div>
        </MenubarMenu>
      </Menubar>
    </SidebarMenuItem>
  );
}
