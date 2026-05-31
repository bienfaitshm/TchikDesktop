"use client";

import React, { useState } from "react";
import {
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Database,
  FileText,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/renderer/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/renderer/components/ui/dropdown-menu";
import { Button } from "@/renderer/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/renderer/components/ui/tabs";
import { cn } from "@/renderer/utils";

export type ExportType = "data" | "documents";
export type ExportStatus = "idle" | "loading" | "success" | "error";

interface SidebarExportDocumentProps {
  pendingDataCount?: number;
  pendingDocsCount?: number;
  onExport?: (type: ExportType) => Promise<void> | void;
}

export function SidebarExportDocument({
  pendingDataCount = 3,
  pendingDocsCount = 5,
  onExport,
}: SidebarExportDocumentProps) {
  const { open, isMobile } = useSidebar();

  const [activeTab, setActiveTab] = useState<ExportType>("data");
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [message, setMessage] = useState<string | undefined>(undefined);

  const currentCount =
    activeTab === "data" ? pendingDataCount : pendingDocsCount;
  const isActionDisabled = status === "loading" || currentCount === 0;

  const handleExportAction = async (type: ExportType) => {
    if (status === "loading") return;

    setActiveTab(type);
    try {
      setStatus("loading");
      setMessage(`Génération du fichier…`);

      if (onExport) {
        await onExport(type);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      setStatus("success");
      setMessage("Exportation réussie !");
      setTimeout(() => {
        setStatus("idle");
        setMessage(undefined);
      }, 3000);
    } catch (err) {
      setStatus("error");
      setMessage("Une erreur est survenue");
    }
  };

  const getFeedbackIcon = (size = "size-4") => {
    if (status === "loading")
      return <Loader2 className={cn(size, "animate-spin text-primary")} />;
    if (status === "success")
      return <CheckCircle2 className={cn(size, "text-emerald-500")} />;
    if (status === "error")
      return <AlertCircle className={cn(size, "text-destructive")} />;

    return activeTab === "data" ? (
      <Database className={size} />
    ) : (
      <FileText className={size} />
    );
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem className="relative flex flex-col items-center justify-center min-h-[48px] px-2 py-1.5">
        {!open ? (
          <div className="w-full animate-in fade-in-0 zoom-in-95 duration-300 ease-out">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  tooltip="Exporter les données ou documents"
                  className={cn(
                    "w-full justify-center group transition-all duration-300",
                    status === "success" &&
                      "bg-emerald-500/10 hover:bg-emerald-500/20",
                    status === "error" &&
                      "bg-destructive/10 hover:bg-destructive/20",
                  )}
                >
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-105 relative">
                    <Download className="size-4" />
                    {(pendingDataCount > 0 || pendingDocsCount > 0) &&
                      status === "idle" && (
                        <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-sidebar animate-pulse" />
                      )}
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side={isMobile ? "bottom" : "right"}
                align="start"
                sideOffset={12}
                className="w-52 animate-in fade-in-50 slide-in-from-left-1 duration-200"
              >
                <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Éléments à exporter
                </div>
                <DropdownMenuItem
                  disabled={pendingDataCount === 0 || status === "loading"}
                  onClick={() => handleExportAction("data")}
                  className="gap-2 cursor-pointer text-xs justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Database className="size-3.5 text-muted-foreground" />
                    <span>Données brutes</span>
                  </div>
                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono font-medium">
                    {pendingDataCount}
                  </span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  disabled={pendingDocsCount === 0 || status === "loading"}
                  onClick={() => handleExportAction("documents")}
                  className="gap-2 cursor-pointer text-xs justify-between"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="size-3.5 text-muted-foreground" />
                    <span>Fichiers & Documents</span>
                  </div>
                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono font-medium">
                    {pendingDocsCount}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div
            className="w-full rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3 shadow-none backdrop-blur-sm 
            transition-all duration-300 ease-in-out
            animate-in fade-in-0 slide-in-from-left-4 duration-300 match-sidebar-motion"
          >
            {/* Onglets avec micro-animation au changement */}
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as ExportType)}
              className="w-full mb-3"
            >
              <TabsList className="grid w-full grid-cols-2 h-7 bg-sidebar-foreground/5 p-0.5 rounded-lg">
                <TabsTrigger
                  value="data"
                  className="text-[10px] font-medium h-6 rounded-md transition-all duration-200"
                >
                  Données ({pendingDataCount})
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  className="text-[10px] font-medium h-6 rounded-md transition-all duration-200"
                >
                  Docs ({pendingDocsCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* En-tête de la Card */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex flex-col space-y-0.5">
                <span className="text-[10px] font-bold text-sidebar-foreground/50 uppercase tracking-wider">
                  {activeTab === "data"
                    ? "Export Système"
                    : "Gestion Documentaire"}
                </span>
                <span className="text-xs font-semibold text-sidebar-foreground/90 leading-tight transition-all duration-300">
                  {currentCount > 0
                    ? `${currentCount} élément${currentCount > 1 ? "s" : ""} en attente`
                    : "Tout est à jour 🎉"}
                </span>
              </div>
              <div className="bg-sidebar-primary/10 text-sidebar-primary p-2 rounded-lg shrink-0 flex items-center justify-center transition-transform duration-300 hover:rotate-6">
                {getFeedbackIcon("size-4")}
              </div>
            </div>

            {/* Log de statut dynamique */}
            {message && (
              <p
                className={cn(
                  "text-[10px] font-medium mb-3 animate-in slide-in-from-top-1 duration-200",
                  status === "error" && "text-destructive",
                  status === "success" && "text-emerald-500",
                  status === "loading" &&
                    "text-sidebar-foreground/50 animate-pulse",
                )}
              >
                {message}
              </p>
            )}

            {/* Bouton principal avec effet Scale */}
            <Button
              size="sm"
              variant={status === "error" ? "destructive" : "outline"}
              disabled={isActionDisabled}
              onClick={() => handleExportAction(activeTab)}
              className={cn(
                "w-full gap-2 text-[11px] h-7.5 font-medium transition-all active:scale-[0.97] duration-200",
                status === "idle" &&
                  "bg-sidebar-background hover:bg-sidebar-accent border-sidebar-border text-sidebar-foreground",
                status === "success" &&
                  "bg-emerald-500 hover:bg-emerald-600 text-white border-transparent",
              )}
            >
              {status === "idle" && (
                <Download className="size-3 shrink-0 transition-transform group-hover:translate-y-0.5" />
              )}
              <span>
                {status === "loading" && "Traitement…"}
                {status === "success" && "Terminé"}
                {status === "error" && "Réessayer"}
                {status === "idle" && "Lancer l'export"}
              </span>
            </Button>
          </div>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
