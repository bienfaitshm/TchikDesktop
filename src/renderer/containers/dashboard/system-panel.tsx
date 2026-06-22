"use client";

import { Server } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/renderer/components/ui/card";
import { Badge as UIBadge } from "@/renderer/components/ui/badge";
import type { ChartDataPoint } from "@/packages/@core/data-access/db/queries";

interface SystemPanelProps {
  genderData: ChartDataPoint[];
}

export const SystemPanel = ({ genderData }: SystemPanelProps) => {
  const femaleCount = genderData.find((g) => g.label === "feminin")?.value ?? 0;
  const maleCount = genderData.find((g) => g.label === "masculin")?.value ?? 0;

  return (
    <Card className="border-border/60 bg-card/40 backdrop-blur-xs shadow-xs lg:col-span-4 flex flex-col justify-between overflow-hidden">
      <CardHeader className="border-b border-border/30 bg-muted/10 py-4 px-6">
        <CardTitle className="text-sm font-bold tracking-tight flex items-center gap-2">
          <Server className="size-4 text-primary" /> Intégrité & Statut local
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          État de la structure de stockage locale
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 space-y-4 font-mono text-xs">
        <div className="p-3 rounded-xl border border-border/40 bg-muted/20 space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-sans font-medium">
              Base de Données :
            </span>
            <UIBadge
              variant="outline"
              className="text-[10px] text-emerald-500 border-emerald-500/20 bg-emerald-500/5 font-mono"
            >
              SQLite (Prêt)
            </UIBadge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-sans font-medium">
              Dernier Backup :
            </span>
            <span className="text-foreground text-[11px] font-semibold">
              Aujourd'hui, 18:45
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <h4 className="text-[11px] font-bold font-sans uppercase tracking-wider text-muted-foreground">
            Aperçu Démographique
          </h4>
          <div className="grid grid-cols-2 gap-3 font-sans">
            <div className="p-3 border border-border/40 rounded-xl bg-background/40">
              <span className="text-[10px] text-muted-foreground block font-medium">
                Filles (F)
              </span>
              <span className="text-lg font-extrabold text-foreground">
                {femaleCount}
              </span>
            </div>
            <div className="p-3 border border-border/40 rounded-xl bg-background/40">
              <span className="text-[10px] text-muted-foreground block font-medium">
                Garçons (M)
              </span>
              <span className="text-lg font-extrabold text-foreground">
                {maleCount}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
