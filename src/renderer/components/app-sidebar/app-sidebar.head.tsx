"use client";
import { ChevronsUpDown } from "lucide-react";
import {
  Menubar,
  MenubarContent,
  MenubarLabel,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/renderer/components/ui/menubar";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/renderer/components/ui/avatar";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/renderer/components/ui/sidebar";

import IconImage from "@/renderer/assets/icon.svg";
import { useConfigStore } from "@/renderer/libs/stores/app-store";

import { SchoolSubMenus } from "./submenus.school";
import { YearSubMenus } from "./submenus.years";

function SchoolProfile({ school }: { school: any }) {
  if (!school) {
    return (
      <div className="flex items-center gap-3 text-muted-foreground">
        <Avatar className="h-9 w-9 rounded-lg bg-accent border border-dashed border-muted-foreground/20">
          <AvatarFallback className="rounded-lg text-muted-foreground font-medium">
            ?
          </AvatarFallback>
        </Avatar>
        <span className="text-sm italic">Aucune école active</span>
      </div>
    );
  }

  const initials = school.name?.substring(0, 2).toUpperCase() ?? "??";

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-9 w-9 rounded-lg border border-sidebar-border shadow-xs">
        {school.logo && (
          <AvatarImage src={school.logo} alt={`Logo ${school.name}`} />
        )}
        <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold text-xs">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold text-foreground">
          {school.name}
        </span>
        <span className="truncate text-xs text-muted-foreground/90">
          {school.adress || "Adresse non spécifiée"}
        </span>
      </div>
    </div>
  );
}

export function SidebarHead() {
  const { isMobile } = useSidebar();
  const { currentSchool, currentStudyYear } = useConfigStore();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Menubar className="border-none bg-transparent p-0 h-auto shadow-none">
          <MenubarMenu>
            <MenubarTrigger asChild>
              <SidebarMenuButton
                size="lg"
                aria-label={`Sélection école et année scolaire${
                  currentSchool ? ` – ${currentSchool.name}` : ""
                }`}
                className="w-full cursor-pointer transition-all duration-300 ease-in-out
                  text-sidebar-foreground/80 hover:text-sidebar-foreground data-[state=open]:text-sidebar-foreground
                  hover:bg-sidebar-accent/40 data-[state=open]:bg-sidebar-accent/60
                  group"
              >
                {/* Logo */}
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg shadow-xs transition-transform duration-300 group-hover:scale-105">
                  <img
                    alt="Logo application Tchik"
                    src={IconImage}
                    height={32}
                    width={32}
                    className="object-contain"
                  />
                </div>

                {/* Arborescence descriptive */}
                <div className="grid flex-1 text-left text-sm leading-tight ml-1">
                  <span className="truncate font-semibold tracking-wide text-sidebar-foreground">
                    {currentSchool
                      ? currentSchool.name
                      : "Sélectionnez une école"}
                  </span>
                  {currentStudyYear?.yearName && (
                    <span className="truncate text-xs font-medium text-primary/80 group-hover:text-primary transition-colors">
                      {currentStudyYear.yearName}
                    </span>
                  )}
                </div>

                <ChevronsUpDown
                  className="ml-auto size-4 shrink-0 text-sidebar-foreground/40 group-hover:text-sidebar-foreground/80 group-data-[state=open]:rotate-180 transition-all duration-300"
                  aria-hidden="true"
                />
              </SidebarMenuButton>
            </MenubarTrigger>

            <MenubarContent
              className="w-(--radix-menubar-trigger-width) min-w-[360px] rounded-lg shadow-xl border-sidebar-border"
              side={isMobile ? "bottom" : "right"}
              align="start"
              sideOffset={8}
            >
              {/* Profil de l’école active */}
              <MenubarLabel className="p-3 font-normal bg-muted/30">
                <SchoolProfile school={currentSchool} />
              </MenubarLabel>

              <MenubarSeparator />
              <div className="p-1">
                <SchoolSubMenus />
                <YearSubMenus />
              </div>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
