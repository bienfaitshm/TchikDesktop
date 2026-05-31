"use client";
import { SidebarMenu } from "@/renderer/components/ui/sidebar";

import { SidebarSettingsButton } from "./app-sidebar.settings";

export function SidebarFoot() {
  return (
    <SidebarMenu>
      <SidebarSettingsButton />
    </SidebarMenu>
  );
}
