"use client";

import * as React from "react";
import { PanelLeftClose, PanelLeftOpen, type LucideIcon } from "lucide-react";

import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/renderer/components/ui/sidebar";
import IconImage from "@/renderer/assets/icon.svg";
import { Button } from "@/renderer/components/ui/button";
import { cn } from "@/renderer/utils";

/**
 * Custom hook providing layout state and associated context metadata for sidebar controls.
 * @returns Object containing open state, icon component, toggle handler, and contextual text label.
 */
function useSidebarToggleState(): {
  isOpen: boolean;
  ToggleIcon: LucideIcon;
  toggleSidebar: () => void;
  tooltipText: string;
} {
  const { toggleSidebar, open } = useSidebar();
  const ToggleIcon = open ? PanelLeftClose : PanelLeftOpen;
  const tooltipText = open ? "Collapse sidebar" : "Expand sidebar";

  return {
    isOpen: open,
    ToggleIcon,
    toggleSidebar,
    tooltipText,
  };
}

/**
 * Renders the standardized application logo with responsive transition support.
 * @param props - HTML image elements attributes.
 * @returns The rendered logo image element.
 */
function ApplicationLogo({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>): React.JSX.Element {
  return (
    <img
      alt="Tchik application logo"
      src={IconImage}
      height={34}
      width={34}
      className={cn(
        "size-8 object-contain transition-opacity duration-200 group-hover:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Renders a compact button to trigger sidebar expansion or collapse.
 * @param props - Standard button properties extended from Button component.
 * @returns The sidebar trigger button element.
 */
export function SidebarTrigger({
  className,
  onClick,
  title = "Tchik",
  ...props
}: React.ComponentProps<typeof Button> & {
  title?: string;
}): React.JSX.Element {
  const { toggleSidebar, ToggleIcon, tooltipText } = useSidebarToggleState();

  return (
    <div
      className="group flex items-center gap-2 cursor-pointer"
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
    >
      <Button
        data-sidebar="trigger"
        data-slot="sidebar-trigger"
        variant="ghost"
        size="icon-sm"
        className={cn("relative", className)}
        title={tooltipText}
        {...props}
      >
        <ApplicationLogo />
        <ToggleIcon className="absolute size-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        <span className="sr-only">{tooltipText}</span>
      </Button>
      {title && <span className="text-sm font-semibold">{title}</span>}
    </div>
  );
}

/**
 * Renders a primary sidebar menu item with interactive hover icon toggle state and branding label.
 * @returns The toggle menu item component for the application sidebar.
 */
export function SidebarToggle(): React.JSX.Element {
  const { toggleSidebar, ToggleIcon, tooltipText } = useSidebarToggleState();

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        size="lg"
        onClick={toggleSidebar}
        tooltip={tooltipText}
        className="group w-full cursor-pointer text-sidebar-foreground/80 transition-all duration-300 ease-in-out hover:bg-sidebar-accent/40 hover:text-sidebar-foreground data-[state=open]:bg-sidebar-accent/60 data-[state=open]:text-sidebar-foreground"
      >
        <div className="relative flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-xs transition-transform duration-300 group-hover:scale-105">
          <ApplicationLogo />
          <ToggleIcon className="absolute size-5 text-sidebar-primary-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        </div>

        <div className="ml-1 grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold tracking-wide">Tchik</span>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
