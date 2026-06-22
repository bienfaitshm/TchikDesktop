"use client";

import * as React from "react";
import {
  Users,
  UserCheck,
  UserMinus,
  GraduationCap,
  SlidersHorizontal,
  FileText,
  TrendingUp,
  Server,
  CalendarDays,
  Activity,
  Sparkles,
  Layers,
  Percent,
  Building2,
  BarChart3,
} from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";
import { Badge } from "@/renderer/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/renderer/components/ui/tabs";
import { cn } from "@/renderer/utils";

// Custom chart components
import { ChartPie } from "../components/charts/pie";
import { BarChart } from "../components/charts/bars";
import { useDashboardStatistics } from "@/renderer/libs/queries/dashboard";
import { useSchoolContext } from "../hooks/app-config-router";
import type { ChartConfig } from "@/renderer/components/ui/chart";

// --- CONFIGURATIONS DES GRAPHES ---
const CLASS_CONFIG = {
  value: { label: "Élèves", color: "var(--color-primary)" },
} satisfies ChartConfig;
const OPTION_CONFIG = {
  value: { label: "Élèves", color: "var(--chart-1)" },
} satisfies ChartConfig;
const GENDER_CONFIG = {
  M: { label: "Garçons", color: "var(--chart-1)" },
  F: { label: "Filles", color: "var(--chart-3)" },
} satisfies ChartConfig;
const STATUS_CONFIG = {
  active: { label: "Actifs", color: "var(--color-primary)" },
  exclu: { label: "Exclus", color: "var(--color-destructive)" },
  abandon: { label: "Abandons", color: "var(--color-secondary)" },
} satisfies ChartConfig;

