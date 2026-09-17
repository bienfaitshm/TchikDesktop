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
 * Represents an individual navigation menu item configuration.
 */
export interface NavItem {
  /** The display name of the navigation item. */
  name: string;
  /** The destination path or URL for navigation. */
  url: string;
  /** The icon component (React.ElementType) or an already instantiated React node. */
  icon: React.ElementType | React.ReactNode;
}

/**
 * Represents a group section containing multiple navigation items.
 */
export interface NavSection {
  /** Section header label displayed above the group. */
  label: string;
  /** List of navigation items contained within this section. */
  items: NavItem[];
}

/**
 * Props definition for the NavGroup component.
 */
export interface NavGroupProps {
  /** The navigation section data object containing the label and items. */
  section: NavSection;
}

/**
 * Renders a group of navigation links under a labeled section header.
 * @param props - Component properties containing the section configuration.
 * @returns The rendered sidebar group React node.
 */
export function NavGroup({ section }: NavGroupProps): React.JSX.Element {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {section.items.map((item) => {
            const isElement = React.isValidElement(item.icon);
            const IconComponent = !isElement
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
                    {isElement ? (
                      item.icon
                    ) : IconComponent ? (
                      <IconComponent />
                    ) : null}
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
  /** Array of navigation sections to render within the sidebar. Defaults to an empty array. */
  menus?: NavSection[];
};

/**
 * Collapsible application sidebar component presenting header controls, structured menus, and footer status.
 * Positioned explicitly on desktop to preserve spacing for top header (2.5rem / top-10) and bottom footer (1.5rem / bottom-6).
 * @param props - Component properties containing menu configurations.
 * @returns The application sidebar element hierarchy.
 */
export function ApplicationSidebar({
  menus = [],
}: ApplicationSidebarProps): React.JSX.Element {
  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="md:h-[calc(100svh-4rem)]! md:z-20!"
    >
      <SidebarHeader className="">
        {/* <ToggleSidebarButton /> */}
      </SidebarHeader>

      <SidebarContent>
        {menus.map((section) => (
          <NavGroup key={section.label} section={section} />
        ))}
      </SidebarContent>

      <SidebarFooter className="mb-5">
        <Suspense>
          <SidebarFoot />
        </Suspense>
      </SidebarFooter>
    </Sidebar>
  );
}
