"use client";

import * as React from "react";
import { NavLink } from "react-router";
import {
  SidebarLayout,
  SidebarPanel,
  SidebarHandle,
  SidebarMain,
} from "./sidebar-container";
import type { LucideIcon } from "lucide-react";
import { LoadingSpinner } from "@/renderer/components/loaders/loading-spinner";
import { cn } from "@/renderer/utils";

export interface NavItem {
  name: string;
  url: string;
  icon?: LucideIcon;
}

interface SubNavItemProps extends React.ComponentProps<typeof NavLink> {}

export const SubNavItem = ({
  to,
  children,
  className,
  ...props
}: SubNavItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-accent-foreground transparent",
        className,
      )
    }
    {...props}
  >
    {children}
  </NavLink>
);

interface SubNavMenuProps extends React.ComponentProps<"nav"> {
  items?: NavItem[];
}

export const SubNavMenu = ({
  items = [],
  children,
  className,
  ...props
}: SubNavMenuProps) => {
  return (
    <div className="flex flex-1 h-full flex-col py-6">
      <nav className={cn("flex-1 space-y-1 px-4", className)} {...props}>
        {children ??
          items.map(({ icon: Icon, name, url }) => (
            <SubNavItem key={url} to={url} prefetch="intent" end>
              {Icon && <Icon />}
              <span>{name}</span>
            </SubNavItem>
          ))}
      </nav>
    </div>
  );
};

export const SubNavContentFallback = () => (
  <div className="flex flex-1 w-full justify-center items-center h-full">
    <LoadingSpinner />
  </div>
);

export const SubNavigationSkeleton = () => (
  <div className="space-y-2 px-4 py-6" aria-hidden="true">
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className="h-9 w-full animate-pulse rounded-md bg-muted/60"
      />
    ))}
  </div>
);

export interface SubNavigationLayoutProps {
  items?: NavItem[];
  children?: React.ReactNode;
}

export const SubNavigationLayout = ({
  items = [],
  children,
}: SubNavigationLayoutProps) => {
  return (
    <SidebarLayout>
      <SidebarPanel defaultSize="17%" fallback={<SubNavigationSkeleton />}>
        <SubNavMenu items={items} />
      </SidebarPanel>
      <SidebarHandle />
      <SidebarMain>{children}</SidebarMain>
    </SidebarLayout>
  );
};
