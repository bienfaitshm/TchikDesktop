"use client";

import { Download } from "lucide-react"; // Remplacement de Upload par Download (plus logique pour un export)
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/renderer/components/ui/sidebar";

import { cn } from "@/renderer/utils";
import { ButtonExport } from "@/renderer/components/buttons/button-export";
import { DialogDataExport } from "@/renderer/dialog-actions/dialog-document-expoter-actions";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";

interface SidebarExportDocumentProps {
  className?: string;
}

export function SidebarExportDocument({
  className,
}: SidebarExportDocumentProps) {
  const { schoolId, yearId } = useCurrentConfig();
  const { open } = useSidebar();

  if (!schoolId) return null;

  return (
    <SidebarMenu className={className}>
      <SidebarMenuItem className="px-2 py-1.5 transition-all duration-300">
        {!open ? (
          <DialogDataExport
            schoolId={schoolId}
            yearId={yearId}
            buttonTrigger={
              <SidebarMenuButton
                size="lg"
                className="w-full justify-center group transition-all duration-300 dynamic-tailwind-classes"
                tooltip="Exporter les données ou documents"
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:bg-sidebar-primary/90">
                  <Download className="size-4 transition-transform group-hover:-translate-y-0.5" />
                </div>
              </SidebarMenuButton>
            }
          />
        ) : (
          <div
            className={cn(
              "w-full rounded-xl border border-sidebar-border bg-sidebar-accent/30 p-3 backdrop-blur-xs shadow-xs",
              "animate-in fade-in-50 slide-in-from-left-2 duration-200 ease-out",
            )}
          >
            <div className="flex flex-col gap-0.5 mb-3">
              <span className="text-sm font-semibold text-sidebar-foreground/90 flex items-center gap-1.5">
                Exportation
              </span>
              <p className="text-xs text-muted-foreground leading-normal">
                Générez et téléchargez vos documents et données brutes.
              </p>
            </div>

            {/* Bouton principal propre */}
            <DialogDataExport
              schoolId={schoolId}
              yearId={yearId}
              buttonTrigger={
                <ButtonExport className="w-full justify-center shadow-2xs" />
              }
            />
          </div>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
