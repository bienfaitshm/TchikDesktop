"use client";

import { ChevronRight, Building2 } from "lucide-react";
import {
  Menubar,
  MenubarContent,
  MenubarLabel,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/renderer/components/ui/menubar";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/renderer/components/ui/sidebar";

import { useConfigStore } from "@/renderer/libs/stores/app-store";
import { SchoolSubMenus, YearSubMenus } from "./submenus.config";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { Spinner } from "@/components/ui/spinner";

export function SidebarAccount() {
  const { isMobile } = useSidebar();
  const { currentSchool, currentStudyYear } = useConfigStore();

  // Libellés dynamiques pour l'affichage
  const schoolLabel = currentSchool?.name ?? "Sélectionner un établissement";
  const yearLabel = currentStudyYear?.yearName ?? "Année non définie";

  // Libellé d'accessibilité fluide
  const accessibleLabel = currentSchool
    ? `Établissement : ${currentSchool.name}${
        currentStudyYear
          ? `, Année scolaire : ${currentStudyYear.yearName}`
          : ""
      }`
    : "Sélectionner un établissement et une année scolaire";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Menubar className="border-none bg-transparent p-0 h-auto shadow-none">
          <MenubarMenu>
            <MenubarTrigger asChild>
              <SidebarMenuButton
                size="lg"
                tooltip="Changer d'établissement ou d'année"
                aria-label={accessibleLabel}
                className="w-full cursor-pointer transition-all duration-300 ease-in-out 
                  text-sidebar-foreground/80 hover:text-sidebar-foreground data-[state=open]:text-sidebar-foreground
                  hover:bg-sidebar-accent/40 data-[state=open]:bg-sidebar-accent/60
                  group"
              >
                {/* Icône contextuelle d'établissement */}
                <div
                  className="flex aspect-square size-8 items-center justify-center rounded-lg 
                    bg-sidebar-foreground/5 text-sidebar-foreground/70
                    transition-all duration-300 shrink-0"
                >
                  <Building2 className="size-5" />
                </div>

                {/* Arborescence descriptive */}
                <div className="grid flex-1 text-left text-sm leading-tight ml-1 overflow-hidden">
                  <span className="truncate font-semibold tracking-wide">
                    {schoolLabel}
                  </span>
                  <span className="truncate text-xs text-sidebar-foreground/60 group-hover:text-sidebar-foreground/80 transition-colors">
                    {yearLabel}
                  </span>
                </div>

                <ChevronRight className="ml-auto size-4 shrink-0 text-sidebar-foreground/40 group-hover:text-sidebar-foreground/80" />
              </SidebarMenuButton>
            </MenubarTrigger>

            <MenubarContent
              className="w-(--radix-menubar-trigger-width) min-w-80 rounded-lg shadow-xl border-sidebar-border"
              side={isMobile ? "bottom" : "right"}
              align="start"
              sideOffset={8}
            >
              {/* Entête de section clair */}
              <MenubarLabel className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Espace de travail
              </MenubarLabel>

              <MenubarSeparator />

              <div className="p-1">
                <Suspense
                  fallback={
                    <div className="flex w-full justify-center items-center py-4">
                      <Spinner />
                    </div>
                  }
                >
                  <SchoolSubMenus />
                  <YearSubMenus />
                </Suspense>
              </div>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
