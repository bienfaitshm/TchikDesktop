"use client";

import React from "react";
import {
  Settings,
  User,
  Settings2,
  Bell,
  ChevronRight,
  LifeBuoy,
  Info,
  Code2,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/renderer/components/ui/menubar";

import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/renderer/components/ui/sidebar";

import { APP_ROUTES } from "@/renderer/constants";
import { ThemeMenuItem } from "./app-sidebar.theme";

export type Option = {
  label?: string; // Optionnel car le sous-menu Theme embarque sa propre configuration
  href?: string;
  icon?: LucideIcon;
  hasSeparatorAfter?: boolean;
  hasSubMenus?: boolean;
  subMenus?: React.ReactNode;
};

const SETTINGS_OPTIONS: Option[] = [
  // Bloc 1: Identité et noyau
  { label: "Mon compte", href: APP_ROUTES.SETTINGS.ACCOUNT, icon: User },
  {
    label: "Paramètres généraux",
    href: APP_ROUTES.SETTINGS.ROOT,
    icon: Settings2,
    hasSeparatorAfter: true,
  },

  // Bloc 2: Interface et UI
  {
    label: "Notifications",
    href: APP_ROUTES.SETTINGS.NOTIFICATIONS,
    icon: Bell,
  },
  {
    hasSubMenus: true,
    subMenus: <ThemeMenuItem />, // Le composant gère sa propre icône et son label dynamiquement
    hasSeparatorAfter: true,
  },

  // Bloc 3: Support et Informations
  { label: "Aide & Support", href: APP_ROUTES.SETTINGS.HELP, icon: LifeBuoy },
  { label: "À propos", href: APP_ROUTES.SETTINGS.ABOUT, icon: Info },
  {
    label: "Mode développeur",
    href: APP_ROUTES.SETTINGS.DEVELOPER,
    icon: Code2,
  },
];

export const SidebarSettingsButton = () => {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenuItem>
      <Menubar className="border-none bg-transparent p-0 h-auto shadow-none">
        <MenubarMenu>
          <MenubarTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="w-full cursor-pointer transition-all duration-300 ease-in-out
                text-sidebar-foreground/80 hover:text-sidebar-foreground data-[state=open]:text-sidebar-foreground
                hover:bg-sidebar-accent/40 data-[state=open]:bg-sidebar-accent/60
                group"
              tooltip="Paramètres"
            >
              <div
                className="flex aspect-square size-8 items-center justify-center rounded-lg 
                    bg-sidebar-foreground/5 text-sidebar-foreground/70
                    transition-all duration-300"
              >
                <Settings className="size-5" />
              </div>

              <div className="grid flex-1 text-left text-sm leading-tight ml-1">
                <span className="truncate font-medium tracking-wide">
                  Paramètres
                </span>
                <span className="truncate text-xs text-sidebar-foreground/60 group-hover:text-sidebar-foreground/80 transition-colors">
                  Configuration & profil
                </span>
              </div>

              <ChevronRight
                className="ml-auto size-4 shrink-0 
                    text-sidebar-foreground/40 group-hover:text-sidebar-foreground/80"
              />
            </SidebarMenuButton>
          </MenubarTrigger>

          <MenubarContent
            className="w-(--radix-menubar-trigger-width) min-w-[350px]"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <MenubarLabel className="px-6 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Préférences système
            </MenubarLabel>

            <MenubarSeparator />

            {SETTINGS_OPTIONS.map((item, index) => {
              const itemKey = item.href || `option-${index}`;

              let content: React.ReactNode;

              if (item.hasSubMenus && item.subMenus) {
                content = item.subMenus;
              } else {
                content = (
                  <MenubarItem asChild>
                    <Link
                      to={item.href!}
                      className="flex items-center gap-3 cursor-pointer py-2 px-4"
                    >
                      {item.icon && (
                        <item.icon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                      <span className="flex-1 text-sm">{item.label}</span>
                    </Link>
                  </MenubarItem>
                );
              }

              if (item.hasSeparatorAfter) {
                return (
                  <React.Fragment key={itemKey}>
                    {content}
                    <MenubarSeparator />
                  </React.Fragment>
                );
              }

              return <React.Fragment key={itemKey}>{content}</React.Fragment>;
            })}
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </SidebarMenuItem>
  );
};
