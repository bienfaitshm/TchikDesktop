"use client";

import * as React from "react";
import {
  Users,
  UserMinus,
  UserCheck,
  GraduationCap,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  FileText,
  Clock,
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

// --- CONFIGURATIONS DES GRAPHIQUES ---
const GENDER_CONFIG = {
  M: { label: "Garçons", color: "var(--chart-1)" },
  F: { label: "Filles", color: "var(--chart-3)" },
} satisfies ChartConfig;

const STATUS_CONFIG = {
  active: { label: "Actifs", color: "var(--color-primary)" },
  exclu: { label: "Exclus", color: "var(--color-destructive)" },
  abandon: { label: "Abandons", color: "var(--color-secondary)" },
} satisfies ChartConfig;

const OPTION_CONFIG = {
  value: { label: "Élèves", color: "var(--chart-1)" },
} satisfies ChartConfig;

const CLASS_CONFIG = {
  value: { label: "Élèves", color: "var(--chart-1)" },
} satisfies ChartConfig;

const RETENTION_CONFIG = {
  value: { label: "Élèves" },
  anciens: { label: "Anciens", color: "var(--chart-1)" },
  nouveaux: { label: "Nouveaux", color: "var(--chart-5)" },
} satisfies ChartConfig;

// --- COMPOSANTS DE STRUCTURE RÉUTILISABLES ---

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  trend?: { value: number; isPositive: boolean };
  onClick?: () => void;
}

