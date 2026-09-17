import * as React from "react";
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
import { ToggleSidebarButton } from "./app-sidebar.toggle-button";

/**
 * Interface representing an individual navigation menu item.
 */
export interface NavItem {
  /** The display name of the navigation item. */
  name: string;
  /** The destination path or URL for navigation. */
  url: string;
  /** The icon component or React node associated with the link. */
  icon: React.ElementType | React.ReactNode;
}

/**
 * Interface representing a group section of navigation items.
 */
export interface NavSection {
  /** Section header label. */
  label: string;
  /** List of navigation items contained in the section. */
  items: NavItem[];
}

/**
 * Props definition for the NavGroup component.
 */
export interface NavGroupProps {
  /** The navigation section data object. */
  section: NavSection;
}

/**
 * Renders a group of navigation links under a labeled section header.
 * @param props - Component properties containing the section configuration.
 * @returns The rendered sidebar group node.
 */
export function NavGroup({ section }: NavGroupProps): React.JSX.Element {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {section.items.map((item) => {
            const isComponent =
              typeof item.icon === "function" || typeof item.icon === "object";
            const IconComponent = isComponent
              ? (item.icon as React.ElementType)
              : null;

            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild tooltip={item.name}>
                  <NavLink
                    to={item.url}
                    className={({ isActive }) =>
                      isActive ? "bg-sidebar-accent" : ""
                    }
                  >
                    {IconComponent ? (
                      <IconComponent />
                    ) : (
                      (item.icon as React.ReactNode)
                    )}
                    <span>{item.name}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

/**
 * Props definition for the ApplicationSidebar component.
 */
export type ApplicationSidebarProps = {
  /** Array of navigation sections to render within the sidebar. */
  menus?: NavSection[];
};

/**
 * Collapsible application sidebar component presenting header controls, structured menus, and footer status.
 * @param props - Component properties containing menu configurations.
 * @returns The application sidebar element hierarchy.
 */
export function ApplicationSidebar({
  menus = [],
}: ApplicationSidebarProps): React.JSX.Element {
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
