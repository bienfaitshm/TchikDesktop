"use client";
import { SidebarMenu } from "@/renderer/components/ui/sidebar";
import { SidebarExportDocument } from "./app-sidebar.document-export";
import { SidebarSettingsButton } from "./app-sidebar.settings";

export function SidebarFoot() {
  return (
    <SidebarMenu className="space-y-4">
      <SidebarExportDocument />
      <SidebarSettingsButton />
    </SidebarMenu>
  );
}