export const DashBoardPage = () => {
  const { schoolId, yearId } = useSchoolContext();
  const {
    genderDistribution,
    statusDistribution,
    studentsByClass,
    studentsByOption,
    summary,
  } = useDashboardStatistics({ schoolId, yearId });

  // Formater la date du jour (Juin 2026)
  const formattedDate = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background/50 text-foreground p-6 lg:p-10 max-w-[1600px] mx-auto w-full space-y-8 animate-fade-in">
      {/* 1. HERO BANNER : ACCUEIL ET CONTEXTE ÉTABLISSEMENT */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-r from-primary/10 via-muted/30 to-background p-6 sm:p-8 shadow-xs">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none hidden md:block">
          <Building2 className="size-36 text-primary" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="bg-background/80 text-primary border-primary/20 backdrop-blur-xs font-medium text-[11px] py-0.5 px-2.5 gap-1"
            >
              <Sparkles className="size-3 text-amber-500 fill-amber-500" />{" "}
              Session Active
            </Badge>
            <Badge
              variant="secondary"
              className="font-mono text-[11px] bg-muted/60"
            >
              <CalendarDays className="size-3 mr-1 opacity-70" />{" "}
              {formattedDate}
            </Badge>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Complexe Scolaire Belle Vue
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
              Province Éducationnelle :{" "}
              <span className="text-foreground font-semibold">
                Kongo Central
              </span>{" "}
              — Le moteur d'examen de **Tchik** est prêt. Les listes
              d'émargement et fiches d'élèves sont sécurisées localement dans la
              base de données de l'établissement.
            </p>
          </div>
        </div>
      </div>

      {/* 2. CORE METRICS / SCORECARDS */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 bg-card/40 backdrop-blur-xs relative overflow-hidden shadow-xs hover:border-primary/20 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                Effectif Total
              </p>
              <h3 className="text-3xl font-black tracking-tight">
                {summary?.total ?? 0}
              </h3>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 pt-1">
                <TrendingUp className="size-3 text-emerald-500" /> +12% ce
                trimestre
              </p>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-xl border border-primary/10">
              <Users className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/40 backdrop-blur-xs relative overflow-hidden shadow-xs hover:border-emerald-500/20 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                Dossiers Réguliers
              </p>
              <h3 className="text-3xl font-black tracking-tight text-emerald-500">
                {summary?.active ?? 0}
              </h3>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 pt-1">
                <UserCheck className="size-3 text-emerald-500" /> En règle pour
                les examens
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/10">
              <UserCheck className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/40 backdrop-blur-xs relative overflow-hidden shadow-xs hover:border-rose-500/20 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                Exclusions / Départs
              </p>
              <h3 className="text-3xl font-black tracking-tight text-rose-500">
                {summary?.excluded ?? 0}
              </h3>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 pt-1">
                <UserMinus className="size-3 text-rose-500" /> Mutations ou
                non-paiement
              </p>
            </div>
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/10">
              <UserMinus className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/40 backdrop-blur-xs relative overflow-hidden shadow-xs hover:border-sky-500/20 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                Taux de Rétention
              </p>
              <h3 className="text-3xl font-black tracking-tight text-sky-500">
                94.2%
              </h3>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 pt-1">
                <Percent className="size-3 text-sky-500" /> Fidélisation des
                promotions
              </p>
            </div>
            <div className="p-3 bg-sky-500/10 text-sky-500 rounded-xl border border-sky-500/10">
              <Activity className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. CORE ANALYTICS ARCHITECTURE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Graphique 1 : Volume par Promotion (Prend 8 colonnes) */}
        <Card className="border-border/60 bg-card/40 backdrop-blur-xs shadow-xs lg:col-span-8 flex flex-col justify-between overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/30 bg-muted/10 py-4 px-6">
            <div className="space-y-0.5">
              <CardTitle className="text-sm font-bold tracking-tight flex items-center gap-2">
                <Layers className="size-4 text-primary" /> Volume de
                Scolarisation par Promotion
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Effectifs cumulés répartis par niveau d'étude
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 font-medium"
            >
              <SlidersHorizontal className="size-3" /> Filtrer
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <BarChart
              data={studentsByClass}
              xAxisKey="shortName"
              bars={["value"]}
              config={CLASS_CONFIG}
              height={260}
            />
          </CardContent>
        </Card>

        {/* Panneau Système Latéral (Prend 4 colonnes) */}
        <Card className="border-border/60 bg-card/40 backdrop-blur-xs shadow-xs lg:col-span-4 flex flex-col justify-between overflow-hidden">
          <CardHeader className="border-b border-border/30 bg-muted/10 py-4 px-6">
            <CardTitle className="text-sm font-bold tracking-tight flex items-center gap-2">
              <Server className="size-4 text-primary" /> Intégrité & Statut
              local
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
                <Badge
                  variant="outline"
                  className="text-[10px] text-emerald-500 border-emerald-500/20 bg-emerald-500/5 font-mono"
                >
                  SQLite (Prêt)
                </Badge>
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
                    {genderDistribution?.find((g) => g.type === "F")?.value ??
                      0}
                  </span>
                </div>
                <div className="p-3 border border-border/40 rounded-xl bg-background/40">
                  <span className="text-[10px] text-muted-foreground block font-medium">
                    Garçons (M)
                  </span>
                  <span className="text-lg font-extrabold text-foreground">
                    {genderDistribution?.find((g) => g.type === "M")?.value ??
                      0}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique 2 : REINTEGRATION DES FILIÈRES & OPTIONS (Plein écran) */}
      <Card className="border-border/60 bg-card/40 backdrop-blur-xs shadow-xs overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/30 bg-muted/10 py-4 px-6">
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="size-4 text-primary" /> Filières & Options
              d'Étude
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Classement des effectifs d'élèves par choix d'orientation
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <BarChart
            data={studentsByOption}
            xAxisKey="label"
            bars={["value"]}
            config={OPTION_CONFIG}
            labelFormatter={(v: string) =>
              v.length > 18 ? `${v.substring(0, 16)}...` : v
            }
            height={240}
          />
        </CardContent>
      </Card>

      {/* 4. TABS FLUX SECONDAIRE */}
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

        <TabsContent
          value="inscriptions"
          className="focus-visible:outline-hidden"
        >
          <Card className="border-border/60 bg-card/40 backdrop-blur-xs overflow-hidden">
            <CardContent className="p-0 divide-y divide-border/30 text-xs sm:text-sm">
              {[
                {
                  name: "Kavira Malasi",
                  class: "3ème Générale",
                  time: "Il y a 12 min",
                  status: "Inscrit",
                  type: "success",
                },
                {
                  name: "Ilunga Ngoie",
                  class: "1ère Sec. Technique",
                  time: "Il y a 45 min",
                  status: "En attente",
                  type: "warning",
                },
                {
                  name: "Mbuyi Tshimanga",
                  class: "4ème Humanités",
                  time: "Il y a 2 heures",
                  status: "Inscrit",
                  type: "success",
                },
              ].map((student, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-xs border border-primary/10">
                      {student.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-xs sm:text-sm">
                        {student.name}
                      </p>
                      <p className="text-muted-foreground text-[11px] sm:text-xs flex items-center gap-1 mt-0.5">
                        <FileText className="size-3 opacity-60" />{" "}
                        {student.class}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <span className="text-[11px] text-muted-foreground font-mono hidden sm:block">
                      {student.time}
                    </span>
                    <Badge
                      variant={
                        student.type === "success" ? "outline" : "secondary"
                      }
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-md font-medium font-sans",
                        student.type === "success" &&
                          "text-emerald-500 border-emerald-500/20 bg-emerald-500/5",
                      )}
                    >
                      {student.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="discipline"
          className="focus-visible:outline-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/60 bg-card/40 backdrop-blur-xs p-6 flex flex-col items-center justify-center">
              <div className="space-y-1 text-center w-full pb-4 border-b border-border/20 mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Répartition Disciplinaire Globale
                </h4>
              </div>
              <ChartPie
                data={statusDistribution || []}
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
                data={genderDistribution || []}
                config={GENDER_CONFIG}
                height={200}
              />
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