const KpiCard = ({
  title,
  value,
  icon,
  description,
  trend,
  onClick,
}: KpiCardProps) => {
  const isClickable = !!onClick;
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200 border-border/60 bg-card",
        isClickable &&
          "cursor-pointer hover:shadow-md hover:border-primary/30 active:scale-[0.99]",
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
        <div className="rounded-md bg-muted/60 p-2 text-muted-foreground border border-border/40">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
          {trend && (
            <Badge
              variant="secondary"
              className={cn(
                "text-xs font-medium px-2 py-0.5 gap-0.5 rounded-md",
                trend.isPositive
                  ? "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400"
                  : "text-destructive bg-destructive/10",
              )}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="h-3 w-3 shrink-0" />
              ) : (
                <ArrowDownRight className="h-3 w-3 shrink-0" />
              )}
              {trend.value}%
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
          <Clock className="h-3 w-3 opacity-60" />
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

const ChartCard = ({
  title,
  description,
  children,
  className,
  action,
}: ChartCardProps) => (
  <Card
    className={cn(
      "border-border/60 shadow-xs flex flex-col justify-between",
      className,
    )}
  >
    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 border-b border-border/40 bg-muted/10">
      <div className="space-y-1">
        <CardTitle className="text-sm font-semibold tracking-tight">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </CardHeader>
    <CardContent className="pt-6 flex-1 flex flex-col justify-center">
      {children}
    </CardContent>
  </Card>
);

export const DashBoardPage = () => {
  const { schoolId, yearId } = useSchoolContext();
  const {
    genderDistribution,
    statusDistribution,
    studentsByClass,
    retentionData,
    studentsByOption,
    summary,
  } = useDashboardStatistics({ schoolId, yearId });

  const trends = {
    total: { value: 12, isPositive: true },
    active: { value: 8, isPositive: true },
    excluded: { value: 3, isPositive: false },
    retention: { value: 5, isPositive: true },
  };

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10 max-w-(1600px) mx-auto w-full">
      {/* 1. TOP BAR / ACTION ZONE */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-border/40 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            Tableau de Bord
          </h1>
          <p className="text-sm text-muted-foreground">
            Supervisez les performances démographiques et analytiques de votre
            établissement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">{/*  */}</div>
      </div>

      {/* 2. CORE METRICS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Élèves"
          value={summary?.total ?? 0}
          icon={<Users className="h-4 w-4" />}
          description="Inscriptions enregistrées"
          trend={trends.total}
        />
        <KpiCard
          title="Effectif Actif"
          value={summary?.active ?? 0}
          icon={<UserCheck className="h-4 w-4 text-emerald-500" />}
          description="Dossiers validés complets"
          trend={trends.active}
        />
        <KpiCard
          title="Exclusions / Départs"
          value={summary?.excluded ?? 0}
          icon={<UserMinus className="h-4 w-4 text-destructive" />}
          description="Évolutions ce trimestre"
          trend={trends.excluded}
        />
        <KpiCard
          title="Taux de Rétention"
          value="92%"
          icon={<GraduationCap className="h-4 w-4 text-sky-500" />}
          description="Taux global de réinscription"
          trend={trends.retention}
        />
      </div>

      {/* 3. TABS CONTAINER */}
      <Tabs defaultValue="overview" className="space-y-6">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <TabsList className="bg-muted/50 p-1 rounded-lg">
            <TabsTrigger value="overview" className="text-xs px-4 py-1.5">
              Vue Analytique
            </TabsTrigger>
            <TabsTrigger value="details" className="text-xs px-4 py-1.5">
              Niveaux & Classes
            </TabsTrigger>
            <TabsTrigger value="enrollment" className="text-xs px-4 py-1.5">
              Dernierres Inscriptions
            </TabsTrigger>
          </TabsList>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filtres avancés
          </Button>
        </div>

        <TabsContent
          value="overview"
          className="space-y-6 focus-visible:outline-hidden"
        >
          {/* Main Bar Chart Layer */}
          <ChartCard
            title="Répartition Générale par Niveau"
            description="Vue d'ensemble volumétrique des élèves par classe principale"
          >
            <BarChart
              data={studentsByClass}
              xAxisKey="shortName"
              bars={["value"]}
              config={CLASS_CONFIG}
              height={320}
            />
          </ChartCard>

          {/* Secondary Analytical Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <ChartCard
              title="Fidélisation des Effectifs"
              description="Proportion d'anciens vs nouveaux inscrits"
              className="lg:col-span-4"
            >
              <ChartPie
                data={retentionData}
                config={RETENTION_CONFIG}
                centerDataInfos={{
                  total: summary?.total ?? 0,
                  totalLabel: "Élèves",
                }}
                height={220}
              />
            </ChartCard>

            <ChartCard
              title="Filières & Options d'Étude"
              description="Classement par volume de demandes d'options"
              className="lg:col-span-5"
            >
              <BarChart
                data={studentsByOption}
                xAxisKey="label"
                bars={["value"]}
                config={OPTION_CONFIG}
                labelFormatter={(v: string) =>
                  v.length > 14 ? `${v.substring(0, 12)}...` : v
                }
                height={220}
              />
            </ChartCard>

            <ChartCard
              title="Suivi de la Discipline"
              description="Synthèse de l'état opérationnel global"
              className="lg:col-span-3"
            >
              <ChartPie
                data={statusDistribution || []}
                config={STATUS_CONFIG}
                height={220}
              />
            </ChartCard>
          </div>

          {/* Tertiary Row: Démographie & Flux en direct */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <ChartCard
              title="Structure Démographique"
              description="Distribution statistique par genre"
              className="lg:col-span-4"
            >
              <ChartPie
                data={genderDistribution}
                config={GENDER_CONFIG}
                height={220}
              />
            </ChartCard>
          </div>
        </TabsContent>

        <TabsContent value="details" className="focus-visible:outline-hidden">
          <ChartCard
            title="Analyse Détaillée par Promotion"
            description="Rapport granulaire des effectifs globaux"
          >
            <BarChart
              data={studentsByClass}
              xAxisKey="shortName"
              bars={["value"]}
              config={CLASS_CONFIG}
              height={420}
            />
          </ChartCard>
        </TabsContent>
        <TabsContent
          value="enrollment"
          className="focus-visible:outline-hidden"
        >
          {/* Flux d'activité Premium remplaçant le placeholder vide */}
          <Card className="lg:col-span-8 border-border/60 shadow-xs flex flex-col justify-between">
            <CardHeader className="pb-4 border-b border-border/40 bg-muted/10">
              <CardTitle className="text-sm font-semibold tracking-tight">
                Dernières Inscriptions
              </CardTitle>
              <CardDescription className="text-xs">
                Historique en temps réel des derniers dossiers validés
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex-1">
              <div className="divide-y divide-border/40 text-sm">
                {[
                  {
                    name: "Kavira Malasi",
                    class: "3ème Générale",
                    time: "Il y a 12 min",
                    status: "Validé",
                  },
                  {
                    name: "Ilunga Ngoie",
                    class: "1ère Sec. Technique",
                    time: "Il y a 45 min",
                    status: "En attente",
                  },
                  {
                    name: "Mbuyi Tshimanga",
                    class: "4ème Humanités",
                    time: "Il y a 2 heures",
                    status: "Validé",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                        {item.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-xs">
                          {item.name}
                        </p>
                        <p className="text-muted-foreground text-xs flex items-center gap-1">
                          <FileText className="h-3 w-3 opacity-60" />{" "}
                          {item.class}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {item.time}
                      </p>
                      <Badge
                        variant={
                          item.status === "Validé" ? "outline" : "secondary"
                        }
                        className="text-[10px] px-1.5 py-0 mt-0.5"
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
