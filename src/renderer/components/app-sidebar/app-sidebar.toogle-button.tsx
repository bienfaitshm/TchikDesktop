"use client";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/renderer/components/ui/sidebar";
import IconImage from "@/renderer/assets/icon.svg";

export const ToggleSidebarButton = () => {
  const { toggleSidebar, open } = useSidebar();

  const ToggleIcon = open ? PanelLeftClose : PanelLeftOpen;
  const tooltipText = open ? "Réduire le menu" : "Développer le menu";

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        size="lg"
        onClick={toggleSidebar}
        tooltip={tooltipText}
        className="w-full cursor-pointer transition-all duration-300 ease-in-out
          text-sidebar-foreground/80 hover:text-sidebar-foreground data-[state=open]:text-sidebar-foreground
          hover:bg-sidebar-accent/40 data-[state=open]:bg-sidebar-accent/60
          group"
      >
        {/* Container d'icône/logo réactif au survol */}
        <div className="relative flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-xs transition-transform duration-300 group-hover:scale-105 shrink-0 overflow-hidden">
          {/* Logo affiché par défaut */}
          <img
            alt="Logo application Tchik"
            src={IconImage}
            height={34}
            width={34}
            className="object-contain size-8 transition-opacity duration-200 group-hover:opacity-0"
          />

          {/* Icône de bascule affichée au survol */}
          <ToggleIcon className="absolute size-5 text-sidebar-primary-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        </div>

        {/* Labels texte */}
        <div className="grid flex-1 text-left text-sm leading-tight ml-1">
          <span className="truncate font-semibold tracking-wide">Tchik</span>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
