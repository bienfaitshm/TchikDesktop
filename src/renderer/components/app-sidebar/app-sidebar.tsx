import { type LucideIcon } from "lucide-react";
import { NavLink } from "react-router";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/renderer/components/ui/sidebar";
import { SidebarFoot } from "./app-sidebar.foot";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { ToggleSidebarButton } from "./app-sidebar.toogle-button";

export interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

const NavGroup = ({ section }: { section: NavSection }) => (
  <SidebarGroup>
    <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        {section.items.map((item) => (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton asChild tooltip={item.name}>
              <NavLink
                to={item.url}
                className={({ isActive }) =>
                  isActive ? "bg-sidebar-accent" : ""
                }
              >
                <item.icon />
                <span>{item.name}</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
);

export type ApplicationSidebarProps = {
  menus?: NavSection[];
};

export function ApplicationSidebar({ menus = [] }: ApplicationSidebarProps) {
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <ToggleSidebarButton />
      </SidebarHeader>

      <SidebarContent>
        {menus.map((section) => (
          <NavGroup key={section.label} section={section} />
        ))}
      </SidebarContent>

      <SidebarFooter>
        <Suspense>
          <SidebarFoot />
        </Suspense>
      </SidebarFooter>
    </Sidebar>
  );
}
