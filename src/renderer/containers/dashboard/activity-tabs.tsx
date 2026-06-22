"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/renderer/components/ui/tabs";
import { Card, CardContent } from "@/renderer/components/ui/card";
import { ChartPie } from "@/renderer/components/charts/pie";
import { Badge } from "@/renderer/components/ui/badge";
import { cn } from "@/renderer/utils";
import { FileText, UserCheck, UserPlus } from "lucide-react";
import type {
  ChartDataPoint,
  EnrollmentTDO,
} from "@/packages/@core/data-access/db/queries";

const STATUS_CONFIG = {
  active: { label: "Actifs", color: "var(--color-primary)" },
  exclu: { label: "Exclus", color: "var(--color-destructive)" },
  abandon: { label: "Abandons", color: "var(--color-secondary)" },
} as const;

const GENDER_CONFIG = {
  M: { label: "Garçons", color: "var(--chart-1)" },
  F: { label: "Filles", color: "var(--chart-3)" },
  autre: { label: "Autre", color: "var(--chart-4)" },
} as const;

interface ActivityTabsProps {
  statusDistribution: ChartDataPoint[];
  genderDistribution: ChartDataPoint[];
  enrollmentHistories?: EnrollmentTDO[];
}

export const ActivityTabs = ({
  statusDistribution,
  genderDistribution,
  enrollmentHistories = [],
}: ActivityTabsProps) => (
  <Tabs defaultValue="inscriptions" className="w-full space-y-4">
    <TabsList className="bg-muted/40 border border-border/50 p-1 rounded-xl backdrop-blur-xs">
      <TabsTrigger
        value="inscriptions"
        className="text-xs px-5 py-1.5 rounded-lg font-medium"
      >
        Dernières Activités
      </TabsTrigger>
      <TabsTrigger
        value="discipline"
        className="text-xs px-5 py-1.5 rounded-lg font-medium"
      >
        Répartition Disciplinaire
      </TabsTrigger>
    </TabsList>

    <TabsContent value="inscriptions" className="focus-visible:outline-hidden">
      <RecentActivities enrollmentHistories={enrollmentHistories} />
    </TabsContent>

    <TabsContent value="discipline" className="focus-visible:outline-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/60 bg-card/40 backdrop-blur-xs p-6 flex flex-col items-center justify-center">
          <div className="space-y-1 text-center w-full pb-4 border-b border-border/20 mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Répartition Disciplinaire Globale
            </h4>
          </div>
          <ChartPie
            data={statusDistribution}
            config={STATUS_CONFIG}
            height={200}
          />
        </Card>

        <Card className="border-border/60 bg-card/40 backdrop-blur-xs p-6 flex flex-col items-center justify-center">
          <div className="space-y-1 text-center w-full pb-4 border-b border-border/20 mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Structure Comparative par Genre
            </h4>
          </div>
          <ChartPie
            data={genderDistribution}
            config={GENDER_CONFIG}
            height={200}
          />
        </Card>
      </div>
    </TabsContent>
  </Tabs>
);

interface RecentActivitiesProps {
  enrollmentHistories?: EnrollmentTDO[];
}

export const RecentActivities = ({
  enrollmentHistories = [],
}: RecentActivitiesProps) => {
  // Formateur pour donner un rendu propre à la date de l'inscription
  const formatDate = (dateInput: string | Date) => {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return String(dateInput);

    return date.toLocaleDateString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (enrollmentHistories.length === 0) {
    return (
      <Card className="border-border/60 bg-card/40 backdrop-blur-xs p-8 text-center text-xs text-muted-foreground">
        Aucune inscription enregistrée récemment.
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card/40 backdrop-blur-xs overflow-hidden">
      <CardContent className="p-0 divide-y divide-border/30 text-xs sm:text-sm">
        {enrollmentHistories.map(
          ({ student, classroom, createdAt, isNewStudent }, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors"
            >
              {/* Gauche : Avatar & Détails élève */}
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-xs border border-primary/10 shrink-0">
                  {student.fullName?.substring(0, 2).toUpperCase() || "ÉL"}
                </div>
                <div>
                  <p className="font-bold text-foreground text-xs sm:text-sm">
                    {student.fullName}
                  </p>
                  <p className="text-muted-foreground text-[11px] sm:text-xs flex items-center gap-1 mt-0.5">
                    <FileText className="size-3 opacity-60" />{" "}
                    {classroom.identifier}
                  </p>
                </div>
              </div>

              {/* Droite : Date & Statut du type d'élève */}
              <div className="flex items-center gap-4 text-right">
                <span className="text-[11px] text-muted-foreground font-mono hidden sm:block">
                  Le {formatDate(createdAt)}
                </span>

                <Badge
                  variant={isNewStudent ? "outline" : "secondary"}
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-md font-medium font-sans flex items-center gap-1",
                    isNewStudent
                      ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
                      : "text-sky-500 border-sky-500/20 bg-sky-500/5",
                  )}
                >
                  {isNewStudent ? (
                    <>
                      <UserPlus className="size-2.5" /> Nouveau
                    </>
                  ) : (
                    <>
                      <UserCheck className="size-2.5" /> Ancien
                    </>
                  )}
                </Badge>
              </div>
            </div>
          ),
        )}
      </CardContent>
    </Card>
  );
};
